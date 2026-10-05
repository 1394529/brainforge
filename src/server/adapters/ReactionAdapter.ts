import { ChallengeAdapter } from './ChallengeAdapter';
import {
  ReactionAnswerKey,
  ReactionAnswerKeySchema,
  ReactionContent,
  ReactionContentSchema,
  ReactionSubmission,
  ReactionSubmissionSchema,
} from '../../types/reaction';
import { ScoreResult } from '../../types';
import { ScoringEngine } from '../engine/ScoringEngine';

export class ReactionAdapter implements ChallengeAdapter<ReactionSubmission, ReactionAnswerKey, ReactionContent> {
  public validateSubmission(rawSubmission: unknown): ReactionSubmission {
    return ReactionSubmissionSchema.parse(rawSubmission);
  }

  public validateContent(rawContent: unknown): ReactionContent {
    return ReactionContentSchema.parse(rawContent);
  }

  public validateAnswerKey(rawAnswerKey: unknown): ReactionAnswerKey {
    return ReactionAnswerKeySchema.parse(rawAnswerKey);
  }

  public sanitizeContentForPlayer(content: ReactionContent): ReactionContent {
    return {
      prompt: content.prompt,
      minDelayMs: content.minDelayMs,
      maxDelayMs: content.maxDelayMs,
      targetAction: content.targetAction,
    };
  }

  public evaluate(
    submission: ReactionSubmission,
    _answerKey: ReactionAnswerKey,
    _content: ReactionContent
  ): ScoreResult {
    // Check if false start reported or impossible physiological reaction time (< 50ms implies anticipation/pre-clicking)
    const isFalseStart = submission.isFalseStart || submission.reactionTimeMs < 50;

    return ScoringEngine.calculateReactionScore(submission.reactionTimeMs, isFalseStart);
  }
}
