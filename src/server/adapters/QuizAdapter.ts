import { ChallengeAdapter } from './ChallengeAdapter';
import {
  QuizAnswerKey,
  QuizAnswerKeySchema,
  QuizContent,
  QuizContentSchema,
  QuizSubmission,
  QuizSubmissionSchema,
} from '../../types/quiz';
import { ScoreResult } from '../../types';
import { ScoringEngine } from '../engine/ScoringEngine';

export class QuizAdapter implements ChallengeAdapter<QuizSubmission, QuizAnswerKey, QuizContent> {
  public validateSubmission(rawSubmission: unknown): QuizSubmission {
    return QuizSubmissionSchema.parse(rawSubmission);
  }

  public validateContent(rawContent: unknown): QuizContent {
    return QuizContentSchema.parse(rawContent);
  }

  public validateAnswerKey(rawAnswerKey: unknown): QuizAnswerKey {
    return QuizAnswerKeySchema.parse(rawAnswerKey);
  }

  public sanitizeContentForPlayer(content: QuizContent): QuizContent {
    // Return question and options without any internal flags
    return {
      question: content.question,
      options: content.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
      })),
    };
  }

  public evaluate(
    submission: QuizSubmission,
    answerKey: QuizAnswerKey,
    _content: QuizContent
  ): ScoreResult {
    const isCorrect = submission.selectedOptionId.trim() === answerKey.correctOptionId.trim();
    const rawScore = isCorrect ? 100 : 0;

    return ScoringEngine.normalizeScore({
      rawScore,
      maxScore: 100,
      isCorrect,
      durationMs: submission.durationMs,
      metrics: {
        accuracy: isCorrect ? 1 : 0,
      },
    });
  }
}
