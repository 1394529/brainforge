import crypto from 'crypto';
import {
  AchievementRecord,
  AchievementWithStatus,
  ChallengeAttemptRecord,
  ChallengeSummary,
  ChallengeType,
  DailyChallengeRecord,
  DailyChallengeStatus,
  GameStats,
  LeaderboardData,
  LeaderboardEntry,
  LevelProgress,
  Locale,
  ScoreResult,
  UserProfile,
  UserProgressData,
  UserRole,
  UserStatsData,
  UserStreakRecord,
  UserAchievementRecord,
  XpTransactionRecord,
  CoachPreferences,
  CoachInsightRecord,
  PersonalizationProfile,
} from '../../types';
import { LevelService } from '../engine/LevelService';
import { RawChallengeRecord } from '../engine/ChallengeEngine';
import { SEED_CHALLENGES } from './seed';
import { SEED_ACHIEVEMENTS } from './seedAchievements';
import { DateUtils } from '../utils/dateUtils';

interface AuthCredential {
  userId: string;
  passwordHash: string;
  salt: string;
}

interface ResetTokenRecord {
  token: string;
  email: string;
  expiresAt: number;
}

interface DbState {
  profiles: Map<string, UserProfile>;
  credentials: Map<string, AuthCredential>; // key is userId
  resetTokens: Map<string, ResetTokenRecord>; // key is token
  userProgress: Map<string, { userId: string; totalXp: number; currentLevel: number; updatedAt: string }>;
  xpTransactions: Map<string, XpTransactionRecord>; // key is id
  attemptIdToTransaction: Map<string, string>; // attemptId -> transactionId for fast unique lookup
  challengeAttempts: Map<string, ChallengeAttemptRecord>; // key is id
  challenges: Map<string, RawChallengeRecord>;

  // V1.4 Additions
  dailyChallenges: Map<string, DailyChallengeRecord>; // key is id
  dailyChallengesByDate: Map<string, DailyChallengeRecord>; // key is YYYY-MM-DD
  userDailyAttempts: Map<string, string>; // key is `${userId}:${challengeDate}` -> attemptId
  userStreaks: Map<string, UserStreakRecord>; // key is userId
  achievements: Map<string, AchievementRecord>; // key is id
  achievementsByCode: Map<string, AchievementRecord>; // key is code
  userAchievements: Map<string, UserAchievementRecord>; // key is id
  userAchievementKeySet: Set<string>; // set of `${userId}:${achievementId}`

  // V1.5 Additions
  coachPreferences: Map<string, CoachPreferences>; // key is userId
  coachInsights: Map<string, CoachInsightRecord>; // key is id
  personalizationProfiles: Map<string, PersonalizationProfile>; // key is userId
}

export class Database {
  private static instance: Database;
  private state: DbState = {
    profiles: new Map(),
    credentials: new Map(),
    resetTokens: new Map(),
    userProgress: new Map(),
    xpTransactions: new Map(),
    attemptIdToTransaction: new Map(),
    challengeAttempts: new Map(),
    challenges: new Map(),
    dailyChallenges: new Map(),
    dailyChallengesByDate: new Map(),
    userDailyAttempts: new Map(),
    userStreaks: new Map(),
    achievements: new Map(),
    achievementsByCode: new Map(),
    userAchievements: new Map(),
    userAchievementKeySet: new Set(),
    coachPreferences: new Map(),
    coachInsights: new Map(),
    personalizationProfiles: new Map(),
  };

