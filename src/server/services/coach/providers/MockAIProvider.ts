import { AIProvider } from './AIProvider';
import { CoachContext, CoachResponse, SessionFeedbackContext } from '../../../../types';

export class MockAIProvider implements AIProvider {
  public readonly name = 'MockAIProvider';

  public async generateCoachInsight(context: CoachContext): Promise<CoachResponse> {
    const isFr = context.language === 'fr';

    if (context.isColdStart) {
      return {
        summary: isFr
          ? 'Bienvenue sur BrainForge ! Nous avons besoin de quelques défis supplémentaires pour personnaliser vos recommandations.'
          : 'Welcome to BrainForge! We need a few more challenges to personalize your recommendations.',
        strengths: isFr ? ['Premiers pas prometteurs'] : ['Promising first steps'],
        focusAreas: isFr ? ['Découverte des différentes épreuves'] : ['Discovering diverse challenges'],
        recommendations: context.recommendations.map((r) => ({
          type: r.type,
          skill: r.skill,
          challengeType: r.challengeType,
          difficulty: r.difficulty,
          reason: r.reason,
          priority: r.priority,
        })),
        encouragement: isFr
          ? 'Complétez votre premier entraînement pour lancer votre série et calibrer vos objectifs !'
          : 'Complete your first workout to start your streak and calibrate your goals!',
        confidence: 'low',
        dailyGoal: isFr
          ? 'Terminez 2 défis aujourd’hui pour établir votre profil initial.'
          : 'Finish 2 challenges today to establish your baseline profile.',
      };
    }

    const primaryStrength = context.skillPerformance?.[0]?.skill || 'Memory';
    const primaryFocus = context.skillPerformance?.slice(-1)?.[0]?.skill || 'Reaction';

    return {
      summary: isFr
        ? `Excellente régularité ! Vos exercices démontrent une solide maîtrise en ${primaryStrength}, avec une moyenne globale de ${context.recentPerformance.averageScore} points.`
        : `Great consistency! Your workouts demonstrate solid mastery in ${primaryStrength}, with an overall average score of ${context.recentPerformance.averageScore} points.`,
      strengths: isFr
        ? [`Précision élevée en ${primaryStrength}`, `Régularité active (Série : ${context.streak} j)`]
        : [`High accuracy in ${primaryStrength}`, `Active consistency (Streak: ${context.streak} d)`],
      focusAreas: isFr
        ? [`Optimisation du temps de réponse en ${primaryFocus}`]
        : [`Response time optimization in ${primaryFocus}`],
      recommendations: context.recommendations.map((r) => ({
        type: r.type,
        skill: r.skill,
        challengeType: r.challengeType,
        difficulty: r.difficulty,
        reason: r.reason,
        priority: r.priority,
      })),
      encouragement: isFr
        ? '5 minutes par jour suffisent pour entretenir vos réflexes et renforcer votre vivacité d’esprit !'
        : '5 minutes a day are all it takes to maintain your reflexes and sharpen your focus!',
      confidence: context.recentPerformance.totalAttempts >= 10 ? 'high' : 'medium',
      dailyGoal: isFr
        ? `Relevez 1 défi en ${primaryFocus} et 1 défi du jour pour consolider vos acquis.`
        : `Tackle 1 challenge in ${primaryFocus} and 1 daily challenge to reinforce your skills.`,
      suggestedChallenge: context.recommendations[0]?.suggestedChallengeId
        ? {
            id: context.recommendations[0].suggestedChallengeId,
            title: context.recommendations[0].suggestedChallengeTitle || 'Challenge',
            type: context.recommendations[0].challengeType,
            difficulty: context.recommendations[0].difficulty,
            reason: context.recommendations[0].reason,
          }
        : undefined,
    };
  }

  public async generateSessionFeedback(context: SessionFeedbackContext): Promise<string> {
    const isFr = context.language === 'fr';

    if (context.isPersonalBest) {
      return isFr
        ? `Nouveau record personnel sur cette épreuve (${context.scorePercentage}%) ! Excellente vitesse et précision.`
        : `New personal best on this challenge (${context.scorePercentage}%)! Outstanding speed and accuracy.`;
    }

    if (context.scorePercentage >= 80) {
      return isFr
        ? `Belle session ! Votre précision de ${context.scorePercentage}% est au-dessus de vos standards récents.`
        : `Great session! Your accuracy of ${context.scorePercentage}% is above your recent standards.`;
    }

    if (context.scorePercentage >= 50) {
      return isFr
        ? `Session complétée avec succès (${context.scorePercentage}%). La répétition régulière stabilise vos réflexes.`
        : `Session completed successfully (${context.scorePercentage}%). Consistent practice stabilizes your reflexes.`;
    }

    return isFr
      ? 'Chaque tentative renforce vos automatismes. Prenez un court instant et relancez un défi adapté !'
      : 'Every attempt sharpens your reflexes. Take a short breath and try a calibrated challenge!';
  }
}
