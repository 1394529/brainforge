import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Database } from '../src/server/db';
import { ChallengeEngine } from '../src/server/engine/ChallengeEngine';

describe('Security Audit & RLS Enforcements', () => {
  const db = Database.getInstance();

  it('NEVER leaks answer_key to client challenges', () => {
    const challenges = db.getAllPublishedChallenges();

    for (const raw of challenges) {
      const clientChallengeFr = ChallengeEngine.toClientChallenge(raw, 'fr');
      const clientChallengeEn = ChallengeEngine.toClientChallenge(raw, 'en');

      // Neither client challenge should have answerKey property
      assert.strictEqual((clientChallengeFr as any).answerKey, undefined);
      assert.strictEqual((clientChallengeFr as any).answer_key, undefined);
      assert.strictEqual((clientChallengeEn as any).answerKey, undefined);
      assert.strictEqual((clientChallengeEn as any).answer_key, undefined);

      // Quiz options must not have isCorrect flag
      if (clientChallengeEn.type === 'quiz') {
        const content: any = clientChallengeEn.content;
        for (const opt of content.options) {
          assert.strictEqual(opt.isCorrect, undefined);
          assert.strictEqual(opt.correct, undefined);
        }
      }
    }
  });

  it('enforces that history is partitioned by userId (RLS)', () => {
    const userAAttempts = db.getChallengeAttempts('usr-demo-001');
    const userBAttempts = db.getChallengeAttempts('usr-unrelated-999');

    // User B has no records
    assert.strictEqual(userBAttempts.length, 0);

    // Any attempt in User A's history belongs strictly to User A
    for (const att of userAAttempts) {
      assert.strictEqual(att.userId, 'usr-demo-001');
    }
  });
});
