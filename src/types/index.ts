export type ChallengeType = 'quiz' | 'pattern' | 'memory' | 'reaction';
export type SkillCategory = 'knowledge' | 'logic' | 'memory' | 'speed';
export type Locale = 'fr' | 'en';

export interface ScoreMetrics {
  accuracy?: number;
  reactionTimeMs?: number;
  correctItems?: number;
  totalItems?: number;
  isFalseStart?: boolean;
}

export interface ScoreResult {
  rawScore: number;
  maxScore: number;
  percentage: number;
  isCorrect?: boolean;
  durationMs?: number;
  metrics?: ScoreMetrics;
  metadata?: Record<string, unknown>;
}

export interface LevelProgress {
  currentLevel: number;
  totalXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

export interface GamificationResult {
  xpEarned: number;
  totalXp: number;
  currentLevel: number;
  levelProgress: number;
  leveledUp: boolean;
  previousLevel?: number;
}

export interface ChallengeAttemptResult {
  attemptId: string;
  challenge: {
    id: string;
    type: ChallengeType;
    skill: SkillCategory;
    difficulty: number;
    title: string;
  };
  score: ScoreResult;
  gamification: GamificationResult;
  feedback?: {
    title: string;
    message: string;
  };
}

export interface ChallengeSummary {
  id: string;
  type: ChallengeType;
  skill: SkillCategory;
  difficulty: number;
  title: string;
  description: string;
  version: number;
  content: unknown; // Safe content for the player (without answer_key)
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  timezone?: string;
  showInLeaderboard?: boolean;
  createdAt: string;
}

export interface UserProgressData {
  userId: string;
  totalXp: number;
  currentLevel: number;
  levelProgress: LevelProgress;
  updatedAt: string;
}

export interface XpTransactionRecord {
  id: string;
  userId: string;
  attemptId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface ChallengeAttemptRecord {
  id: string;
  userId: string;
  challengeId: string;
  challengeTitle?: string;
  challengeType?: ChallengeType;
  version: number;
  rawScore: number;
  maxScore: number;
  percentage: number;
  durationMs: number;
  isCorrect?: boolean;
  metrics: ScoreMetrics;
  xpEarned: number;
  isDailyChallenge?: boolean;
  createdAt: string;
}

export interface SessionSummaryData {
  sessionId: string;
  totalChallenges: number;
  completedChallenges: number;
  averageScore: number;
  totalXpEarned: number;
  totalDurationMs: number;
  results: ChallengeAttemptResult[];
}

// ===================== V1.4 GAMIFICATION TYPES =====================

export interface DailyChallengeRecord {
  id: string;
  challengeId: string;
  challengeDate: string; // YYYY-MM-DD
  difficulty: number;
  bonusXp: number;
  createdAt: string;
}

export interface DailyChallengeStatus {
  challengeDate: string;
  challenge: ChallengeSummary | null;
  isCompleted: boolean;
  completedAttempt?: ChallengeAttemptRecord;
  bonusXp: number;
}

export interface UserStreakRecord {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  completedDates: string[]; // Recent dates [YYYY-MM-DD, ...]
  updatedAt: string;
}

export type RequirementType =
  | 'first_challenge'
  | 'first_daily'
  | 'streak'
  | 'level'
  | 'quiz_score'
  | 'memory_score'
  | 'reaction_score'
  | 'speed_score'
  | 'total_challenges';

export interface AchievementRecord {
  id: string;
  code: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  category: 'general' | 'streak' | 'performance' | 'level';
  requirementType: RequirementType;
  requirementValue: number;
  xpBonus: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievementRecord {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface AchievementWithStatus extends AchievementRecord {
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardData {
  timeframe: 'weekly' | 'all_time';
  weekIdentifier?: string;
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

export interface GameStats {
  totalPlayed: number;
  averageScore: number;
  bestScore: number;
  averageDurationMs?: number;
  averageReactionTimeMs?: number;
}

export interface UserStatsData {
  totalPlayed: number;
  averageScore: number;
  bestScore: number;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  byType: Record<ChallengeType, GameStats>;
}

export interface GamificationNotification {
  id: string;
  type: 'xp' | 'level_up' | 'streak' | 'achievement' | 'daily';
  title: string;
  message: string;
  icon?: string;
  xpAmount?: number;
}

// ===================== V1.5 AI COACH & PERSONALISATION TYPES =====================
export * from './coach';
