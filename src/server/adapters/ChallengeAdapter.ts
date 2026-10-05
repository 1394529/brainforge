import { ScoreResult } from '../../types';

export interface ChallengeAdapter<TSubmission = unknown, TAnswerKey = unknown, TContent = unknown> {
  validateSubmission(rawSubmission: unknown): TSubmission;
  validateContent(rawContent: unknown): TContent;
  validateAnswerKey(rawAnswerKey: unknown): TAnswerKey;
  sanitizeContentForPlayer(content: TContent): unknown;
  evaluate(
    submission: TSubmission,
    answerKey: TAnswerKey,
    content: TContent
  ): ScoreResult;
}
