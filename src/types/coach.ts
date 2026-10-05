import { z } from 'zod';
import { ChallengeType, SkillCategory } from './index';

// The 10 official BrainForge cognitive skills
export type BrainSkill =
  | 'Memory'
  | 'Logic'
  | 'Attention'
  | 'Reaction'
  | 'Pattern Recognition'
  | 'Observation'
  | 'Mental Math'
  | 'Vocabulary'
  | 'General Knowledge'
  | 'Critical Thinking';

export const ALL_BRAIN_SKILLS: BrainSkill[] = [
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

export type TrendDirection = 'improving' | 'stable' | 'declining' | 'insufficient_data';

export interface SkillStats {
  skill: BrainSkill;
  challengeType: ChallengeType;
  totalAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  averageDurationMs: number;
  recentScore: number;
  recentAccuracy: number;
  trend: TrendDirection;
}

export interface PerformanceSummary {
  totalCompleted: number;
  overallAverageScore: number;
  overallAverageAccuracy: number;
  overallAverageDurationMs: number;
  skills: Record<BrainSkill, SkillStats>;
  strongestSkills: BrainSkill[];
  focusSkills: BrainSkill[];
  recentAttemptsCount: number;
  isColdStart: boolean;
}

export type RecommendationType =
  | 'practice_skill'
  | 'maintain_strength'
  | 'increase_difficulty'
  | 'return_to_activity'
  | 'daily_goal';

export interface CoachRecommendation {
  id: string;
  type: RecommendationType;
  skill: BrainSkill;
  challengeType: ChallengeType;
  difficulty: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedChallengeId?: string;
  suggestedChallengeTitle?: string;
}

export interface PersonalizationProfile {
  userId: string;
  primaryFocusSkill: BrainSkill;
  secondaryFocusSkill?: BrainSkill;
  strongestSkill: BrainSkill;
  preferredChallengeType: ChallengeType;
  recommendedDifficulty: number;
  confidence: 'high' | 'medium' | 'low';
  lastCalculatedAt: string;
  updatedAt: string;
}

export interface CoachPreferences {
  userId: string;
  enabled: boolean;
  preferredFrequency: 'daily' | 'weekly' | 'per_session';
  preferredLanguage: 'fr' | 'en';
  createdAt: string;
  updatedAt: string;
}

export interface CoachContext {
  userId: string;
  language: 'fr' | 'en';
  level: number;
  totalXp: number;
  streak: number;
  recentPerformance: {
    totalAttempts: number;
    averageScore: number;
    averageAccuracy: number;
    averageDurationMs: number;
    recentWindowAttempts: number;
  };
  skillPerformance: Array<{
    skill: BrainSkill;
    averageScore: number;
    averageAccuracy: number;
    trend: TrendDirection;
    attempts: number;
  }>;
  recentAttemptsSummary: Array<{
    challengeType: ChallengeType;
    difficulty: number;
    score: number;
    percentage: number;
    isCorrect?: boolean;
    date: string;
  }>;
  achievementsCount: number;
  recommendations: CoachRecommendation[];
  isColdStart: boolean;
}

export const CoachResponseSchema = z.object({
  summary: z.string().max(400),
  strengths: z.array(z.string()).max(4),
  focusAreas: z.array(z.string()).max(4),
  recommendations: z.array(
    z.object({
      type: z.enum([
        'practice_skill',
        'maintain_strength',
        'increase_difficulty',
        'return_to_activity',
        'daily_goal',
      ]),
      skill: z.string(),
      challengeType: z.enum(['quiz', 'pattern', 'memory', 'reaction']),
      difficulty: z.number().min(1).max(5),
      reason: z.string().max(250),
      priority: z.enum(['high', 'medium', 'low']),
      suggestedChallengeId: z.string().optional(),
    })
  ).max(5),
  encouragement: z.string().max(250),
  confidence: z.enum(['high', 'medium', 'low']),
  dailyGoal: z.string().max(200).optional(),
  suggestedChallenge: z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['quiz', 'pattern', 'memory', 'reaction']),
    difficulty: z.number().min(1).max(5),
    reason: z.string(),
  }).optional(),
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;

export interface CoachInsightRecord {
  id: string;
  userId: string;
  type: 'summary' | 'session_feedback' | 'recommendation';
  language: 'fr' | 'en';
  content: string;
  structuredData: CoachResponse;
  createdAt: string;
  expiresAt: string;
}

export interface SessionFeedbackContext {
  userId: string;
  language: 'fr' | 'en';
  challengeType: ChallengeType;
  difficulty: number;
  scorePercentage: number;
  durationMs: number;
  userAverageScore: number;
  isPersonalBest: boolean;
}
