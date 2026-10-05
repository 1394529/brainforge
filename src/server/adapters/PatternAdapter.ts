import { ChallengeAdapter } from './ChallengeAdapter';
import {
  PatternAnswerKey,
  PatternAnswerKeySchema,
  PatternContent,
  PatternContentSchema,
  PatternSubmission,
  PatternSubmissionSchema,
} from '../../types/pattern';
import { ScoreResult } from '../../types';
import { ScoringEngine } from '../engine/ScoringEngine';

export class PatternAdapter implements ChallengeAdapter<PatternSubmission, PatternAnswerKey, PatternContent> {
  public validateSubmission(rawSubmission: unknown): PatternSubmission {
    return PatternSubmissionSchema.parse(rawSubmission);
  }

  public validateContent(rawContent: unknown): PatternContent {
    return PatternContentSchema.parse(rawContent);
  }

  public validateAnswerKey(rawAnswerKey: unknown): PatternAnswerKey {
    return PatternAnswerKeySchema.parse(rawAnswerKey);
  }

  public sanitizeContentForPlayer(content: PatternContent): PatternContent {
    return {
      sequence: content.sequence,
      options: content.options,
      hint: content.hint,
    };
  }

  public evaluate(
    submission: PatternSubmission,
    answerKey: PatternAnswerKey,
    _content: PatternContent
  ): ScoreResult {
    const isCorrect = String(submission.selectedOption).trim() === String(answerKey.correctOption).trim();
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
