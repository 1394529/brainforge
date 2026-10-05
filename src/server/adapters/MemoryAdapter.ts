import { ChallengeAdapter } from './ChallengeAdapter';
import {
  MemoryAnswerKey,
  MemoryAnswerKeySchema,
  MemoryContent,
  MemoryContentSchema,
  MemorySubmission,
  MemorySubmissionSchema,
} from '../../types/memory';
import { ScoreResult } from '../../types';
import { ScoringEngine } from '../engine/ScoringEngine';

export class MemoryAdapter implements ChallengeAdapter<MemorySubmission, MemoryAnswerKey, MemoryContent> {
  public validateSubmission(rawSubmission: unknown): MemorySubmission {
    return MemorySubmissionSchema.parse(rawSubmission);
  }

  public validateContent(rawContent: unknown): MemoryContent {
    return MemoryContentSchema.parse(rawContent);
  }

  public validateAnswerKey(rawAnswerKey: unknown): MemoryAnswerKey {
    return MemoryAnswerKeySchema.parse(rawAnswerKey);
  }

  public sanitizeContentForPlayer(content: MemoryContent): MemoryContent {
    return {
      items: content.items,
      displayDurationMs: content.displayDurationMs,
      recallMode: content.recallMode,
    };
  }

  public evaluate(
    submission: MemorySubmission,
    answerKey: MemoryAnswerKey,
    _content: MemoryContent
  ): ScoreResult {
    const targetItems = answerKey.items;
    const recalledItems = submission.recalledSequence || [];

    const totalItems = targetItems.length;
    if (totalItems === 0) {
      throw new Error('Memory answer key cannot be empty');
    }

    let correctCount = 0;
    for (let i = 0; i < totalItems; i++) {
      if (recalledItems[i] !== undefined && recalledItems[i] === targetItems[i]) {
        correctCount++;
      }
    }

    const accuracy = correctCount / totalItems;
    const percentage = Math.round(accuracy * 100);
    const isCorrect = correctCount === totalItems;

    return ScoringEngine.normalizeScore({
      rawScore: percentage,
      maxScore: 100,
      isCorrect,
      durationMs: submission.durationMs,
      metrics: {
        accuracy: Math.round(accuracy * 100) / 100,
        correctItems: correctCount,
        totalItems,
      },
    });
  }
}
