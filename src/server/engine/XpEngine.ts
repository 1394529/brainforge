import { ScoreResult } from '../../types';

export interface XpCalculationOptions {
  difficulty?: number;
  speedBonusEligible?: boolean;
}

export class XpEngine {
  /**
   * Calculates XP earned based on the normalized ScoreResult.
   * Specification:
   * Base XP = score percentage (e.g. 100% -> 100 XP, 80% -> 80 XP, 0% -> 0 XP)
   * If false start or isCorrect === false on boolean tasks, XP reflects percentage.
   */
  public static calculateXp(score: ScoreResult, _options: XpCalculationOptions = {}): number {
    if (score.metrics?.isFalseStart) {
      return 0;
    }

    // Base XP corresponds directly to percentage in V1.3
    const base = Math.max(0, Math.min(100, Math.round(score.percentage)));

    // Architecture is prepared for future difficulty/speed multipliers:
    // const difficultyMultiplier = 1 + ((options.difficulty || 1) - 1) * 0.1;
    // return Math.round(base * difficultyMultiplier);

    return base;
  }
}
