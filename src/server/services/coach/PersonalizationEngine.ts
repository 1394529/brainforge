import {
  BrainSkill,
  ChallengeType,
  CoachRecommendation,
  PerformanceSummary,
  PersonalizationProfile,
} from '../../../types';
import { Database } from '../../db';
import { SKILL_TO_PRIMARY_TYPE } from './PerformanceAggregator';

export class PersonalizationEngine {
  /**
   * Generates deterministic recommendations based on aggregated performance and business rules.
   */
  public static generateRecommendations(
    userId: string,
    summary: PerformanceSummary,
    language: 'fr' | 'en' = 'fr'
  ): {
    recommendations: CoachRecommendation[];
    profile: PersonalizationProfile;
    suggestedChallenge?: {
      id: string;
      title: string;
      type: ChallengeType;
      difficulty: number;
      reason: string;
    };
  } {
    const db = Database.getInstance();
    const allChallenges = db.getAllChallengesRaw().filter((c) => c.status === 'published');

    // 1. Cold start scenario (< 5 challenges)
    if (summary.isColdStart) {
      const defaultSkill: BrainSkill = 'Memory';
      const defaultType: ChallengeType = 'memory';
      const defaultDifficulty = 1;

      // Find an introductory challenge
      const candidate =
        allChallenges.find((c) => c.type === defaultType && c.difficulty === defaultDifficulty) ||
        allChallenges[0];

      const coldRec: CoachRecommendation = {
        id: `rec-cold-${Date.now()}`,
        type: 'return_to_activity',
        skill: defaultSkill,
        challengeType: defaultType,
        difficulty: defaultDifficulty,
        priority: 'high',
        reason:
          language === 'fr'
            ? 'Complétez vos 5 premiers défis pour débloquer votre profil de personnalisation.'
            : 'Complete your first 5 challenges to unlock your personalized coach profile.',
        suggestedChallengeId: candidate?.id,
        suggestedChallengeTitle: candidate
          ? language === 'fr'
            ? candidate.titleFr
            : candidate.titleEn
          : undefined,
      };

      const profile: PersonalizationProfile = {
        userId,
        primaryFocusSkill: defaultSkill,
        strongestSkill: defaultSkill,
        preferredChallengeType: defaultType,
        recommendedDifficulty: defaultDifficulty,
        confidence: 'low',
        lastCalculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        recommendations: [coldRec],
        profile,
        suggestedChallenge: candidate
          ? {
              id: candidate.id,
              title: language === 'fr' ? candidate.titleFr : candidate.titleEn,
              type: candidate.type,
              difficulty: candidate.difficulty,
              reason:
                language === 'fr'
                  ? 'Défi recommandé pour démarrer votre profil d’entraînement.'
                  : 'Recommended challenge to calibrate your workout profile.',
            }
          : undefined,
      };
    }

    // 2. Active user scenario with performance data
    const primaryFocusSkill: BrainSkill =
      summary.focusSkills[0] || summary.strongestSkills[0] || 'Reaction';
    const secondaryFocusSkill: BrainSkill | undefined = summary.focusSkills[1];
    const strongestSkill: BrainSkill = summary.strongestSkills[0] || 'Memory';

    const focusType = SKILL_TO_PRIMARY_TYPE[primaryFocusSkill];
    const strengthType = SKILL_TO_PRIMARY_TYPE[strongestSkill];

    // Determine recommended difficulty based on accuracy
    const focusSkillStats = summary.skills[primaryFocusSkill];
    let recommendedDifficulty = 2;

    if (focusSkillStats && focusSkillStats.totalAttempts > 0) {
      if (focusSkillStats.averageAccuracy >= 85) {
        recommendedDifficulty = 3;
      } else if (focusSkillStats.averageAccuracy < 60) {
        recommendedDifficulty = 1;
      } else {
        recommendedDifficulty = 2;
      }
    } else if (summary.overallAverageAccuracy >= 85) {
      recommendedDifficulty = 3;
    }

    // Build structured recommendations
    const recommendations: CoachRecommendation[] = [];

    // Rec 1: Focus area practice
    recommendations.push({
      id: `rec-focus-${Date.now()}-1`,
      type: 'practice_skill',
      skill: primaryFocusSkill,
      challengeType: focusType,
      difficulty: recommendedDifficulty,
      priority: 'high',
      reason:
        language === 'fr'
          ? `Vos performances récentes en ${primaryFocusSkill} peuvent être renforcées avec des sessions régulières.`
          : `Your recent performances in ${primaryFocusSkill} can be strengthened with regular sessions.`,
    });

    // Rec 2: Maintain strength
    if (strongestSkill !== primaryFocusSkill) {
      const strengthStats = summary.skills[strongestSkill];
      const strengthDifficulty =
        strengthStats && strengthStats.averageAccuracy >= 90
          ? Math.min(5, recommendedDifficulty + 1)
          : recommendedDifficulty;

      recommendations.push({
        id: `rec-str-${Date.now()}-2`,
        type: strengthStats && strengthStats.averageAccuracy >= 90 ? 'increase_difficulty' : 'maintain_strength',
        skill: strongestSkill,
        challengeType: strengthType,
        difficulty: strengthDifficulty,
        priority: 'medium',
        reason:
          language === 'fr'
            ? `Vous maintenez une excellente précision en ${strongestSkill}. Continuez pour préserver cet avantage.`
            : `You maintain high accuracy in ${strongestSkill}. Keep practicing to sustain this advantage.`,
      });
    }

    // Rec 3: Daily short goal
    recommendations.push({
      id: `rec-goal-${Date.now()}-3`,
      type: 'daily_goal',
      skill: primaryFocusSkill,
      challengeType: focusType,
      difficulty: recommendedDifficulty,
      priority: 'medium',
      reason:
        language === 'fr'
          ? 'Complétez 1 ou 2 épreuves courtes aujourd’hui pour maintenir votre régularité.'
          : 'Complete 1 or 2 quick workouts today to maintain your consistency.',
    });

    // Find suggested challenge matching primary focus and difficulty
    let candidate = allChallenges.find(
      (c) => c.type === focusType && c.difficulty === recommendedDifficulty
    );

    // Fallback within same type
    if (!candidate) {
      candidate = allChallenges.find((c) => c.type === focusType);
    }

    // Fallback to any challenge
    if (!candidate && allChallenges.length > 0) {
      candidate = allChallenges[0];
    }

    if (candidate) {
      recommendations[0].suggestedChallengeId = candidate.id;
      recommendations[0].suggestedChallengeTitle =
        language === 'fr' ? candidate.titleFr : candidate.titleEn;
    }

    const confidence: 'high' | 'medium' | 'low' =
      summary.totalCompleted >= 15 ? 'high' : summary.totalCompleted >= 5 ? 'medium' : 'low';

    const profile: PersonalizationProfile = {
      userId,
      primaryFocusSkill,
      secondaryFocusSkill,
      strongestSkill,
      preferredChallengeType: focusType,
      recommendedDifficulty,
      confidence,
      lastCalculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const suggestedChallenge = candidate
      ? {
          id: candidate.id,
          title: language === 'fr' ? candidate.titleFr : candidate.titleEn,
          type: candidate.type,
          difficulty: candidate.difficulty,
          reason:
            language === 'fr'
              ? `Exercice sélectionné pour développer vos performances en ${primaryFocusSkill}.`
              : `Challenge selected to train your performance in ${primaryFocusSkill}.`,
        }
      : undefined;

    return {
      recommendations,
      profile,
      suggestedChallenge,
    };
  }
}
