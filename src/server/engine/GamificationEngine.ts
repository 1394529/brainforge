import { GamificationResult, ScoreResult, ChallengeType, Locale } from '../../types';
import { XpEngine } from './XpEngine';
import { LevelService } from './LevelService';

export class GamificationEngine {
  public static processGamification(
    score: ScoreResult,
    previousTotalXp: number,
    difficulty: number = 1
  ): GamificationResult {
    const xpEarned = XpEngine.calculateXp(score, { difficulty });
    const newTotalXp = previousTotalXp + xpEarned;

    const previousProgression = LevelService.calculateLevel(previousTotalXp);
    const newProgression = LevelService.calculateLevel(newTotalXp);

    const leveledUp = newProgression.currentLevel > previousProgression.currentLevel;

    return {
      xpEarned,
      totalXp: newTotalXp,
      currentLevel: newProgression.currentLevel,
      levelProgress: newProgression.progressPercentage,
      leveledUp,
      previousLevel: previousProgression.currentLevel,
    };
  }

  /**
   * Generates strictly factual feedback based on challenge type and metrics.
   * Never makes scientific or clinical claims.
   */
  public static generateFeedback(
    type: ChallengeType,
    score: ScoreResult,
    locale: Locale = 'en'
  ): { title: string; message: string } {
    const isFr = locale === 'fr';

    switch (type) {
      case 'quiz': {
        const isCorrect = score.isCorrect ?? (score.percentage === 100);
        return {
          title: isCorrect
            ? (isFr ? 'Correct !' : 'Correct!')
            : (isFr ? 'Incorrect' : 'Incorrect'),
          message: isCorrect
            ? (isFr ? 'Réponse validée avec succès.' : 'Answer validated successfully.')
            : (isFr ? 'La réponse sélectionnée était inexacte.' : 'The selected option was incorrect.'),
        };
      }

      case 'pattern': {
        const isCorrect = score.isCorrect ?? (score.percentage === 100);
        return {
          title: isCorrect
            ? (isFr ? 'Séquence identifiée' : 'Pattern recognized')
            : (isFr ? 'Séquence non reconnue' : 'Try again'),
          message: isCorrect
            ? (isFr ? 'Logique de suite résolue avec exactitude.' : 'Sequence logic solved accurately.')
            : (isFr ? 'L’élément choisi ne correspond pas à la règle de la séquence.' : 'The chosen option does not follow the sequence rule.'),
        };
      }

      case 'memory': {
        const correct = score.metrics?.correctItems ?? 0;
        const total = score.metrics?.totalItems ?? 5;
        const accuracyPct = score.percentage;
        return {
          title: isFr ? `${correct} / ${total} corrects` : `${correct} / ${total} correct`,
          message: isFr
            ? `Précision de restitution : ${accuracyPct}%.`
            : `Recall accuracy: ${accuracyPct}%.`,
        };
      }

      case 'reaction': {
        if (score.metrics?.isFalseStart) {
          return {
            title: isFr ? 'Faux départ !' : 'False start!',
            message: isFr
              ? 'Clic détecté avant le signal. Aucun point accordé.'
              : 'Click detected before stimulus appeared. No points awarded.',
          };
        }
        const rt = score.metrics?.reactionTimeMs ?? score.durationMs ?? 0;
        return {
          title: isFr ? `Temps de réaction : ${rt} ms` : `Reaction time: ${rt} ms`,
          message: isFr
            ? `Mesure enregistrée pour cette épreuve : ${rt} millisecondes.`
            : `Recorded stimulus response time: ${rt} milliseconds.`,
        };
      }
    }
  }
}
