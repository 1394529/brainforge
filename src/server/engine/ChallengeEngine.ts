import {
  ChallengeAttemptResult,
  ChallengeSummary,
  ChallengeType,
  Locale,
  ScoreResult,
} from '../../types';
import { ChallengeAdapter } from '../adapters/ChallengeAdapter';
import { QuizAdapter } from '../adapters/QuizAdapter';
import { PatternAdapter } from '../adapters/PatternAdapter';
import { MemoryAdapter } from '../adapters/MemoryAdapter';
import { ReactionAdapter } from '../adapters/ReactionAdapter';
import { GamificationEngine } from './GamificationEngine';

export interface RawChallengeRecord {
  id: string;
  type: ChallengeType;
  skill: 'knowledge' | 'logic' | 'memory' | 'speed';
  difficulty: number;
  status: 'published' | 'draft' | 'archived';
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  version: number;
  contentFr: unknown;
  contentEn: unknown;
  answerKey: unknown;
}

export class ChallengeEngine {
  private static adapters: Record<ChallengeType, ChallengeAdapter<any, any, any>> = {
    quiz: new QuizAdapter(),
    pattern: new PatternAdapter(),
    memory: new MemoryAdapter(),
    reaction: new ReactionAdapter(),
  };

  public static getAdapter(type: ChallengeType): ChallengeAdapter<any, any, any> {
    const adapter = this.adapters[type];
    if (!adapter) {
      throw new Error(`No adapter registered for challenge type: ${type}`);
    }
    return adapter;
  }

  /**
   * Sanitizes a challenge record for client consumption.
   * STRICT SECURITY RULE: answerKey is NEVER returned to the client!
   */
  public static toClientChallenge(
    record: RawChallengeRecord,
    locale: Locale = 'en'
  ): ChallengeSummary {
    const adapter = this.getAdapter(record.type);
    const rawContent = locale === 'fr' ? record.contentFr : record.contentEn;
    const validatedContent = adapter.validateContent(rawContent);
    const safeContent = adapter.sanitizeContentForPlayer(validatedContent);

    return {
      id: record.id,
      type: record.type,
      skill: record.skill,
      difficulty: record.difficulty,
      title: locale === 'fr' ? record.titleFr : record.titleEn,
      description: locale === 'fr' ? record.descriptionFr : record.descriptionEn,
      version: record.version,
      content: safeContent,
    };
  }

  /**
   * Full end-to-end evaluation pipeline:
   * 1. Validate submission input with adapter
   * 2. Validate challenge content & answerKey with adapter
   * 3. Evaluate score via adapter + ScoringEngine
   * 4. Process gamification & XP via GamificationEngine
   * 5. Generate factual feedback
   */
  public static processAttempt(params: {
    attemptId: string;
    challenge: RawChallengeRecord;
    submission: unknown;
    previousTotalXp: number;
    locale?: Locale;
  }): {
    score: ScoreResult;
    gamification: ReturnType<typeof GamificationEngine.processGamification>;
    feedback: { title: string; message: string };
    attemptResult: ChallengeAttemptResult;
  } {
    const { attemptId, challenge, submission, previousTotalXp, locale = 'en' } = params;
    const adapter = this.getAdapter(challenge.type);

    // Validate submission format via Zod in adapter
    const validatedSubmission = adapter.validateSubmission(submission);

    // Select content and answer key
    const rawContent = locale === 'fr' ? challenge.contentFr : challenge.contentEn;
    const validatedContent = adapter.validateContent(rawContent);
    const validatedAnswerKey = adapter.validateAnswerKey(challenge.answerKey);

    // Evaluate
    const score = adapter.evaluate(validatedSubmission, validatedAnswerKey, validatedContent);

    // Gamification
    const gamification = GamificationEngine.processGamification(
      score,
      previousTotalXp,
      challenge.difficulty
    );

    // Factual feedback
    const feedback = GamificationEngine.generateFeedback(challenge.type, score, locale);

    const title = locale === 'fr' ? challenge.titleFr : challenge.titleEn;

    const attemptResult: ChallengeAttemptResult = {
      attemptId,
      challenge: {
        id: challenge.id,
        type: challenge.type,
        skill: challenge.skill,
        difficulty: challenge.difficulty,
        title,
      },
      score,
      gamification,
      feedback,
    };

    return {
      score,
      gamification,
      feedback,
      attemptResult,
    };
  }
}
