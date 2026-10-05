import { LevelProgress } from '../../types';

export class LevelService {
  /**
   * Thresholds for each level defined in BrainForge V1.3 specification:
   * Level 1: 0 XP
   * Level 2: 100 XP
   * Level 3: 250 XP
   * Level 4: 450 XP
   * Level 5: 700 XP
   * Level 6: 1000 XP
   * Extended linearly/quadratically for higher levels
   */
  private static readonly BASE_THRESHOLDS: number[] = [
    0,     // Level 1
    100,   // Level 2
    250,   // Level 3
    450,   // Level 4
    700,   // Level 5
    1000,  // Level 6
    1350,  // Level 7
    1750,  // Level 8
    2200,  // Level 9
    2700,  // Level 10
  ];

  public static getThresholdForLevel(level: number): number {
    if (level <= 1) return 0;
    const index = level - 1;
    if (index < this.BASE_THRESHOLDS.length) {
      return this.BASE_THRESHOLDS[index];
    }
    // Dynamic progression beyond level 10 (+600 XP per level)
    const base10 = this.BASE_THRESHOLDS[this.BASE_THRESHOLDS.length - 1];
    return base10 + (level - 10) * 600;
  }

  public static calculateLevel(totalXp: number): LevelProgress {
    const xp = Math.max(0, Math.floor(totalXp));

    let currentLevel = 1;
    while (xp >= this.getThresholdForLevel(currentLevel + 1)) {
      currentLevel++;
    }

    const xpForCurrentLevel = this.getThresholdForLevel(currentLevel);
    const xpForNextLevel = this.getThresholdForLevel(currentLevel + 1);

    const span = xpForNextLevel - xpForCurrentLevel;
    const progressInSpan = xp - xpForCurrentLevel;
    const progressPercentage = span > 0
      ? Math.min(100, Math.max(0, Math.round((progressInSpan / span) * 100)))
      : 100;

    return {
      currentLevel,
      totalXp: xp,
      xpForCurrentLevel,
      xpForNextLevel,
      progressPercentage,
    };
  }
}
