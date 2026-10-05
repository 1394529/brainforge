import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LevelService } from '../src/server/engine/LevelService';
import { XpEngine } from '../src/server/engine/XpEngine';
import { GamificationEngine } from '../src/server/engine/GamificationEngine';

describe('Gamification & Level System', () => {
  it('calculates levels and thresholds according to V1.3 specifications', () => {
    // Level 1 -> 0 XP
    const p0 = LevelService.calculateLevel(0);
    assert.strictEqual(p0.currentLevel, 1);
    assert.strictEqual(p0.xpForCurrentLevel, 0);
    assert.strictEqual(p0.xpForNextLevel, 100);
    assert.strictEqual(p0.progressPercentage, 0);

    // Level 2 -> 100 XP
    const p100 = LevelService.calculateLevel(100);
    assert.strictEqual(p100.currentLevel, 2);
    assert.strictEqual(p100.xpForCurrentLevel, 100);
    assert.strictEqual(p100.xpForNextLevel, 250);
    assert.strictEqual(p100.progressPercentage, 0);

    // Level 3 -> 250 XP
    const p250 = LevelService.calculateLevel(250);
    assert.strictEqual(p250.currentLevel, 3);
    assert.strictEqual(p250.xpForCurrentLevel, 250);
    assert.strictEqual(p250.xpForNextLevel, 450);

    // Mid-level 3 (350 XP: (350-250)/(450-250) = 100/200 = 50%)
    const p350 = LevelService.calculateLevel(350);
    assert.strictEqual(p350.currentLevel, 3);
    assert.strictEqual(p350.progressPercentage, 50);

    // Level 4 -> 450 XP
    const p450 = LevelService.calculateLevel(450);
    assert.strictEqual(p450.currentLevel, 4);

    // Level 5 -> 700 XP
    const p700 = LevelService.calculateLevel(700);
    assert.strictEqual(p700.currentLevel, 5);

    // Level 6 -> 1000 XP
    const p1000 = LevelService.calculateLevel(1000);
    assert.strictEqual(p1000.currentLevel, 6);
  });

  it('awards XP strictly based on score percentage', () => {
    const perfectScore = {
      rawScore: 100,
      maxScore: 100,
      percentage: 100,
      isCorrect: true,
    };
    assert.strictEqual(XpEngine.calculateXp(perfectScore), 100);

    const partialScore = {
      rawScore: 80,
      maxScore: 100,
      percentage: 80,
      isCorrect: false,
    };
    assert.strictEqual(XpEngine.calculateXp(partialScore), 80);

    const zeroScore = {
      rawScore: 0,
      maxScore: 100,
      percentage: 0,
      isCorrect: false,
    };
    assert.strictEqual(XpEngine.calculateXp(zeroScore), 0);
  });

  it('denies XP on false start', () => {
    const falseStartScore = {
      rawScore: 0,
      maxScore: 100,
      percentage: 0,
      metrics: { isFalseStart: true },
    };
    assert.strictEqual(XpEngine.calculateXp(falseStartScore), 0);
  });

  it('detects level up correctly during GamificationEngine processing', () => {
    // Player starts at 80 XP (Level 1). Earns 50 XP -> 130 XP (Crosses 100 XP into Level 2)
    const result = GamificationEngine.processGamification(
      { rawScore: 50, maxScore: 100, percentage: 50 },
      80,
      1
    );

    assert.strictEqual(result.xpEarned, 50);
    assert.strictEqual(result.totalXp, 130);
    assert.strictEqual(result.currentLevel, 2);
    assert.strictEqual(result.previousLevel, 1);
    assert.strictEqual(result.leveledUp, true);
  });
});

