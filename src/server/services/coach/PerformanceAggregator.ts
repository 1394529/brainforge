import {
  BrainSkill,
  ALL_BRAIN_SKILLS,
  ChallengeAttemptRecord,
  ChallengeType,
  PerformanceSummary,
  SkillStats,
  TrendDirection,
} from '../../../types';

export const COLD_START_MIN_CHALLENGES = 5;
export const RECENT_WINDOW_SIZE = 20;

// Mapping between ChallengeType and BrainForge cognitive skills
export const CHALLENGE_TYPE_TO_SKILLS: Record<ChallengeType, BrainSkill[]> = {
  memory: ['Memory', 'Observation'],
  pattern: ['Pattern Recognition', 'Logic'],
  reaction: ['Reaction', 'Attention'],
  quiz: ['General Knowledge', 'Mental Math', 'Vocabulary', 'Critical Thinking'],
};

export const SKILL_TO_PRIMARY_TYPE: Record<BrainSkill, ChallengeType> = {
  'Memory': 'memory',
  'Observation': 'memory',
  'Pattern Recognition': 'pattern',
  'Logic': 'pattern',
  'Reaction': 'reaction',
  'Attention': 'reaction',
  'General Knowledge': 'quiz',
  'Mental Math': 'quiz',
  'Vocabulary': 'quiz',
  'Critical Thinking': 'quiz',
};

export class PerformanceAggregator {
  /**
   * Aggregates attempts into a structured PerformanceSummary.
   * Respects cold start threshold and privacy rules.
   */
  public static aggregate(attempts: ChallengeAttemptRecord[]): PerformanceSummary {
    const totalCompleted = attempts.length;
    const isColdStart = totalCompleted < COLD_START_MIN_CHALLENGES;

    // Sort chronologically (oldest to newest)
    const sorted = [...attempts].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Recent window: up to RECENT_WINDOW_SIZE attempts
    const recentWindow = sorted.slice(-RECENT_WINDOW_SIZE);

    const overallAverageScore =
      totalCompleted > 0
        ? Math.round(sorted.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalCompleted)
        : 0;

    const overallAverageAccuracy =
      totalCompleted > 0
        ? Math.round(
            sorted.reduce((acc, a) => acc + (a.metrics?.accuracy ?? a.percentage ?? 0), 0) /
              totalCompleted
          )
        : 0;

    const overallAverageDurationMs =
      totalCompleted > 0
        ? Math.round(sorted.reduce((acc, a) => acc + (a.durationMs || 0), 0) / totalCompleted)
        : 0;

    // Group attempts by challenge type
    const attemptsByType: Record<ChallengeType, ChallengeAttemptRecord[]> = {
      quiz: [],
      pattern: [],
      memory: [],
      reaction: [],
    };

    for (const a of sorted) {
      if (a.challengeType && attemptsByType[a.challengeType]) {
        attemptsByType[a.challengeType].push(a);
      }
    }

    // Build skill statistics for each of the 10 skills
    const skills = {} as Record<BrainSkill, SkillStats>;

    for (const skill of ALL_BRAIN_SKILLS) {
      const primaryType = SKILL_TO_PRIMARY_TYPE[skill];
      const skillAttempts = attemptsByType[primaryType] || [];
      const count = skillAttempts.length;

      if (count === 0) {
        skills[skill] = {
          skill,
          challengeType: primaryType,
          totalAttempts: 0,
          averageScore: 0,
          averageAccuracy: 0,
          averageDurationMs: 0,
          recentScore: 0,
          recentAccuracy: 0,
          trend: 'insufficient_data',
        };
        continue;
      }

      const avgScore = Math.round(
        skillAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / count
      );
      const avgAccuracy = Math.round(
        skillAttempts.reduce((acc, a) => acc + (a.metrics?.accuracy ?? a.percentage ?? 0), 0) /
          count
      );
      const avgDuration = Math.round(
        skillAttempts.reduce((acc, a) => acc + (a.durationMs || 0), 0) / count
      );

      // Recent performance for this skill (last 5 attempts)
      const recentSkillAttempts = skillAttempts.slice(-5);
      const recentScore = Math.round(
        recentSkillAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) /
          recentSkillAttempts.length
      );
      const recentAccuracy = Math.round(
        recentSkillAttempts.reduce(
          (acc, a) => acc + (a.metrics?.accuracy ?? a.percentage ?? 0),
          0
        ) / recentSkillAttempts.length
      );

      // Trend calculation: compare first half vs second half if at least 3 attempts
      let trend: TrendDirection = 'insufficient_data';
      if (count >= 3) {
        const mid = Math.floor(count / 2);
        const olderHalf = skillAttempts.slice(0, mid);
        const newerHalf = skillAttempts.slice(mid);

        const olderAvg =
          olderHalf.reduce((acc, a) => acc + a.percentage, 0) / olderHalf.length;
        const newerAvg =
          newerHalf.reduce((acc, a) => acc + a.percentage, 0) / newerHalf.length;

        const diff = newerAvg - olderAvg;
        if (diff >= 5) {
          trend = 'improving';
        } else if (diff <= -5) {
          trend = 'declining';
        } else {
          trend = 'stable';
        }
      }

      skills[skill] = {
        skill,
        challengeType: primaryType,
        totalAttempts: count,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
        averageDurationMs: avgDuration,
        recentScore,
        recentAccuracy,
        trend,
      };
    }

    // Identify strengths and focus areas (only if not cold start)
    const strongestSkills: BrainSkill[] = [];
    const focusSkills: BrainSkill[] = [];

    if (!isColdStart) {
      // Filter skills with at least 1 attempt
      const activeSkills = ALL_BRAIN_SKILLS.filter((s) => skills[s].totalAttempts > 0);

      // Sort by accuracy/score descending for strengths
      const sortedByPerformance = [...activeSkills].sort((a, b) => {
        const scoreA = skills[a].averageAccuracy * 0.7 + skills[a].averageScore * 0.3;
        const scoreB = skills[b].averageAccuracy * 0.7 + skills[b].averageScore * 0.3;
        return scoreB - scoreA;
      });

      // Top 2-3 performing skills
      for (const skill of sortedByPerformance) {
        if (skills[skill].averageAccuracy >= 75 || strongestSkills.length === 0) {
          strongestSkills.push(skill);
          if (strongestSkills.length >= 3) break;
        }
      }

      // Focus areas: lowest performing or declining or unpracticed
      const sortedAscending = [...activeSkills].sort((a, b) => {
        const scoreA = skills[a].recentAccuracy * 0.7 + skills[a].recentScore * 0.3;
        const scoreB = skills[b].recentAccuracy * 0.7 + skills[b].recentScore * 0.3;
        return scoreA - scoreB;
      });

      for (const skill of sortedAscending) {
        if (!strongestSkills.includes(skill)) {
          focusSkills.push(skill);
          if (focusSkills.length >= 2) break;
        }
      }

      // If no focus skills found yet from active, pick least practiced
      if (focusSkills.length === 0) {
        const unpracticed = ALL_BRAIN_SKILLS.filter((s) => skills[s].totalAttempts === 0);
        if (unpracticed.length > 0) {
          focusSkills.push(unpracticed[0]);
        }
      }
    }

    return {
      totalCompleted,
      overallAverageScore,
      overallAverageAccuracy,
      overallAverageDurationMs,
      skills,
      strongestSkills,
      focusSkills,
      recentAttemptsCount: recentWindow.length,
      isColdStart,
    };
  }
}
