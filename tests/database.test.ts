import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Database } from '../src/server/db';
import { ScoringEngine } from '../src/server/engine/ScoringEngine';

describe('Database & Anti-Duplication Integrity', () => {
  const db = Database.getInstance();

  it('has at least 30 seeded challenges across all 4 categories', () => {
    const all = db.getAllPublishedChallenges();
    assert.ok(all.length >= 30, `Expected at least 30 challenges, found ${all.length}`);

    const quizzes = all.filter((c) => c.type === 'quiz');
    const patterns = all.filter((c) => c.type === 'pattern');
    const memories = all.filter((c) => c.type === 'memory');
    const reactions = all.filter((c) => c.type === 'reaction');

    assert.ok(quizzes.length >= 10, 'At least 10 quizzes');
    assert.ok(patterns.length >= 10, 'At least 10 patterns');
    assert.ok(memories.length >= 5, 'At least 5 memories');
    assert.ok(reactions.length >= 5, 'At least 5 reactions');
  });

  it('atomically records challenge attempt and writes XP transaction ledger', () => {
    const userId = 'usr-demo-001';
    const attemptId = `test-att-${Date.now()}-1`;
    const initialProgress = db.getUserProgress(userId);

    const score = ScoringEngine.normalizeScore({ rawScore: 100, maxScore: 100 });
    const { updatedProgress, xpTransaction } = db.recordAttemptAndAwardXp({
      attemptId,
      userId,
      challengeId: 'quiz-001',
      version: 1,
      score,
      xpEarned: 100,
    });

    assert.strictEqual(updatedProgress.totalXp, initialProgress.totalXp + 100);
    assert.ok(xpTransaction, 'XP transaction must be recorded');
    assert.strictEqual(xpTransaction.attemptId, attemptId);
    assert.strictEqual(xpTransaction.amount, 100);
  });

  it('strictly rejects duplicate attempt submission and prevents double XP credit', () => {
    const userId = 'usr-demo-001';
    const duplicateAttemptId = `dup-att-${Date.now()}`;
    const score = ScoringEngine.normalizeScore({ rawScore: 100, maxScore: 100 });

    // First submission succeeds
    db.recordAttemptAndAwardXp({
      attemptId: duplicateAttemptId,
      userId,
      challengeId: 'pattern-001',
      version: 1,
      score,
      xpEarned: 100,
    });

    // Second submission with same attemptId MUST throw error (idempotency enforcement)
    assert.throws(
      () => {
        db.recordAttemptAndAwardXp({
          attemptId: duplicateAttemptId,
          userId,
          challengeId: 'pattern-001',
          version: 1,
          score,
          xpEarned: 100,
        });
      },
      /already been processed/i
    );
  });
});
