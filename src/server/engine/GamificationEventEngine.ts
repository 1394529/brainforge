import {
  ChallengeAttemptRecord,
  ChallengeAttemptResult,
  GamificationNotification,
  ScoreResult,
  UserProgressData,
  UserStreakRecord,
} from '../../types';
import { Database } from '../db';
import { AchievementEngine } from './AchievementEngine';
import { DateUtils } from '../utils/dateUtils';
import { Logger } from '../logger';

export interface PostAttemptResult {
  attemptResult: ChallengeAttemptResult;
  updatedProgress: UserProgressData;
  userStreak: UserStreakRecord;
  isDailyChallenge: boolean;
  dailyBonusXpAwarded: number;
  unlockedAchievements: Array<{
    id: string;
    code: string;
    name: string;
    nameFr: string;
    xpBonus: number;
    icon: string;
  }>;
  notifications: GamificationNotification[];
}

export class GamificationEventEngine {
  /**
   * Orchestrates the V1.4 Gamification Execution Sequence after scoring an attempt:
   * 1. Persist Attempt & Base XP
   * 2. If Daily Challenge:
   *    a) Idempotently verify not already completed today
   *    b) Record daily challenge attempt
   *    c) Award Daily Challenge bonus XP (+25 XP)
   * 3. Update User Streak (consecutive day or new streak)
   * 4. Evaluate and unlock any newly eligible achievements
   * 5. Generate in-app notifications
   */
  public static handlePostAttempt(params: {
    userId: string;
    challengeId: string;
    version: number;
    score: ScoreResult;
    baseXpEarned: number;
    isDailyChallenge?: boolean;
    attemptId: string;
    attemptResult: ChallengeAttemptResult;
    locale?: 'fr' | 'en';
  }): PostAttemptResult {
    const {
      userId,
      challengeId,
      version,
      score,
      baseXpEarned,
      isDailyChallenge = false,
      attemptId,
      attemptResult,
      locale = 'fr',
    } = params;

    const db = Database.getInstance();
    const userProfile = db.getProfile(userId);
    const timezone = userProfile?.timezone || 'UTC';
    const todayDateStr = DateUtils.getDateString(new Date(), timezone);

    const notifications: GamificationNotification[] = [];

    // 1. Record Attempt & Award Base XP
    const { attemptRecord, updatedProgress: initialProgress } = db.recordAttemptAndAwardXp({
      attemptId,
      userId,
      challengeId,
      version,
      score,
      xpEarned: baseXpEarned,
      isDailyChallenge,
      locale,
    });

    let dailyBonusXpAwarded = 0;

    // 2. If Daily Challenge, process daily challenge record and daily bonus XP
    if (isDailyChallenge) {
      const dailyStatus = db.getUserDailyChallengeStatus(userId, todayDateStr);
      if (!dailyStatus.isCompleted) {
        db.recordDailyAttempt(userId, dailyStatus.challengeDate, todayDateStr, attemptId);
        dailyBonusXpAwarded = 25; // 25 XP bonus for Daily Challenge

        // Award daily bonus XP atomically
        db.awardBonusXp({
          userId,
          attemptId: `daily-${attemptId}`,
          amount: dailyBonusXpAwarded,
          reason: 'daily_challenge_bonus',
        });

        notifications.push({
          id: `notif-daily-${attemptId}`,
          type: 'daily',
          title: locale === 'fr' ? 'Défi du jour validé !' : 'Daily Challenge complete!',
          message: locale === 'fr' ? '+25 XP bonus accordés' : '+25 bonus XP awarded',
          xpAmount: dailyBonusXpAwarded,
        });
      }
    }

    // 3. Update User Streak
    const { streakRecord, isNewStreakDay } = db.updateUserStreak(userId, todayDateStr);

    if (isNewStreakDay) {
      notifications.push({
        id: `notif-streak-${Date.now()}`,
        type: 'streak',
        title: locale === 'fr' ? '🔥 Série maintenue !' : '🔥 Streak alive!',
        message:
          locale === 'fr'
            ? `${streakRecord.currentStreak} jour${streakRecord.currentStreak > 1 ? 's' : ''} consécutifs`
            : `${streakRecord.currentStreak} day${streakRecord.currentStreak > 1 ? 's' : ''} streak`,
      });
    }

    // Refresh progress after possible bonus XP
    const progressAfterBonus = db.getUserProgress(userId);

    // Check level up notification
    if (attemptResult.gamification.leveledUp) {
      notifications.push({
        id: `notif-lvl-${Date.now()}`,
        type: 'level_up',
        title: locale === 'fr' ? 'Nouveau niveau !' : 'Level Up!',
        message:
          locale === 'fr'
            ? `Vous avez atteint le Niveau ${progressAfterBonus.currentLevel} !`
            : `You reached Level ${progressAfterBonus.currentLevel}!`,
      });
    }

    // 4. Evaluate Achievements
    const achievementResult = AchievementEngine.evaluateAchievements({
      userId,
      attemptRecord,
      score,
      userStreak: streakRecord,
      userProgress: progressAfterBonus,
      isDailyChallenge,
      userProfile,
    });

    notifications.push(...achievementResult.notifications);

    // Final user progress
    const finalProgress = db.getUserProgress(userId);

    // Update attemptResult gamification with total XP earned in this session
    const totalSessionXp = baseXpEarned + dailyBonusXpAwarded + achievementResult.totalBonusXp;
    attemptResult.gamification.xpEarned = totalSessionXp;
    attemptResult.gamification.totalXp = finalProgress.totalXp;
    attemptResult.gamification.currentLevel = finalProgress.currentLevel;
    attemptResult.gamification.levelProgress = finalProgress.levelProgress.progressPercentage;

    Logger.info('Gamification event execution complete', {
      userId,
      attemptId,
      totalSessionXp,
      streak: streakRecord.currentStreak,
      unlockedAchievementsCount: achievementResult.unlockedAchievements.length,
    });

    return {
      attemptResult,
      updatedProgress: finalProgress,
      userStreak: streakRecord,
      isDailyChallenge,
      dailyBonusXpAwarded,
      unlockedAchievements: achievementResult.unlockedAchievements.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        nameFr: a.nameFr,
        xpBonus: a.xpBonus,
        icon: a.icon,
      })),
      notifications,
    };
  }
}