  private constructor() {
    this.seed();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public static resetInstance(): void {
    Database.instance = new Database();
  }

  public hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  private seed(): void {
    // 1. Seed challenges
    for (const challenge of SEED_CHALLENGES) {
      this.state.challenges.set(challenge.id, challenge);
    }

    // 2. Seed achievements
    for (const ach of SEED_ACHIEVEMENTS) {
      this.state.achievements.set(ach.id, ach);
      this.state.achievementsByCode.set(ach.code, ach);
    }

    // 3. Seed users
    // Demo User 1: Alex Vance (Regular User)
    const demoUser: UserProfile = {
      id: 'usr-demo-001',
      email: 'alex@brainforge.io',
      username: 'alexv',
      displayName: 'Alex Vance',
      role: 'user',
      timezone: 'Europe/Paris',
      showInLeaderboard: true,
      createdAt: new Date().toISOString(),
    };
    this.state.profiles.set(demoUser.id, demoUser);
    const demoSalt = 'demo-salt-123';
    this.state.credentials.set(demoUser.id, {
      userId: demoUser.id,
      salt: demoSalt,
      passwordHash: this.hashPassword('password123', demoSalt),
    });
    this.state.userProgress.set(demoUser.id, {
      userId: demoUser.id,
      totalXp: 480,
      currentLevel: 3,
      updatedAt: new Date().toISOString(),
    });
    this.state.userStreaks.set(demoUser.id, {
      userId: demoUser.id,
      currentStreak: 4,
      longestStreak: 7,
      lastCompletedDate: DateUtils.getYesterdayDateString(new Date(), 'Europe/Paris'),
      completedDates: [
        DateUtils.getYesterdayDateString(new Date(), 'Europe/Paris'),
      ],
      updatedAt: new Date().toISOString(),
    });

    // Seed FIRST_CHALLENGE achievement for Alex
    const firstAch = this.state.achievementsByCode.get('FIRST_CHALLENGE');
    if (firstAch) {
      const uaId = `ua-alex-${firstAch.id}`;
      this.state.userAchievements.set(uaId, {
        id: uaId,
        userId: demoUser.id,
        achievementId: firstAch.id,
        unlockedAt: new Date().toISOString(),
      });
      this.state.userAchievementKeySet.add(`${demoUser.id}:${firstAch.id}`);
    }

    // Seed Demo User 2: Marie Curie (Top Leaderboard player)
    const marieUser: UserProfile = {
      id: 'usr-marie-002',
      email: 'marie.champion@brainforge.io',
      username: 'marie_c',
      displayName: 'Marie Curie',
      role: 'user',
      timezone: 'Europe/Paris',
      showInLeaderboard: true,
      createdAt: new Date().toISOString(),
    };
    this.state.profiles.set(marieUser.id, marieUser);
    this.state.userProgress.set(marieUser.id, {
      userId: marieUser.id,
      totalXp: 2180,
      currentLevel: 7,
      updatedAt: new Date().toISOString(),
    });
    this.state.userStreaks.set(marieUser.id, {
      userId: marieUser.id,
      currentStreak: 12,
      longestStreak: 15,
      lastCompletedDate: DateUtils.getDateString(new Date(), 'Europe/Paris'),
      completedDates: [DateUtils.getDateString(new Date(), 'Europe/Paris')],
      updatedAt: new Date().toISOString(),
    });

    // Seed Demo User 3: Pierre Fermat (Math Master)
    const pierreUser: UserProfile = {
      id: 'usr-pierre-003',
      email: 'pierre.fermat@brainforge.io',
      username: 'p_fermat',
      displayName: 'Pierre Fermat',
      role: 'user',
      timezone: 'Europe/Paris',
      showInLeaderboard: true,
      createdAt: new Date().toISOString(),
    };
    this.state.profiles.set(pierreUser.id, pierreUser);
    this.state.userProgress.set(pierreUser.id, {
      userId: pierreUser.id,
      totalXp: 1850,
      currentLevel: 6,
      updatedAt: new Date().toISOString(),
    });
    this.state.userStreaks.set(pierreUser.id, {
      userId: pierreUser.id,
      currentStreak: 8,
      longestStreak: 10,
      lastCompletedDate: DateUtils.getYesterdayDateString(new Date(), 'Europe/Paris'),
      completedDates: [],
      updatedAt: new Date().toISOString(),
    });

    // Seed Admin user
    const adminUser: UserProfile = {
      id: 'usr-admin-001',
      email: 'admin@brainforge.io',
      username: 'admin',
      displayName: 'Admin System',
      role: 'admin',
      timezone: 'UTC',
      showInLeaderboard: true,
      createdAt: new Date().toISOString(),
    };
    this.state.profiles.set(adminUser.id, adminUser);
    const adminSalt = 'admin-salt-456';
    this.state.credentials.set(adminUser.id, {
      userId: adminUser.id,
      salt: adminSalt,
      passwordHash: this.hashPassword('admin1234', adminSalt),
    });
    this.state.userProgress.set(adminUser.id, {
      userId: adminUser.id,
      totalXp: 1250,
      currentLevel: 6,
      updatedAt: new Date().toISOString(),
    });
    this.state.userStreaks.set(adminUser.id, {
      userId: adminUser.id,
      currentStreak: 14,
      longestStreak: 21,
      lastCompletedDate: DateUtils.getDateString(new Date(), 'UTC'),
      completedDates: [],
      updatedAt: new Date().toISOString(),
    });

    // 4. Seed Daily Challenges for today, yesterday, and future
    const published = Array.from(this.state.challenges.values()).filter((c) => c.status === 'published');
    if (published.length > 0) {
      const todayStr = DateUtils.getDateString(new Date(), 'UTC');
      const yesterdayStr = DateUtils.getYesterdayDateString(new Date(), 'UTC');
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const tomorrowStr = DateUtils.getDateString(tomorrow, 'UTC');

      // Today
      this.setDailyChallenge({
        challengeId: published[0].id,
        challengeDate: todayStr,
        difficulty: 2,
        bonusXp: 25,
      });

      // Yesterday
      if (published.length > 1) {
        this.setDailyChallenge({
          challengeId: published[1].id,
          challengeDate: yesterdayStr,
          difficulty: 1,
          bonusXp: 25,
        });
      }

      // Tomorrow
      if (published.length > 2) {
        this.setDailyChallenge({
          challengeId: published[2].id,
          challengeDate: tomorrowStr,
          difficulty: 2,
          bonusXp: 25,
        });
      }
    }
  }

  // --- Profiles & Auth ---
  public getProfile(id: string): UserProfile | null {
    return this.state.profiles.get(id) || null;
  }

  public getProfileByEmail(email: string): UserProfile | null {
    const normalized = email.toLowerCase().trim();
    for (const profile of this.state.profiles.values()) {
      if (profile.email.toLowerCase() === normalized) {
        return profile;
      }
    }
    return null;
  }

  public createProfile(params: {
    email: string;
    username: string;
    displayName: string;
    password?: string;
    role?: UserRole;
    timezone?: string;
    showInLeaderboard?: boolean;
  }): UserProfile {
    const {
      email,
      username,
      displayName,
      password = 'password123',
      role = 'user',
      timezone = 'Europe/Paris',
      showInLeaderboard = true,
    } = params;
    const normalizedEmail = email.toLowerCase().trim();
    if (this.getProfileByEmail(normalizedEmail)) {
      throw new Error('User with this email already exists');
    }

    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: UserProfile = {
      id,
      email: normalizedEmail,
      username: username.trim(),
      displayName: displayName.trim(),
      role,
      timezone,
      showInLeaderboard,
      createdAt: new Date().toISOString(),
    };

    this.state.profiles.set(id, newProfile);

    // Store hashed credentials
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);
    this.state.credentials.set(id, {
      userId: id,
      salt,
      passwordHash,
    });

    // Initialize user progress at Level 1, 0 XP
    this.state.userProgress.set(id, {
      userId: id,
      totalXp: 0,
      currentLevel: 1,
      updatedAt: new Date().toISOString(),
    });

    // Initialize user streak at 0
    this.state.userStreaks.set(id, {
      userId: id,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      completedDates: [],
      updatedAt: new Date().toISOString(),
    });

    return newProfile;
  }

