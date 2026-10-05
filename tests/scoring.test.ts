import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ScoringEngine } from '../src/server/engine/ScoringEngine';

describe('ScoringEngine', () => {
  it('normalizes score correctly within 0 and 100 bounds', () => {
    const res1 = ScoringEngine.normalizeScore({ rawScore: 80, maxScore: 100 });
    assert.strictEqual(res1.percentage, 80);
    assert.strictEqual(res1.rawScore, 80);

    const res2 = ScoringEngine.normalizeScore({ rawScore: 120, maxScore: 100 });
    assert.strictEqual(res2.percentage, 100);
    assert.strictEqual(res2.rawScore, 100);

    const res3 = ScoringEngine.normalizeScore({ rawScore: -10, maxScore: 100 });
    assert.strictEqual(res3.percentage, 0);
    assert.strictEqual(res3.rawScore, 0);
  });

  it('evaluates reaction time thresholds accurately', () => {
    // < 200 ms -> 100
    const score150 = ScoringEngine.calculateReactionScore(150, false);
    assert.strictEqual(score150.rawScore, 100);
    assert.strictEqual(score150.percentage, 100);

    // 200 - 299 ms -> 90
    const score250 = ScoringEngine.calculateReactionScore(250, false);
    assert.strictEqual(score250.rawScore, 90);
    assert.strictEqual(score250.percentage, 90);

    // 300 - 399 ms -> 80
    const score350 = ScoringEngine.calculateReactionScore(350, false);
    assert.strictEqual(score350.rawScore, 80);

    // 400 - 499 ms -> 70
    const score450 = ScoringEngine.calculateReactionScore(450, false);
    assert.strictEqual(score450.rawScore, 70);

    // 500 - 599 ms -> 60
    const score550 = ScoringEngine.calculateReactionScore(550, false);
    assert.strictEqual(score550.rawScore, 60);

    // 600 - 799 ms -> 40
    const score650 = ScoringEngine.calculateReactionScore(650, false);
    assert.strictEqual(score650.rawScore, 40);

    // 800 - 999 ms -> 20
    const score850 = ScoringEngine.calculateReactionScore(850, false);
    assert.strictEqual(score850.rawScore, 20);

    // >= 1000 ms -> 0
    const score1200 = ScoringEngine.calculateReactionScore(1200, false);
    assert.strictEqual(score1200.rawScore, 0);
  });

  it('penalizes false start with 0 score and isFalseStart flag', () => {
    const falseStart = ScoringEngine.calculateReactionScore(120, true);
    assert.strictEqual(falseStart.rawScore, 0);
    assert.strictEqual(falseStart.percentage, 0);
    assert.strictEqual(falseStart.metrics?.isFalseStart, true);
    assert.strictEqual(falseStart.isCorrect, false);
  });
});
