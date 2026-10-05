import crypto from 'crypto';
import {
  CoachContext,
  CoachInsightRecord,
  CoachPreferences,
  CoachResponse,
  PersonalizationProfile,
  SessionFeedbackContext,
} from '../../../types';
import { Database } from '../../db';
import { PerformanceAggregator } from './PerformanceAggregator';
import { PersonalizationEngine } from './PersonalizationEngine';
import { AIProvider } from './providers/AIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { MockAIProvider } from './providers/MockAIProvider';
import { Logger } from '../../logger';

// Rate limit: max requests per user per time window
export const COACH_RATE_LIMIT_MAX_REQUESTS = 10;
export const COACH_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const COACH_INSIGHT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

export class CoachService {
  private static instance: CoachService;
  private provider: AIProvider;
  private rateLimits: Map<string, RateLimitTracker> = new Map();

  private constructor() {
    this.provider = new GeminiProvider();
  }

  public static getInstance(): CoachService {
    if (!CoachService.instance) {
      CoachService.instance = new CoachService();
    }
    return CoachService.instance;
  }

  public static resetInstance(): void {
    CoachService.instance = new CoachService();
  }

  public setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Rate limiting enforcement per user
   */
  public checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const tracker = this.rateLimits.get(userId);

    if (!tracker || now > tracker.resetAt) {
      this.rateLimits.set(userId, {
        count: 1,
        resetAt: now + COACH_RATE_LIMIT_WINDOW_MS,
      });
      return {
        allowed: true,
        remaining: COACH_RATE_LIMIT_MAX_REQUESTS - 1,
        resetInMs: COACH_RATE_LIMIT_WINDOW_MS,
      };
    }