  public verifyPassword(email: string, passwordAttempt: string): boolean {
    const profile = this.getProfileByEmail(email);
    if (!profile) return false;

    const cred = this.state.credentials.get(profile.id);
    if (!cred) return false;

    const attemptHash = this.hashPassword(passwordAttempt, cred.salt);
    return crypto.timingSafeEqual(Buffer.from(attemptHash, 'hex'), Buffer.from(cred.passwordHash, 'hex'));
  }

  public updatePassword(userId: string, newPassword: string): void {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(newPassword, salt);
    this.state.credentials.set(userId, {
      userId,
      salt,
      passwordHash,
    });
  }

  public updateProfile(
    userId: string,
    updates: { displayName?: string; timezone?: string; showInLeaderboard?: boolean }
  ): UserProfile {
    const profile = this.getProfile(userId);
    if (!profile) {
      throw new Error('User not found');
    }
    if (updates.displayName !== undefined) {
      profile.displayName = updates.displayName.trim();
    }
    if (updates.timezone !== undefined) {
      profile.timezone = updates.timezone.trim();
    }
    if (updates.showInLeaderboard !== undefined) {
      profile.showInLeaderboard = Boolean(updates.showInLeaderboard);
    }
    this.state.profiles.set(userId, profile);
    return profile;
  }

  // --- Password Recovery ---
  public createPasswordResetToken(email: string): string {
    const profile = this.getProfileByEmail(email);
    if (!profile) {
      throw new Error('No account found with this email address');
    }

    const token = `rst-${crypto.randomBytes(24).toString('hex')}`;
    this.state.resetTokens.set(token, {
      token,
      email: profile.email,
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour validity
    });

    return token;
  }

  public resetPasswordWithToken(token: string, newPassword: string): void {
    const record = this.state.resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      throw new Error('Invalid or expired password reset token');
    }

    const profile = this.getProfileByEmail(record.email);
    if (!profile) {
      throw new Error('Associated user not found');
    }

