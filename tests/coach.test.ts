import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Database } from '../src/server/db';
import { PerformanceAggregator } from '../src/server/services/coach/PerformanceAggregator';
import { PersonalizationEngine } from '../src/server/services/coach/PersonalizationEngine';
import { MockAIProvider } from '../src/server/services/coach/providers/MockAIProvider';
import { GeminiProvider } from '../src/server/services/coach/providers/GeminiProvider';
import { CoachService } from '../src/server/services/coach/CoachService';
import { ChallengeAttemptRecord, CoachResponseSchema, CoachContext, BrainSkill } from '../src/types';

describe('V1.5 AI Coach & Personalization Engine', () => {
  const db = Database.getInstance();

  it('correctly detects cold start when user has fewer than 5 completed challenges', () => {
    const attempts: ChallengeAttemptRecord[] = [
      {
        id: 'att-1',
        userId: 'user-cold',
        challengeId: 'c-1',
        challengeType: 'quiz',
        version: 1,
        rawScore: 80,
        maxScore: 100,
        percentage: 80,
        durationMs: 15000,
        xpEarned: 80,
        metrics: { accuracy: 80, reactionTimeMs: 15000 },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'att-2',
        userId: 'user-cold',
        challengeId: 'c-2',
        challengeType: 'memory',
        version: 1,
        rawScore: 90,
        maxScore: 100,
        percentage: 90,
        durationMs: 12000,
        xpEarned: 90,
        metrics: { accuracy: 90, reactionTimeMs: 12000 },
        createdAt: new Date().toISOString(),
      },
    ];

    const summary = PerformanceAggregator.aggregate(attempts);
    assert.strictEqual(summary.isColdStart, true);
    assert.strictEqual(summary.totalCompleted, 2);
    assert.strictEqual(summary.recentAttemptsCount, 2);
  });

  it('aggregates performance accurately and identifies strongest and focus skills for >= 5 attempts', () => {
    const attempts: ChallengeAttemptRecord[] = [
      // High score in Memory
      {
        id: 'att-1',
        userId: 'user-ready',
        challengeId: 'c-m1',
        challengeType: 'memory',
        version: 1,
        rawScore: 95,
        maxScore: 100,
        percentage: 95,
        durationMs: 10000,
        xpEarned: 95,
        metrics: { accuracy: 95, reactionTimeMs: 10000 },
        createdAt: '2026-09-20T10:00:00Z',
      },
      {
        id: 'att-2',
        userId: 'user-ready',
        challengeId: 'c-m2',
        challengeType: 'memory',
        version: 1,
        rawScore: 100,
        maxScore: 100,
        percentage: 100,
        durationMs: 9000,
        xpEarned: 100,
        metrics: { accuracy: 100, reactionTimeMs: 9000 },
        createdAt: '2026-09-21T10:00:00Z',
      },
      // Lower score in Reaction
      {
        id: 'att-3',
        userId: 'user-ready',
        challengeId: 'c-r1',
        challengeType: 'reaction',
        version: 1,
        rawScore: 45,
        maxScore: 100,
        percentage: 45,
        durationMs: 2000,
        xpEarned: 45,
        metrics: { accuracy: 45, reactionTimeMs: 2000 },
        createdAt: '2026-09-22T10:00:00Z',
      },
      {
        id: 'att-4',
        userId: 'user-ready',
        challengeId: 'c-r2',
        challengeType: 'reaction',
        version: 1,
        rawScore: 50,
        maxScore: 100,
        percentage: 50,
        durationMs: 1900,
        xpEarned: 50,
        metrics: { accuracy: 50, reactionTimeMs: 1900 },
        createdAt: '2026-09-23T10:00:00Z',
      },
      // Quiz
      {
        id: 'att-5',
        userId: 'user-ready',
        challengeId: 'c-q1',
        challengeType: 'quiz',
        version: 1,
        rawScore: 75,
        maxScore: 100,
        percentage: 75,
        durationMs: 14000,
        xpEarned: 75,
        metrics: { accuracy: 75, reactionTimeMs: 14000 },
        createdAt: '2026-09-24T10:00:00Z',
      },
    ];

    const summary = PerformanceAggregator.aggregate(attempts);
    assert.strictEqual(summary.isColdStart, false);
    assert.strictEqual(summary.totalCompleted, 5);

    // Memory should be among strongest
    assert.ok(summary.strongestSkills.includes('Memory'));
    // Reaction should be among focus skills
    assert.ok(summary.focusSkills.includes('Reaction'));
  });

  it('generates personalized recommendations and calibrates difficulty', async () => {
    const attempts: ChallengeAttemptRecord[] = [
      {
        id: 'att-1',
        userId: 'user-profile',
        challengeId: 'c-m1',
        challengeType: 'memory',
        version: 1,
        rawScore: 90,
        maxScore: 100,
        percentage: 90,
        durationMs: 10000,
        xpEarned: 90,
        metrics: { accuracy: 90, reactionTimeMs: 10000 },
        createdAt: '2026-09-20T10:00:00Z',
      },
      {
        id: 'att-2',
        userId: 'user-profile',
        challengeId: 'c-m2',
        challengeType: 'memory',
        version: 1,
        rawScore: 95,
        maxScore: 100,
        percentage: 95,
        durationMs: 9000,
        xpEarned: 95,
        metrics: { accuracy: 95, reactionTimeMs: 9000 },
        createdAt: '2026-09-21T10:00:00Z',
      },
      {
        id: 'att-3',
        userId: 'user-profile',
        challengeId: 'c-r1',
        challengeType: 'reaction',
        version: 1,
        rawScore: 40,
        maxScore: 100,
        percentage: 40,
        durationMs: 2000,
        xpEarned: 40,
        metrics: { accuracy: 40, reactionTimeMs: 2000 },
        createdAt: '2026-09-22T10:00:00Z',
      },
      {
        id: 'att-4',
        userId: 'user-profile',
        challengeId: 'c-p1',
        challengeType: 'pattern',
        version: 1,
        rawScore: 80,
        maxScore: 100,
        percentage: 80,
        durationMs: 8000,
        xpEarned: 80,
        metrics: { accuracy: 80, reactionTimeMs: 8000 },
        createdAt: '2026-09-23T10:00:00Z',
      },
      {
        id: 'att-5',
        userId: 'user-profile',
        challengeId: 'c-q1',
        challengeType: 'quiz',
        version: 1,
        rawScore: 85,
        maxScore: 100,
        percentage: 85,
        durationMs: 12000,
        xpEarned: 85,
        metrics: { accuracy: 85, reactionTimeMs: 12000 },
        createdAt: '2026-09-24T10:00:00Z',
      },
    ];

    const summary = PerformanceAggregator.aggregate(attempts);
    const { recommendations, profile } = PersonalizationEngine.generateRecommendations(
      'user-profile',
      summary,
      'en'
    );

    assert.ok(recommendations.length > 0);
    assert.strictEqual(recommendations[0].priority, 'high');
    assert.strictEqual(profile.userId, 'user-profile');
    assert.strictEqual(profile.strongestSkill, 'Memory');
    assert.ok(profile.recommendedDifficulty >= 1 && profile.recommendedDifficulty <= 5);
  });

  it('guarantees MockAIProvider output passes strict Zod validation schema in both EN and FR', async () => {
    const provider = new MockAIProvider();
    const summary = PerformanceAggregator.aggregate([]);
    const context: CoachContext = {
      userId: 'test-user',
      language: 'fr',
      level: 3,
      totalXp: 1200,
      streak: 4,
      isColdStart: false,
      recentPerformance: {
        totalAttempts: 10,
        averageScore: 82,
        averageAccuracy: 85,
        averageDurationMs: 8000,
        recentWindowAttempts: 10,
      },
      skillPerformance: [
        {
          skill: 'Memory',
          averageScore: 90,
          averageAccuracy: 92,
          trend: 'improving',
          attempts: 5,
        },
        {
          skill: 'Reaction',
          averageScore: 65,
          averageAccuracy: 70,
          trend: 'declining',
          attempts: 5,
        },
      ],
      recentAttemptsSummary: [],
      achievementsCount: 3,
      recommendations: [],
    };

    // Test French output
    const frInsight = await provider.generateCoachInsight(context);
    const parsedFr = CoachResponseSchema.safeParse(frInsight);
    assert.strictEqual(parsedFr.success, true);
    assert.ok(frInsight.summary.length > 0);
    assert.ok(frInsight.encouragement.length > 0);

    // Test English output
    const enContext = { ...context, language: 'en' as const };
    const enInsight = await provider.generateCoachInsight(enContext);
    const parsedEn = CoachResponseSchema.safeParse(enInsight);
    assert.strictEqual(parsedEn.success, true);
    assert.ok(enInsight.summary.length > 0);
    assert.ok(enInsight.encouragement.length > 0);
  });

  it('complies strictly with safety rules: no medical or IQ claims in coach feedback', async () => {
    const provider = new MockAIProvider();
    const forbiddenPhrases = [
      'iq',
      'intelligence quotient',
      'dementia',
      'alzheimer',
      'diagnosis',
      'clinical',
      'medical evaluation',
      'brain disease',
      'adhd',
    ];

    const sessionFeedbackEn = await provider.generateSessionFeedback({
      userId: 'user-feedback',
      challengeType: 'reaction',
      difficulty: 2,
      scorePercentage: 85,
      durationMs: 400,
      userAverageScore: 70,
      isPersonalBest: true,
      language: 'en',
    });

    const lowerEn = sessionFeedbackEn.toLowerCase();
    for (const phrase of forbiddenPhrases) {
      assert.strictEqual(lowerEn.includes(phrase), false, `Forbidden medical claim found: ${phrase}`);
    }

    const sessionFeedbackFr = await provider.generateSessionFeedback({
      userId: 'user-feedback',
      challengeType: 'memory',
      difficulty: 3,
      scorePercentage: 90,
      durationMs: 8000,
      userAverageScore: 75,
      isPersonalBest: false,
      language: 'fr',
    });

    const lowerFr = sessionFeedbackFr.toLowerCase();
    for (const phrase of ['qi', 'quotient intellectuel', 'maladie', 'diagnostic', 'clinique']) {
      assert.strictEqual(lowerFr.includes(phrase), false, `Forbidden French medical claim found: ${phrase}`);
    }
  });

  it('manages coach preferences and enforces rate limits in CoachService', async () => {
    const coachService = CoachService.getInstance();
    const testUserId = `test-user-${Date.now()}`;

    // Default preferences
    const defaultPrefs = db.getCoachPreferences(testUserId);
    assert.strictEqual(defaultPrefs.enabled, true);

    // Update preferences (disable coach)
    db.saveCoachPreferences({
      userId: testUserId,
      enabled: false,
      preferredFrequency: 'weekly',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const updated = db.getCoachPreferences(testUserId);
    assert.strictEqual(updated.enabled, false);
    assert.strictEqual(updated.preferredFrequency, 'weekly');
    assert.strictEqual(updated.preferredLanguage, 'en');

    // Verify rate limit tracker
    const r1 = coachService.checkRateLimit(testUserId);
    assert.strictEqual(r1.allowed, true);
    assert.strictEqual(r1.remaining, 9);
  });

  it('falls back gracefully to deterministic provider in GeminiProvider when client unconfigured or on error', async () => {
    // Save current API key and reset to test fallback behavior
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const geminiProvider = new GeminiProvider();
      const summary = PerformanceAggregator.aggregate([]);
      const context: CoachContext = {
        userId: 'fallback-test-user',
        language: 'en',
        level: 1,
        totalXp: 100,
        streak: 1,
        isColdStart: true,
        recentPerformance: {
          totalAttempts: 0,
          averageScore: 0,
          averageAccuracy: 0,
          averageDurationMs: 0,
          recentWindowAttempts: 0,
        },
        skillPerformance: [],
        recentAttemptsSummary: [],
        achievementsCount: 0,
        recommendations: [],
      };

      const result = await geminiProvider.generateCoachInsight(context);
      assert.ok(result);
      assert.ok(result.summary);
      assert.ok(result.recommendations);
    } finally {
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    }
  });

  it('strictly enforces RLS isolation: User A insights and preferences cannot be seen by User B', () => {
    const userA = 'user-isolated-A';
    const userB = 'user-isolated-B';

    // Save preferences and insights for User A
    db.saveCoachPreferences({
      userId: userA,
      enabled: false,
      preferredFrequency: 'per_session',
      preferredLanguage: 'fr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.saveCoachInsight({
      id: 'insight-A-1',
      userId: userA,
      type: 'summary',
      language: 'fr',
      content: 'Insight for user A only',
      structuredData: {
        summary: 'Summary A',
        strengths: ['Memory'],
        focusAreas: ['Reaction'],
        recommendations: [],
        encouragement: 'Go A!',
        confidence: 'high',
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });

    // Query User B
    const userBPrefs = db.getCoachPreferences(userB);
    const userBInsights = db.getCoachInsights(userB);

    assert.strictEqual(userBPrefs.userId, userB);
    assert.strictEqual(userBPrefs.enabled, true, 'User B must have default enabled = true');
    assert.strictEqual(userBInsights.length, 0, 'User B must not see any insights from User A');
  });

  it('guarantees exact V1.5 cold start messaging in both FR and EN', async () => {
    const provider = new MockAIProvider();
    const emptySummary = PerformanceAggregator.aggregate([]);

    const frRecs = PersonalizationEngine.generateRecommendations('cold-user-fr', emptySummary, 'fr');
    assert.strictEqual(
      frRecs.recommendations[0].reason,
      'Complétez vos 5 premiers défis pour débloquer votre profil de personnalisation.'
    );

    const enRecs = PersonalizationEngine.generateRecommendations('cold-user-en', emptySummary, 'en');
    assert.strictEqual(
      enRecs.recommendations[0].reason,
      'Complete your first 5 challenges to unlock your personalized coach profile.'
    );
  });

  it('supports all 10 official cognitive skills from specification', () => {
    const officialSkills = [
      'Memory',
      'Logic',
      'Attention',
      'Reaction',
      'Pattern Recognition',
      'Observation',
      'Mental Math',
      'Vocabulary',
      'General Knowledge',
      'Critical Thinking',
    ];

    const attempts: ChallengeAttemptRecord[] = [];
    const summary = PerformanceAggregator.aggregate(attempts);

    for (const skill of officialSkills) {
      assert.ok(summary.skills[skill as BrainSkill], `Skill ${skill} must be tracked in PerformanceSummary`);
      assert.strictEqual(summary.skills[skill as BrainSkill].trend, 'insufficient_data');
    }
  });

  it('runs complete closed loop: PLAY -> SCORE -> AGGREGATE -> PERSONALIZATION -> RECOMMENDATION -> ACTION', async () => {
    const userId = `loop-user-${Date.now()}`;
    const allPublished = db.getAllPublishedChallenges();
    assert.ok(allPublished.length > 0);

    // 1. User completes 5 challenges
    const initialAttempts: ChallengeAttemptRecord[] = [
      {
        id: `loop-att-1`,
        userId,
        challengeId: allPublished[0].id,
        challengeType: allPublished[0].type,
        version: 1,
        rawScore: 90,
        maxScore: 100,
        percentage: 90,
        durationMs: 8000,
        xpEarned: 90,
        metrics: { accuracy: 90, reactionTimeMs: 8000 },
        createdAt: '2026-09-29T10:00:00Z',
      },
      {
        id: `loop-att-2`,
        userId,
        challengeId: allPublished[1].id,
        challengeType: allPublished[1].type,
        version: 1,
        rawScore: 85,
        maxScore: 100,
        percentage: 85,
        durationMs: 9000,
        xpEarned: 85,
        metrics: { accuracy: 85, reactionTimeMs: 9000 },
        createdAt: '2026-09-29T11:00:00Z',
      },
      {
        id: `loop-att-3`,
        userId,
        challengeId: allPublished[2].id,
        challengeType: allPublished[2].type,
        version: 1,
        rawScore: 95,
        maxScore: 100,
        percentage: 95,
        durationMs: 7000,
        xpEarned: 95,
        metrics: { accuracy: 95, reactionTimeMs: 7000 },
        createdAt: '2026-09-29T12:00:00Z',
      },
      {
        id: `loop-att-4`,
        userId,
        challengeId: allPublished[3].id,
        challengeType: allPublished[3].type,
        version: 1,
        rawScore: 60,
        maxScore: 100,
        percentage: 60,
        durationMs: 12000,
        xpEarned: 60,
        metrics: { accuracy: 60, reactionTimeMs: 12000 },
        createdAt: '2026-09-29T13:00:00Z',
      },
      {
        id: `loop-att-5`,
        userId,
        challengeId: allPublished[4].id,
        challengeType: allPublished[4].type,
        version: 1,
        rawScore: 70,
        maxScore: 100,
        percentage: 70,
        durationMs: 11000,
        xpEarned: 70,
        metrics: { accuracy: 70, reactionTimeMs: 11000 },
        createdAt: '2026-09-29T14:00:00Z',
      },
    ];

    // 2. Aggregate
    const summary = PerformanceAggregator.aggregate(initialAttempts);
    assert.strictEqual(summary.isColdStart, false);

    // 3. Personalize
    const { recommendations, profile, suggestedChallenge } = PersonalizationEngine.generateRecommendations(
      userId,
      summary,
      'fr'
    );

    assert.ok(recommendations.length > 0);
    assert.ok(profile);
    assert.ok(suggestedChallenge);

    // 4. Action: Suggested challenge must exist in the published challenge registry
    const targetChallenge = allPublished.find((c) => c.id === suggestedChallenge.id);
    assert.ok(targetChallenge, 'Recommended challenge must exist in published challenge database');
  });
});