    if (tracker.count >= COACH_RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetInMs: tracker.resetAt - now,
      };
    }

    tracker.count++;
    return {
      allowed: true,
      remaining: COACH_RATE_LIMIT_MAX_REQUESTS - tracker.count,
      resetInMs: tracker.resetAt - now,
    };
  }

  /**
   * Retrieves or computes the AI Coach summary and recommendations.
   * Leverages caching, rate limiting, and fallback mechanisms.
   */
  public async getCoachSummary(
    userId: string,
    language: 'fr' | 'en' = 'fr',
    forceRefresh: boolean = false
  ): Promise<{
    enabled: boolean;
    insight: CoachResponse | null;
    isColdStart: boolean;
    challengesCount: number;
    profile: PersonalizationProfile | null;
    preferences: CoachPreferences;
  }> {
    const db = Database.getInstance();
    const preferences = db.getCoachPreferences(userId);

    // If user disabled AI Coach, return clean disabled payload
    if (!preferences.enabled) {
      const attempts = db.getChallengeAttempts(userId);
      const summary = PerformanceAggregator.aggregate(attempts);
      const { profile } = PersonalizationEngine.generateRecommendations(userId, summary, language);
      return {
        enabled: false,
        insight: null,
        isColdStart: summary.isColdStart,
        challengesCount: summary.totalCompleted,
        profile,
        preferences,
      };
    }

    // Check cache if not forcing refresh
    if (!forceRefresh) {
      const cached = db.getLatestCoachInsight(userId, 'summary', language);
      if (cached) {
        const profile = db.getPersonalizationProfile(userId);
        const attempts = db.getChallengeAttempts(userId);
        return {
          enabled: true,
          insight: cached.structuredData,
          isColdStart: attempts.length < 5,
          challengesCount: attempts.length,
          profile,
          preferences,
        };
      }
    }

    // Rate limit check for fresh generation
    if (forceRefresh) {
      const rateLimit = this.checkRateLimit(userId);
      if (!rateLimit.allowed) {
        Logger.warn('Coach rate limit exceeded for user', { userId });
        const existing = db.getLatestCoachInsight(userId, 'summary', language);
        if (existing) {
          const profile = db.getPersonalizationProfile(userId);
          const attempts = db.getChallengeAttempts(userId);
          return {
            enabled: true,
            insight: existing.structuredData,
            isColdStart: attempts.length < 5,
            challengesCount: attempts.length,
            profile,
            preferences,
          };
        }
      }
    }

    // 1. Aggregate performance data
    const attempts = db.getChallengeAttempts(userId);
    const summary = PerformanceAggregator.aggregate(attempts);

    // 2. Compute deterministic recommendations & profile
    const { recommendations, profile, suggestedChallenge } =
      PersonalizationEngine.generateRecommendations(userId, summary, language);
    db.savePersonalizationProfile(profile);

    // 3. Prepare Coach Context (strictly minimal data)
    const progress = db.getUserProgress(userId);
    const streak = db.getUserStreak(userId);
    const achievements = db.getUserAchievements(userId);

    const context: CoachContext = {
      userId,
      language,
      level: progress.currentLevel,
      totalXp: progress.totalXp,
      streak: streak.currentStreak,
      recentPerformance: {
        totalAttempts: summary.totalCompleted,
        averageScore: summary.overallAverageScore,
        averageAccuracy: summary.overallAverageAccuracy,
        averageDurationMs: summary.overallAverageDurationMs,
        recentWindowAttempts: summary.recentAttemptsCount,
      },
      skillPerformance: Object.values(summary.skills).map((s) => ({
        skill: s.skill,
        averageScore: s.averageScore,
        averageAccuracy: s.averageAccuracy,
        trend: s.trend,
        attempts: s.totalAttempts,
      })),
      recentAttemptsSummary: attempts.slice(-5).map((a) => ({
        challengeType: a.challengeType || 'quiz',
        difficulty: 2,
        score: a.rawScore,
        percentage: a.percentage,
        isCorrect: a.isCorrect,
        date: a.createdAt.split('T')[0],
      })),
      achievementsCount: achievements.length,
      recommendations,
      isColdStart: summary.isColdStart,
    };

    // 4. Generate coaching insight via Provider
    let insightResponse: CoachResponse;
    try {
      insightResponse = await this.provider.generateCoachInsight(context);
    } catch (err: any) {
      Logger.error('AI provider error, falling back to mock provider', { error: err.message });
      const fallback = new MockAIProvider();
      insightResponse = await fallback.generateCoachInsight(context);
    }

    // Attach suggested challenge if available
    if (suggestedChallenge && !insightResponse.suggestedChallenge) {
      insightResponse.suggestedChallenge = suggestedChallenge;
    }

    // 5. Store in coach_insights table with expiration
    const insightRecord: CoachInsightRecord = {
      id: `insight-${crypto.randomUUID()}`,
      userId,
      type: 'summary',
      language,
      content: insightResponse.summary,
      structuredData: insightResponse,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + COACH_INSIGHT_CACHE_TTL_MS).toISOString(),
    };

    db.saveCoachInsight(insightRecord);

    return {
      enabled: true,
      insight: insightResponse,
      isColdStart: summary.isColdStart,
      challengesCount: summary.totalCompleted,
      profile,
      preferences,
    };
  }

  /**
   * Generates instant session feedback after an attempt.
   */
  public async getSessionFeedback(
    userId: string,
    challengeType: 'quiz' | 'pattern' | 'memory' | 'reaction',
    difficulty: number,
    scorePercentage: number,
    durationMs: number,
    language: 'fr' | 'en' = 'fr'
  ): Promise<string> {
    const db = Database.getInstance();
    const attempts = db.getChallengeAttempts(userId);
    const typeAttempts = attempts.filter((a) => a.challengeType === challengeType);

    const userAverageScore =
      typeAttempts.length > 0
        ? Math.round(typeAttempts.reduce((acc, a) => acc + a.percentage, 0) / typeAttempts.length)
        : scorePercentage;

    const bestScore =
      typeAttempts.length > 0 ? Math.max(...typeAttempts.map((a) => a.percentage)) : 0;
    const isPersonalBest = scorePercentage > bestScore;

    const context: SessionFeedbackContext = {
      userId,
      language,
      challengeType,
      difficulty,
      scorePercentage,
      durationMs,
      userAverageScore,
      isPersonalBest,
    };

    try {
      return await this.provider.generateSessionFeedback(context);
    } catch {
      const fallback = new MockAIProvider();
      return fallback.generateSessionFeedback(context);
    }
  }
}