    this.updatePassword(profile.id, newPassword);
    this.state.resetTokens.delete(token);
  }

  // --- User Progress ---
  public getUserProgress(userId: string): UserProgressData {
    let progress = this.state.userProgress.get(userId);
    if (!progress) {
      progress = {
        userId,
        totalXp: 0,
        currentLevel: 1,
        updatedAt: new Date().toISOString(),
      };
      this.state.userProgress.set(userId, progress);
    }

    const levelProgress: LevelProgress = LevelService.calculateLevel(progress.totalXp);

    return {
      userId,
      totalXp: progress.totalXp,
      currentLevel: levelProgress.currentLevel,
      levelProgress,
      updatedAt: progress.updatedAt,
    };
  }

  // --- XP Ledger / Transactions ---
  public getXpTransactions(userId: string): XpTransactionRecord[] {
    const results: XpTransactionRecord[] = [];
    for (const tx of this.state.xpTransactions.values()) {
      if (tx.userId === userId) {
        results.push(tx);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public awardBonusXp(params: {
    userId: string;
    attemptId: string;
    amount: number;
    reason: string;
  }): XpTransactionRecord | null {
    const { userId, attemptId, amount, reason } = params;
    if (amount <= 0) return null;

    if (this.state.attemptIdToTransaction.has(attemptId)) {
      return null; // Idempotent check
    }

    const currentProgress = this.getUserProgress(userId);
    const newTotalXp = currentProgress.totalXp + amount;
    const newProgression = LevelService.calculateLevel(newTotalXp);

    const txId = `tx-bonus-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tx: XpTransactionRecord = {
      id: txId,
      userId,
      attemptId,
      amount,
      reason,
      createdAt: new Date().toISOString(),
    };

    this.state.xpTransactions.set(txId, tx);
    this.state.attemptIdToTransaction.set(attemptId, txId);

    this.state.userProgress.set(userId, {
      userId,
      totalXp: newTotalXp,
      currentLevel: newProgression.currentLevel,
      updatedAt: new Date().toISOString(),
    });

    return tx;
  }

  // --- Challenges ---
  public getChallenge(id: string): RawChallengeRecord | null {
    return this.state.challenges.get(id) || null;
  }

  public getAllPublishedChallenges(filter?: {
    type?: ChallengeType;
    difficulty?: number;
  }): RawChallengeRecord[] {
    const all = Array.from(this.state.challenges.values()).filter((c) => c.status === 'published');
    if (!filter) return all;

    return all.filter((c) => {
      if (filter.type && c.type !== filter.type) return false;
      if (filter.difficulty && c.difficulty !== filter.difficulty) return false;
      return true;
    });
  }

  public getNextChallenge(params: {
    type?: ChallengeType;
    difficulty?: number;
    excludeIds?: string[];
  }): RawChallengeRecord | null {
    const { type, difficulty, excludeIds = [] } = params;
    const excludeSet = new Set(excludeIds);

    const candidates = this.getAllPublishedChallenges({ type, difficulty }).filter(
      (c) => !excludeSet.has(c.id)
    );

    if (candidates.length === 0) {
      const fallback = this.getAllPublishedChallenges({ type, difficulty });
      if (fallback.length === 0) return null;
      return fallback[Math.floor(Math.random() * fallback.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // --- Attempts & History ---
  public getChallengeAttempts(
    userId: string,
    filter?: { type?: ChallengeType; limit?: number }
  ): ChallengeAttemptRecord[] {
    const attempts: ChallengeAttemptRecord[] = [];
    for (const att of this.state.challengeAttempts.values()) {
      if (att.userId === userId) {
        if (!filter?.type || att.challengeType === filter.type) {
          attempts.push(att);
        }
      }
    }

    attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.limit && filter.limit > 0) {
      return attempts.slice(0, filter.limit);
    }
    return attempts;
  }

  /**
   * ATOMIC TRANSACTION:
   * 1. Check idempotency (attemptId must be unique in xp_transactions and challenge_attempts)
   * 2. Insert attempt record into challenge_attempts
   * 3. Insert XP transaction into xp_transactions ledger (if xpEarned > 0)
   * 4. Update user_progress (total_xp and current_level)
   */
  public recordAttemptAndAwardXp(params: {
    attemptId: string;
    userId: string;
    challengeId: string;
    version: number;
    score: ScoreResult;
    xpEarned: number;
    isDailyChallenge?: boolean;
    locale?: Locale;
  }): {
    attemptRecord: ChallengeAttemptRecord;
    xpTransaction: XpTransactionRecord | null;
    updatedProgress: UserProgressData;
  } {
    const { attemptId, userId, challengeId, version, score, xpEarned, isDailyChallenge = false, locale = 'en' } = params;

    // ANTI-DUPLICATION / IDEMPOTENCY CHECK:
    if (this.state.attemptIdToTransaction.has(attemptId) || this.state.challengeAttempts.has(attemptId)) {
      throw new Error(`Attempt ${attemptId} has already been processed and credited.`);
    }

    const challenge = this.getChallenge(challengeId);
    if (!challenge) {
      throw new Error(`Challenge not found: ${challengeId}`);
    }

    const currentProgress = this.getUserProgress(userId);
    const newTotalXp = currentProgress.totalXp + xpEarned;
    const newProgression = LevelService.calculateLevel(newTotalXp);

    // 1. Record challenge attempt
    const attemptRecord: ChallengeAttemptRecord = {
      id: attemptId,
      userId,
      challengeId,
      challengeTitle: locale === 'fr' ? challenge.titleFr : challenge.titleEn,
      challengeType: challenge.type,
      version,
      rawScore: score.rawScore,
      maxScore: score.maxScore,
      percentage: score.percentage,
      durationMs: score.durationMs || 0,
      isCorrect: score.isCorrect,
      metrics: score.metrics || {},
      xpEarned,
      isDailyChallenge,
      createdAt: new Date().toISOString(),
    };
    this.state.challengeAttempts.set(attemptId, attemptRecord);

    // 2. Record XP Transaction in Ledger (with unique attemptId constraint)
    let xpTransaction: XpTransactionRecord | null = null;
    if (xpEarned > 0) {
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      xpTransaction = {
        id: txId,
        userId,
        attemptId,
        amount: xpEarned,
        reason: isDailyChallenge ? 'daily_challenge_completed' : 'challenge_completed',
        createdAt: new Date().toISOString(),
      };
      this.state.xpTransactions.set(txId, xpTransaction);
      this.state.attemptIdToTransaction.set(attemptId, txId);
    }

    // 3. Update User Progress
    this.state.userProgress.set(userId, {
      userId,
      totalXp: newTotalXp,
      currentLevel: newProgression.currentLevel,
      updatedAt: new Date().toISOString(),
    });

    const updatedProgress = this.getUserProgress(userId);

    return {
      attemptRecord,
      xpTransaction,
      updatedProgress,
    };
  }

  // ===================== V1.4 STREAK SYSTEM =====================

  public getUserStreak(userId: string): UserStreakRecord {
    let streak = this.state.userStreaks.get(userId);
    if (!streak) {
      streak = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        completedDates: [],
        updatedAt: new Date().toISOString(),
      };
      this.state.userStreaks.set(userId, streak);
    }
    return streak;
  }

  /**
   * Updates user streak based on the calendar date (YYYY-MM-DD).
   * Rules:
   * - If completed on same day: no change to current_streak
   * - If completed on consecutive day (yesterday was last completed): current_streak + 1
   * - If missed one or more days: current_streak resets to 1
   * - longest_streak = max(longest_streak, current_streak)
   */
  public updateUserStreak(
    userId: string,
    completedDateStr: string
  ): { streakRecord: UserStreakRecord; isNewStreakDay: boolean } {
    const streak = this.getUserStreak(userId);

    if (streak.lastCompletedDate === completedDateStr) {
      // Already completed today, do not increment
      return { streakRecord: streak, isNewStreakDay: false };
    }

    let nextCurrentStreak = 1;

    if (streak.lastCompletedDate) {
      const isConsecutive = DateUtils.areConsecutiveDays(streak.lastCompletedDate, completedDateStr);
      if (isConsecutive) {
        nextCurrentStreak = streak.currentStreak + 1;
      } else {
        // Missed one or more days
        nextCurrentStreak = 1;
      }
    } else {
      // First day ever
      nextCurrentStreak = 1;
    }

    const updatedLongest = Math.max(streak.longestStreak, nextCurrentStreak);
    const updatedDates = [completedDateStr, ...streak.completedDates.filter((d) => d !== completedDateStr)].slice(0, 30);

    const updatedRecord: UserStreakRecord = {
      userId,
      currentStreak: nextCurrentStreak,
      longestStreak: updatedLongest,
      lastCompletedDate: completedDateStr,
      completedDates: updatedDates,
      updatedAt: new Date().toISOString(),
    };

    this.state.userStreaks.set(userId, updatedRecord);

    return {
      streakRecord: updatedRecord,
      isNewStreakDay: true,
    };
  }

  // ===================== V1.4 DAILY CHALLENGE SYSTEM =====================

  public getDailyChallengeForDate(dateStr: string): DailyChallengeRecord | null {
    return this.state.dailyChallengesByDate.get(dateStr) || null;
  }

  /**
   * Schedules or overrides a Daily Challenge for a specific date (unique constraint on date)
   */
  public setDailyChallenge(params: {
    challengeId: string;
    challengeDate: string; // YYYY-MM-DD
    difficulty?: number;
    bonusXp?: number;
  }): DailyChallengeRecord {
    const { challengeId, challengeDate, difficulty = 2, bonusXp = 25 } = params;

    const challenge = this.getChallenge(challengeId);
    if (!challenge) {
      throw new Error(`Challenge not found: ${challengeId}`);
    }

    // Check existing
    const existing = this.state.dailyChallengesByDate.get(challengeDate);
    const id = existing?.id || `daily-${challengeDate}-${Math.random().toString(36).substring(2, 6)}`;

    const record: DailyChallengeRecord = {
      id,
      challengeId,
      challengeDate,
      difficulty,
      bonusXp,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    this.state.dailyChallenges.set(id, record);
    this.state.dailyChallengesByDate.set(challengeDate, record);

    return record;
  }

  public getAllDailyChallenges(): DailyChallengeRecord[] {
    return Array.from(this.state.dailyChallenges.values()).sort(
      (a, b) => b.challengeDate.localeCompare(a.challengeDate)
    );
  }

  /**
   * Deterministically returns the Daily Challenge for a date.
   * If not explicitly seeded, uses a deterministic hash of the date string across published challenges.
   */
  public getOrCreateDeterministicDailyChallenge(dateStr: string): DailyChallengeRecord {
    let daily = this.getDailyChallengeForDate(dateStr);
    if (daily) return daily;

    const published = this.getAllPublishedChallenges();
    if (published.length === 0) {
      throw new Error('No published challenges available for daily rotation');
    }

    // Deterministic selection based on date string hash
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % published.length;
    const selectedChallenge = published[index];

    return this.setDailyChallenge({
      challengeId: selectedChallenge.id,
      challengeDate: dateStr,
      difficulty: selectedChallenge.difficulty,
      bonusXp: 25,
    });
  }

  public getUserDailyChallengeStatus(userId: string, dateStr: string): DailyChallengeStatus {
    const daily = this.getOrCreateDeterministicDailyChallenge(dateStr);
    const rawChallenge = this.getChallenge(daily.challengeId);

    const attemptId = this.state.userDailyAttempts.get(`${userId}:${dateStr}`);
    const isCompleted = Boolean(attemptId);
    let completedAttempt: ChallengeAttemptRecord | undefined;

    if (attemptId) {
      completedAttempt = this.state.challengeAttempts.get(attemptId);
    }

    const challengeSummary: ChallengeSummary | null = rawChallenge
      ? {
          id: rawChallenge.id,
          type: rawChallenge.type,
          skill: rawChallenge.skill,
          difficulty: daily.difficulty,
          title: rawChallenge.titleFr,
          description: rawChallenge.descriptionFr,
          version: rawChallenge.version,
          content: rawChallenge.contentFr,
        }
      : null;

    return {
      challengeDate: dateStr,
      challenge: challengeSummary,
      isCompleted,
      completedAttempt,
      bonusXp: daily.bonusXp,
    };
  }

  public recordDailyAttempt(
    userId: string,
    _dailyChallengeId: string,
    challengeDate: string,
    attemptId: string
  ): void {
    const key = `${userId}:${challengeDate}`;
    if (this.state.userDailyAttempts.has(key)) {
      throw new Error(`Daily challenge for ${challengeDate} already completed by user ${userId}`);
    }
    this.state.userDailyAttempts.set(key, attemptId);
  }

  // ===================== V1.4 ACHIEVEMENTS SYSTEM =====================

  public getAllAchievements(onlyActive = true): AchievementRecord[] {
    const all = Array.from(this.state.achievements.values());
    if (!onlyActive) return all;
    return all.filter((a) => a.isActive);
  }

  public getUserAchievements(userId: string): UserAchievementRecord[] {
    const results: UserAchievementRecord[] = [];
    for (const ua of this.state.userAchievements.values()) {
      if (ua.userId === userId) {
        results.push(ua);
      }
    }
    return results.sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
  }

  public getAchievementsWithStatus(userId: string): AchievementWithStatus[] {
    const all = this.getAllAchievements(false);
    const userMap = new Map<string, UserAchievementRecord>();
    for (const ua of this.getUserAchievements(userId)) {
      userMap.set(ua.achievementId, ua);
    }

    return all.map((ach) => {
      const record = userMap.get(ach.id);
      return {
        ...ach,
        isUnlocked: Boolean(record),
        unlockedAt: record?.unlockedAt,
      };
    });
  }

  /**
   * Idempotently unlocks an achievement for a user.
   * If unique constraint (user_id, achievement_id) is violated, returns unlocked: false.
   */
  public unlockAchievement(
    userId: string,
    achievementCode: string
  ): { unlocked: boolean; achievement?: AchievementRecord; xpAwarded?: number } {
    const ach = this.state.achievementsByCode.get(achievementCode);
    if (!ach || !ach.isActive) {
      return { unlocked: false };
    }

    const key = `${userId}:${ach.id}`;
    if (this.state.userAchievementKeySet.has(key)) {
      return { unlocked: false }; // Already unlocked
    }

    const id = `ua-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const userAch: UserAchievementRecord = {
      id,
      userId,
      achievementId: ach.id,
      unlockedAt: new Date().toISOString(),
    };

    this.state.userAchievements.set(id, userAch);
    this.state.userAchievementKeySet.add(key);

    let xpAwarded = 0;
    if (ach.xpBonus > 0) {
      this.awardBonusXp({
        userId,
        attemptId: `ach-${ach.id}-${Date.now()}`,
        amount: ach.xpBonus,
        reason: `achievement_${ach.code.toLowerCase()}`,
      });
      xpAwarded = ach.xpBonus;
    }

    return {
      unlocked: true,
      achievement: ach,
      xpAwarded,
    };
  }

  public createOrUpdateAchievement(params: Partial<AchievementRecord> & { code: string }): AchievementRecord {
    const existing = this.state.achievementsByCode.get(params.code);
    const id = existing?.id || `ach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const record: AchievementRecord = {
      id,
      code: params.code,
      name: params.name || existing?.name || params.code,
      nameFr: params.nameFr || existing?.nameFr || params.name || params.code,
      description: params.description || existing?.description || '',
      descriptionFr: params.descriptionFr || existing?.descriptionFr || '',
      icon: params.icon || existing?.icon || 'Award',
      category: params.category || existing?.category || 'general',
      requirementType: params.requirementType || existing?.requirementType || 'total_challenges',
      requirementValue: params.requirementValue ?? existing?.requirementValue ?? 1,
      xpBonus: params.xpBonus ?? existing?.xpBonus ?? 0,
      isActive: params.isActive ?? existing?.isActive ?? true,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    this.state.achievements.set(id, record);
    this.state.achievementsByCode.set(params.code, record);

    return record;
  }

  public toggleAchievementActive(id: string, isActive: boolean): AchievementRecord | null {
    const ach = this.state.achievements.get(id);
    if (!ach) return null;
    ach.isActive = isActive;
    this.state.achievements.set(id, ach);
    this.state.achievementsByCode.set(ach.code, ach);
    return ach;
  }

  // ===================== V1.4 LEADERBOARD SYSTEM =====================

  public getLeaderboard(params: {
    timeframe: 'weekly' | 'all_time';
    currentUserId?: string;
    limit?: number;
  }): LeaderboardData {
    const { timeframe, currentUserId, limit = 50 } = params;

    // Filter profiles that allow appearing in leaderboard
    const eligibleProfiles = Array.from(this.state.profiles.values()).filter(
      (p) => p.showInLeaderboard !== false
    );

    let entries: Array<{ userId: string; displayName: string; level: number; xp: number }>;

    if (timeframe === 'weekly') {
      const { weekIdentifier, startIso, endIso } = DateUtils.getCurrentWeekRange(new Date(), 'UTC');
      const startMs = new Date(startIso).getTime();
      const endMs = new Date(endIso).getTime();

      // Compute weekly XP from xpTransactions
      const weeklyXpMap = new Map<string, number>();
      for (const tx of this.state.xpTransactions.values()) {
        const txMs = new Date(tx.createdAt).getTime();
        if (txMs >= startMs && txMs <= endMs) {
          weeklyXpMap.set(tx.userId, (weeklyXpMap.get(tx.userId) || 0) + tx.amount);
        }
      }

      entries = eligibleProfiles.map((p) => {
        const progress = this.getUserProgress(p.id);
        const weeklyXp = weeklyXpMap.get(p.id) || 0;
        return {
          userId: p.id,
          displayName: p.displayName,
          level: progress.currentLevel,
          xp: weeklyXp,
        };
      });

      // Sort descending by XP, then level
      entries.sort((a, b) => b.xp - a.xp || b.level - a.level);

      const rankedEntries: LeaderboardEntry[] = entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        displayName: entry.displayName,
        level: entry.level,
        xp: entry.xp,
        isCurrentUser: entry.userId === currentUserId,
      }));

      const currentUserRank = currentUserId
        ? rankedEntries.find((e) => e.userId === currentUserId)?.rank
        : undefined;

      return {
        timeframe: 'weekly',
        weekIdentifier,
        entries: rankedEntries.slice(0, limit),
        currentUserRank,
      };
    } else {
      // All-Time Leaderboard
      entries = eligibleProfiles.map((p) => {
        const progress = this.getUserProgress(p.id);
        return {
          userId: p.id,
          displayName: p.displayName,
          level: progress.currentLevel,
          xp: progress.totalXp,
        };
      });

      entries.sort((a, b) => b.xp - a.xp || b.level - a.level);

      const rankedEntries: LeaderboardEntry[] = entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        displayName: entry.displayName,
        level: entry.level,
        xp: entry.xp,
        isCurrentUser: entry.userId === currentUserId,
      }));

      const currentUserRank = currentUserId
        ? rankedEntries.find((e) => e.userId === currentUserId)?.rank
        : undefined;

      return {
        timeframe: 'all_time',
        entries: rankedEntries.slice(0, limit),
        currentUserRank,
      };
    }
  }

  // ===================== V1.4 USER STATS SYSTEM =====================

  public getUserStats(userId: string): UserStatsData {
    const attempts = this.getChallengeAttempts(userId);
    const progress = this.getUserProgress(userId);
    const streak = this.getUserStreak(userId);
    const achievements = this.getAchievementsWithStatus(userId);

    const totalPlayed = attempts.length;
    let totalScore = 0;
    let bestScore = 0;

    const byType: Record<ChallengeType, GameStats> = {
      quiz: { totalPlayed: 0, averageScore: 0, bestScore: 0, averageDurationMs: 0 },
      memory: { totalPlayed: 0, averageScore: 0, bestScore: 0, averageDurationMs: 0 },
      pattern: { totalPlayed: 0, averageScore: 0, bestScore: 0, averageDurationMs: 0 },
      reaction: { totalPlayed: 0, averageScore: 0, bestScore: 0, averageReactionTimeMs: 0 },
    };

    const reactionTimes: number[] = [];

    for (const att of attempts) {
      totalScore += att.percentage;
      if (att.percentage > bestScore) bestScore = att.percentage;

      const type = att.challengeType;
      if (type && byType[type]) {
        const stats = byType[type];
        stats.totalPlayed += 1;
        stats.averageScore += att.percentage;
        if (att.percentage > stats.bestScore) stats.bestScore = att.percentage;
        if (att.durationMs) {
          stats.averageDurationMs = (stats.averageDurationMs || 0) + att.durationMs;
        }

        if (type === 'reaction' && att.metrics?.reactionTimeMs) {
          reactionTimes.push(att.metrics.reactionTimeMs);
        }
      }
    }

    const averageScore = totalPlayed > 0 ? Math.round(totalScore / totalPlayed) : 0;

    // Normalize averages by type
    for (const key of ['quiz', 'memory', 'pattern', 'reaction'] as ChallengeType[]) {
      const stats = byType[key];
      if (stats.totalPlayed > 0) {
        stats.averageScore = Math.round(stats.averageScore / stats.totalPlayed);
        if (stats.averageDurationMs) {
          stats.averageDurationMs = Math.round(stats.averageDurationMs / stats.totalPlayed);
        }
      }
    }

    if (reactionTimes.length > 0) {
      byType.reaction.averageReactionTimeMs = Math.round(
        reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      );
    }

    const achievementsUnlocked = achievements.filter((a) => a.isUnlocked).length;

    return {
      totalPlayed,
      averageScore,
      bestScore,
      totalXp: progress.totalXp,
      currentLevel: progress.currentLevel,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      achievementsUnlocked,
      totalAchievements: achievements.length,
      byType,
    };
  }

  // --- Admin Queries ---
  public getAllProfiles(): UserProfile[] {
    return Array.from(this.state.profiles.values());
  }

  public getAllChallengesRaw(): RawChallengeRecord[] {
    return Array.from(this.state.challenges.values());
  }

  // ===================== V1.5 AI COACH & PERSONALISATION =====================

  public getCoachPreferences(userId: string): CoachPreferences {
    const existing = this.state.coachPreferences.get(userId);
    if (existing) {
      return { ...existing };
    }
    const defaultPrefs: CoachPreferences = {
      userId,
      enabled: true,
      preferredFrequency: 'daily',
      preferredLanguage: 'fr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.coachPreferences.set(userId, defaultPrefs);
    return { ...defaultPrefs };
  }

  public saveCoachPreferences(prefs: CoachPreferences): void {
    this.state.coachPreferences.set(prefs.userId, {
      ...prefs,
      updatedAt: new Date().toISOString(),
    });
  }

  public getLatestCoachInsight(
    userId: string,
    type: 'summary' | 'session_feedback' | 'recommendation',
    language?: 'fr' | 'en'
  ): CoachInsightRecord | null {
    const now = new Date().toISOString();
    const insights = Array.from(this.state.coachInsights.values())
      .filter((i) => i.userId === userId && i.type === type && (!language || i.language === language))
      .filter((i) => i.expiresAt > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return insights.length > 0 ? { ...insights[0] } : null;
  }

  public saveCoachInsight(insight: CoachInsightRecord): void {
    this.state.coachInsights.set(insight.id, { ...insight });
  }

  public getCoachInsights(userId: string, limit: number = 20): CoachInsightRecord[] {
    return Array.from(this.state.coachInsights.values())
      .filter((i) => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  public getPersonalizationProfile(userId: string): PersonalizationProfile | null {
    const profile = this.state.personalizationProfiles.get(userId);
    return profile ? { ...profile } : null;
  }

  public savePersonalizationProfile(profile: PersonalizationProfile): void {
    this.state.personalizationProfiles.set(profile.userId, {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  }
}
