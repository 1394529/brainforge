import { ScoreMetrics, ScoreResult } from '../../types';

export class ScoringEngine {
  /**
   * Normalizes raw score, max score and percentage to ensure strict bounds:
   * 0 <= rawScore <= maxScore
   * 0 <= percentage <= 100
   */
  public static normalizeScore(params: {
    rawScore: number;
    maxScore: number;
    isCorrect?: boolean;
    durationMs?: number;
    metrics?: ScoreMetrics;
    metadata?: Record<string, unknown>;
  }): ScoreResult {
    const { maxScore, isCorrect, durationMs, metrics, metadata } = params;

    if (maxScore <= 0) {
      throw new Error('maxScore must be strictly greater than 0');
    }

    // Clamp rawScore within [0, maxScore]
    const clampedRawScore = Math.max(0, Math.min(params.rawScore, maxScore));

    // Calculate percentage and clamp to [0, 100]
    const percentage = Math.max(0, Math.min(100, Math.round((clampedRawScore / maxScore) * 100)));

    return {
      rawScore: clampedRawScore,
      maxScore,
      percentage,
      isCorrect,
      durationMs: durationMs !== undefined ? Math.max(0, Math.round(durationMs)) : undefined,
      metrics,
      metadata,
    };
  }

  /**
   * Centralized reaction time thresholds according to specification:
   * < 200 ms       → 100
   * 200–299 ms     → 90
   * 300–399 ms     → 80
   * 400–499 ms     → 70
   * 500–599 ms     → 60
   * 600–799 ms     → 40
   * 800–999 ms     → 20
   * >= 1000 ms     → 0
   */
  public static calculateReactionScore(reactionTimeMs: number, isFalseStart: boolean): ScoreResult {
    if (isFalseStart) {
      return this.normalizeScore({
        rawScore: 0,
        maxScore: 100,
        isCorrect: false,
        durationMs: reactionTimeMs,
        metrics: {
          reactionTimeMs,
          isFalseStart: true,
          accuracy: 0,
        },
      });
    }

    let rawScore = 0;
    if (reactionTimeMs < 200) {
      rawScore = 100;
    } else if (reactionTimeMs <= 299) {
      rawScore = 90;
    } else if (reactionTimeMs <= 399) {
      rawScore = 80;
    } else if (reactionTimeMs <= 499) {
      rawScore = 70;
    } else if (reactionTimeMs <= 599) {
      rawScore = 60;
    } else if (reactionTimeMs <= 799) {
      rawScore = 40;
    } else if (reactionTimeMs <= 999) {
      rawScore = 20;
    } else {
      rawScore = 0;
    }

    return this.normalizeScore({
      rawScore,
      maxScore: 100,
      isCorrect: rawScore > 0,
      durationMs: reactionTimeMs,
      metrics: {
        reactionTimeMs,
        isFalseStart: false,
        accuracy: rawScore > 0 ? 1 : 0,
      },
    });
  }
}