describe('V1.4 Daily Challenge, Streak & Gamification Loop', () => {
  it('guarantees deterministic daily challenge for a given date across users', async () => {
    const { Database } = await import('../src/server/db/index');
    Database.resetInstance();
    const db = Database.getInstance();

    const dateStr = '2026-09-27';
    const statusUserA = db.getUserDailyChallengeStatus('user-a', dateStr);
    const statusUserB = db.getUserDailyChallengeStatus('user-b', dateStr);

    assert.ok(statusUserA.challenge, 'Daily challenge must be present');
    assert.ok(statusUserB.challenge, 'Daily challenge must be present');
    assert.strictEqual(
      statusUserA.challenge.id,
      statusUserB.challenge.id,
      'Both users must receive the exact same challenge for the date'
    );
    assert.strictEqual(statusUserA.bonusXp, 25, 'Daily challenge grants +25 XP bonus');
    assert.strictEqual(statusUserA.isCompleted, false);
  });

  it('updates streak correctly for consecutive, same-day, and skipped days', async () => {
    const { Database } = await import('../src/server/db/index');
    Database.resetInstance();
    const db = Database.getInstance();
    const testUserId = 'streak-tester';

    // Day 1: First completion
    const day1 = db.updateUserStreak(testUserId, '2026-09-20');
    assert.strictEqual(day1.streakRecord.currentStreak, 1);
    assert.strictEqual(day1.streakRecord.longestStreak, 1);
    assert.strictEqual(day1.isNewStreakDay, true);

    // Day 1: Same day repeat -> No increment
    const day1Repeat = db.updateUserStreak(testUserId, '2026-09-20');
    assert.strictEqual(day1Repeat.streakRecord.currentStreak, 1);
    assert.strictEqual(day1Repeat.isNewStreakDay, false);

    // Day 2: Consecutive day -> +1 increment
    const day2 = db.updateUserStreak(testUserId, '2026-09-21');
    assert.strictEqual(day2.streakRecord.currentStreak, 2);
    assert.strictEqual(day2.streakRecord.longestStreak, 2);
    assert.strictEqual(day2.isNewStreakDay, true);

    // Day 3: Consecutive day -> +1 increment (Streak 3)
    const day3 = db.updateUserStreak(testUserId, '2026-09-22');
    assert.strictEqual(day3.streakRecord.currentStreak, 3);
    assert.strictEqual(day3.streakRecord.longestStreak, 3);

    // Day 5: Missed Day 4 (2026-09-23 was skipped) -> Reset current streak to 1, longest preserved at 3
    const day5 = db.updateUserStreak(testUserId, '2026-09-24');
    assert.strictEqual(day5.streakRecord.currentStreak, 1, 'Streak must reset to 1 after missed day');
    assert.strictEqual(day5.streakRecord.longestStreak, 3, 'Longest streak must be preserved');
  });

  it('evaluates achievements idempotently and avoids duplicate XP credits', async () => {
    const { Database } = await import('../src/server/db/index');
    const { AchievementEngine } = await import('../src/server/engine/AchievementEngine');
    Database.resetInstance();
    const db = Database.getInstance();
    const testUserId = 'ach-tester';

    // First evaluation: Player completes first challenge with 100% quiz
    const { attemptRecord } = db.recordAttemptAndAwardXp({
      attemptId: 'att-1',
      userId: testUserId,
      challengeId: 'quiz-001',
      version: 1,
      score: { rawScore: 100, maxScore: 100, percentage: 100, isCorrect: true },
      xpEarned: 100,
      isDailyChallenge: true,
    });

    const result1 = AchievementEngine.evaluateAchievements({
      userId: testUserId,
      attemptRecord,
      score: { rawScore: 100, maxScore: 100, percentage: 100, isCorrect: true },
      userStreak: {
        userId: testUserId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: '2026-09-27',
        completedDates: ['2026-09-27'],
        updatedAt: new Date().toISOString(),
      },
      userProgress: {
        userId: testUserId,
        totalXp: 100,
        currentLevel: 1,
        levelProgress: { currentLevel: 1, totalXp: 100, xpForCurrentLevel: 0, xpForNextLevel: 100, progressPercentage: 100 },
        updatedAt: new Date().toISOString(),
      },
      isDailyChallenge: true,
    });

    assert.ok(result1.unlockedAchievements.length >= 2, 'Should unlock at least FIRST_CHALLENGE and FIRST_DAILY');
    const codes = result1.unlockedAchievements.map((a) => a.code);
    assert.ok(codes.includes('FIRST_CHALLENGE'), 'Unlocks FIRST_CHALLENGE');
    assert.ok(codes.includes('FIRST_DAILY'), 'Unlocks FIRST_DAILY');
    assert.ok(result1.totalBonusXp > 0, 'Bonus XP must be awarded on new achievements');

    // Second evaluation with same conditions: Must be strictly idempotent (0 new unlocks, 0 XP)
    const result2 = AchievementEngine.evaluateAchievements({
      userId: testUserId,
      attemptRecord,
      score: { rawScore: 100, maxScore: 100, percentage: 100, isCorrect: true },
      userStreak: {
        userId: testUserId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: '2026-09-27',
        completedDates: ['2026-09-27'],
        updatedAt: new Date().toISOString(),
      },
      userProgress: {
        userId: testUserId,
        totalXp: 150,
        currentLevel: 2,
        levelProgress: { currentLevel: 2, totalXp: 150, xpForCurrentLevel: 100, xpForNextLevel: 250, progressPercentage: 33 },
        updatedAt: new Date().toISOString(),
      },
      isDailyChallenge: true,
    });

    assert.strictEqual(
      result2.unlockedAchievements.length,
      0,
      'Already unlocked achievements must not be unlocked again'
    );
    assert.strictEqual(result2.totalBonusXp, 0, 'No bonus XP for duplicate evaluations');
  });

  it('computes leaderboard rankings accurately and respects showInLeaderboard privacy', async () => {
    const { Database } = await import('../src/server/db/index');
    Database.resetInstance();
    const db = Database.getInstance();

    const leaderboard = db.getLeaderboard({ timeframe: 'all_time', limit: 10 });
    assert.ok(leaderboard.entries.length > 0, 'Leaderboard must contain seeded players');
    assert.strictEqual(leaderboard.entries[0].rank, 1, 'Top player has rank 1');

    // Verify descending order of XP
    for (let i = 0; i < leaderboard.entries.length - 1; i++) {
      assert.ok(
        leaderboard.entries[i].xp >= leaderboard.entries[i + 1].xp,
        'Entries must be sorted by XP in descending order'
      );
    }

    // Verify user with showInLeaderboard: false is excluded from public leaderboard
    db.updateProfile('usr-marie-002', { showInLeaderboard: false });

    const updatedLeaderboard = db.getLeaderboard({ timeframe: 'all_time', limit: 10 });
    const hasMarie = updatedLeaderboard.entries.some((e) => e.userId === 'usr-marie-002');
    assert.strictEqual(hasMarie, false, 'Users with showInLeaderboard: false must not appear');
  });

  it('computes detailed personal statistics aggregated by cognitive challenge type', async () => {
    const { Database } = await import('../src/server/db/index');
    Database.resetInstance();
    const db = Database.getInstance();
    const testUserId = 'usr-stats-player';

    // Record 2 attempts: 1 quiz (score 90) and 1 memory (score 80)
    db.recordAttemptAndAwardXp({
      attemptId: 'att-stats-1',
      userId: testUserId,
      challengeId: 'quiz-001',
      version: 1,
      score: { rawScore: 90, maxScore: 100, percentage: 90 },
      xpEarned: 90,
      isDailyChallenge: false,
    });
    db.recordAttemptAndAwardXp({
      attemptId: 'att-stats-2',
      userId: testUserId,
      challengeId: 'memory-001',
      version: 1,
      score: { rawScore: 80, maxScore: 100, percentage: 80 },
      xpEarned: 80,
      isDailyChallenge: false,
    });

    const stats = db.getUserStats(testUserId);
    assert.strictEqual(stats.totalPlayed, 2);
    assert.strictEqual(stats.bestScore, 90);
    assert.strictEqual(stats.averageScore, 85);
    assert.strictEqual(stats.byType.quiz.totalPlayed, 1);
    assert.strictEqual(stats.byType.quiz.bestScore, 90);
    assert.strictEqual(stats.byType.memory.totalPlayed, 1);
    assert.strictEqual(stats.byType.memory.bestScore, 80);
    assert.strictEqual(stats.byType.reaction.totalPlayed, 0);
  });
});
