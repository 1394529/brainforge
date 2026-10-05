import {
  AchievementRecord,
  ChallengeAttemptRecord,
  GamificationNotification,
  ScoreResult,
  UserProfile,
  UserProgressData,
  UserStreakRecord,
} from '../../types';
import { Database } from '../db';
import { Logger } from '../logger';

export interface GamificationEventPayload {
  userId: string;
  attemptRecord: ChallengeAttemptRecord;
  score: ScoreResult;
  userStreak: UserStreakRecord;
  userProgress: UserProgressData;
  isDailyChallenge: boolean;
  userProfile?: UserProfile | null;
}

export interface GamificationEventResult {
  unlockedAchievements: AchievementRecord[];
  totalBonusXp: number;
  notifications: GamificationNotification[];
}

export class AchievementEngine {
  /**
   * Evaluates all active achievements against user performance and unlocks any newly earned achievements.
   * Completely idempotent: an achievement can only be unlocked once per user.
   */
  public static evaluateAchievements(payload: GamificationEventPayload): GamificationEventResult {
    const db = Database.getInstance();
    const { userId, attemptRecord, score, userStreak, userProgress, isDailyChallenge } = payload;

    const allAchievements = db.getAllAchievements(true);
    const existingUserAchievements = new Set(
      db.getUserAchievements(userId).map((ua) => ua.achievementId)
    );

    const userAllAttempts = db.getChallengeAttempts(userId);
    const totalAttemptsCount = userAllAttempts.length;

    const newlyUnlocked: AchievementRecord[] = [];
    let totalBonusXp = 0;
    const notifications: GamificationNotification[] = [];

    for (const ach of allAchievements) {
      if (existingUserAchievements.has(ach.id)) {
        continue; // Already unlocked
      }

      let qualifies = false;

      switch (ach.requirementType) {
        case 'first_challenge':
          if (totalAttemptsCount >= 1) {
            qualifies = true;
          }
          break;

        case 'first_daily':
          if (isDailyChallenge) {
            qualifies = true;
          }
          break;

        case 'streak':
          if (userStreak.currentStreak >= ach.requirementValue) {
            qualifies = true;
          }
          break;

        case 'level':
          if (userProgress.currentLevel >= ach.requirementValue) {
            qualifies = true;
          }
          break;

        case 'quiz_score':
          if (attemptRecord.challengeType === 'quiz' && score.percentage >= ach.requirementValue) {
            qualifies = true;
          }
          break;

        case 'memory_score':
          if (attemptRecord.challengeType === 'memory' && score.percentage >= ach.requirementValue) {
            qualifies = true;
          }
          break;

        case 'reaction_score':
          if (
            attemptRecord.challengeType === 'reaction' &&
            !score.metrics?.isFalseStart &&
            score.percentage >= ach.requirementValue
          ) {
            qualifies = true;
          }
          break;

        case 'speed_score':
          if (
            (attemptRecord.challengeType === 'reaction' || attemptRecord.challengeType === 'pattern') &&
            score.percentage >= ach.requirementValue
          ) {
            qualifies = true;
          }
          break;

        case 'total_challenges':
          if (totalAttemptsCount >= ach.requirementValue) {
            qualifies = true;
          }
          break;
      }

      if (qualifies) {
        const unlockRes = db.unlockAchievement(userId, ach.code);
        if (unlockRes.unlocked && unlockRes.achievement) {
          newlyUnlocked.push(unlockRes.achievement);
          totalBonusXp += unlockRes.xpAwarded || 0;

          notifications.push({
            id: `notif-ach-${Date.now()}-${ach.id}`,
            type: 'achievement',
            title: 'Nouveau badge débloqué !',
            message: `${ach.nameFr} (+${ach.xpBonus} XP)`,
            icon: ach.icon,
            xpAmount: ach.xpBonus,
          });

          Logger.info('Achievement unlocked by user', {
            userId,
            achievementCode: ach.code,
            xpBonus: ach.xpBonus,
          });
        }
      }
    }

    return {
      unlockedAchievements: newlyUnlocked,
      totalBonusXp,
      notifications,
    };
  }
}
