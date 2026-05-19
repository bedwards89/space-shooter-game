/**
 * ScoreSystem tests.
 * Covers: base scoring, combo multiplier activation and decay, reset.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../../src/systems/ScoreSystem.js';

beforeEach(() => {
  ScoreSystem.reset();
});

describe('ScoreSystem.add', () => {
  it('adds points at 1× multiplier by default', () => {
    ScoreSystem.add(100);
    expect(ScoreSystem.getScore()).toBe(100);
  });

  it('accumulates multiple additions', () => {
    ScoreSystem.add(100);
    ScoreSystem.add(250);
    expect(ScoreSystem.getScore()).toBe(350);
  });
});

describe('ScoreSystem combo', () => {
  it('activates ×2 multiplier after 5 kills within window', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) ScoreSystem.recordKill(now + i * 100);
    expect(ScoreSystem.getMultiplier()).toBe(2);
  });

  it('does not activate multiplier with fewer than 5 kills', () => {
    const now = Date.now();
    for (let i = 0; i < 4; i++) ScoreSystem.recordKill(now + i * 100);
    expect(ScoreSystem.getMultiplier()).toBe(1);
  });

  it('applies multiplier to subsequent add() calls', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) ScoreSystem.recordKill(now + i * 100);
    ScoreSystem.add(100, now + 500);
    expect(ScoreSystem.getScore()).toBe(200);
  });

  it('decays multiplier after combo window expires', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) ScoreSystem.recordKill(now + i * 100);
    ScoreSystem.decayCheck(now + 4000); // 4s later, beyond the 3s decay window
    expect(ScoreSystem.getMultiplier()).toBe(1);
  });
});

describe('ScoreSystem.reset', () => {
  it('zeroes score, combo, and multiplier', () => {
    ScoreSystem.add(500);
    const now = Date.now();
    for (let i = 0; i < 5; i++) ScoreSystem.recordKill(now);
    ScoreSystem.reset();
    expect(ScoreSystem.getScore()).toBe(0);
    expect(ScoreSystem.getMultiplier()).toBe(1);
    expect(ScoreSystem.getCombo()).toBe(0);
  });
});
