import { describe, it } from 'node:test';
import assert from 'node:assert';
import { QuizAdapter } from '../src/server/adapters/QuizAdapter';
import { PatternAdapter } from '../src/server/adapters/PatternAdapter';
import { MemoryAdapter } from '../src/server/adapters/MemoryAdapter';
import { ReactionAdapter } from '../src/server/adapters/ReactionAdapter';

describe('Game Adapters', () => {
  // 1. Quiz Adapter Tests
  describe('QuizAdapter', () => {
    const adapter = new QuizAdapter();
    const content = {
      question: 'What is the capital of Canada?',
      options: [
        { id: 'a', label: 'Toronto' },
        { id: 'b', label: 'Ottawa' },
      ],
    };
    const answerKey = { correctOptionId: 'b' };

    it('scores 100 on correct answer', () => {
      const res = adapter.evaluate(
        { selectedOptionId: 'b', durationMs: 1500 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.rawScore, 100);
      assert.strictEqual(res.isCorrect, true);
    });

    it('scores 0 on incorrect answer', () => {
      const res = adapter.evaluate(
        { selectedOptionId: 'a', durationMs: 1500 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 0);
      assert.strictEqual(res.rawScore, 0);
      assert.strictEqual(res.isCorrect, false);
    });

    it('rejects malformed submission', () => {
      assert.throws(() => adapter.validateSubmission({ selectedOptionId: '' }));
      assert.throws(() => adapter.validateSubmission({}));
    });
  });

  // 2. Pattern Adapter Tests
  describe('PatternAdapter', () => {
    const adapter = new PatternAdapter();
    const content = {
      sequence: [2, 4, 6, 8],
      options: [9, 10, 11, 12],
    };
    const answerKey = { correctOption: 10 };

    it('scores 100 on correct pattern choice', () => {
      const res = adapter.evaluate(
        { selectedOption: 10, durationMs: 2000 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.isCorrect, true);
    });

    it('scores 0 on incorrect pattern choice', () => {
      const res = adapter.evaluate(
        { selectedOption: 9, durationMs: 2000 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 0);
      assert.strictEqual(res.isCorrect, false);
    });
  });

  // 3. Memory Adapter Tests
  describe('MemoryAdapter', () => {
    const adapter = new MemoryAdapter();
    const content = {
      items: ['A', '7', 'K', '3', 'P'],
      displayDurationMs: 3000,
      recallMode: 'sequence' as const,
    };
    const answerKey = { items: ['A', '7', 'K', '3', 'P'] };

    it('scores 100% on exact 5/5 sequence', () => {
      const res = adapter.evaluate(
        { recalledSequence: ['A', '7', 'K', '3', 'P'], durationMs: 2500 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.metrics?.correctItems, 5);
      assert.strictEqual(res.metrics?.totalItems, 5);
      assert.strictEqual(res.metrics?.accuracy, 1);
      assert.strictEqual(res.isCorrect, true);
    });

    it('scores 80% on 4/5 correct sequence', () => {
      const res = adapter.evaluate(
        { recalledSequence: ['A', '7', 'K', '3', 'X'], durationMs: 2500 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 80);
      assert.strictEqual(res.metrics?.correctItems, 4);
      assert.strictEqual(res.metrics?.totalItems, 5);
      assert.strictEqual(res.metrics?.accuracy, 0.8);
      assert.strictEqual(res.isCorrect, false);
    });

    it('scores 0% on completely incorrect sequence', () => {
      const res = adapter.evaluate(
        { recalledSequence: ['Z', 'Z', 'Z', 'Z', 'Z'], durationMs: 2500 },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 0);
      assert.strictEqual(res.metrics?.correctItems, 0);
    });
  });

  // 4. Reaction Adapter Tests
  describe('ReactionAdapter', () => {
    const adapter = new ReactionAdapter();
    const content = { prompt: 'Click fast', minDelayMs: 1000, maxDelayMs: 3000, targetAction: 'click' as const };
    const answerKey = { minValidReactionMs: 100 };

    it('scores 100 on reflex < 200 ms', () => {
      const res = adapter.evaluate(
        { reactionTimeMs: 185, durationMs: 185, isFalseStart: false },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.rawScore, 100);
      assert.strictEqual(res.metrics?.reactionTimeMs, 185);
    });

    it('scores 80 on reflex of 340 ms', () => {
      const res = adapter.evaluate(
        { reactionTimeMs: 340, durationMs: 340, isFalseStart: false },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 80);
      assert.strictEqual(res.rawScore, 80);
    });

    it('scores 0 and flags isFalseStart on premature click', () => {
      const res = adapter.evaluate(
        { reactionTimeMs: 0, durationMs: 0, isFalseStart: true },
        answerKey,
        content
      );
      assert.strictEqual(res.percentage, 0);
      assert.strictEqual(res.rawScore, 0);
      assert.strictEqual(res.metrics?.isFalseStart, true);
    });
  });
});
