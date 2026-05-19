/**
 * Unit tests for ScoreSystem.
 * Covers: base scoring, combo streak window, multiplier activation,
 * multiplier decay, and full reset. Uses Phaser-style ms timestamps.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../../src/systems/ScoreSystem.js';
import { SCORE } from '../../src/config.js';

beforeEach(() => ScoreSystem.reset());

describe('ScoreSystem.add()', () => {
  it('adds points at multiplier ×1 by default', () => {
    expect(ScoreSystem.add(100, 0)).toBe(100);
    expect(ScoreSystem.getScore()).toBe(100);
  });

  it('accumulates across multiple calls', () => {
    ScoreSystem.add(100, 0);
    ScoreSystem.add(250, 100);
    expect(ScoreSystem.getScore()).toBe(350);
  });

  it('applies active multiplier to points', () => {
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    ScoreSystem.add(100, SCORE.comboKillCount * 100);
    expect(ScoreSystem.getScore()).toBe(100 * SCORE.comboMultiplier);
  });
});

describe('ScoreSystem.recordKill()', () => {
  it('increments combo count on each kill', () => {
    ScoreSystem.recordKill(0);
    expect(ScoreSystem.getCombo()).toBe(1);
    ScoreSystem.recordKill(100);
    expect(ScoreSystem.getCombo()).toBe(2);
  });

  it('does not activate multiplier before threshold', () => {
    for (let i = 0; i < SCORE.comboKillCount - 1; i++) ScoreSystem.recordKill(i * 100);
    expect(ScoreSystem.getMultiplier()).toBe(1);
  });

  it('activates multiplier at exactly the kill threshold within window', () => {
    const step = Math.floor(SCORE.comboWindow / SCORE.comboKillCount) - 1;
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * step);
    expect(ScoreSystem.getMultiplier()).toBe(SCORE.comboMultiplier);
  });

  it('resets streak on the kill after a window gap (multiplier inactive)', () => {
    ScoreSystem.recordKill(0);
    ScoreSystem.recordKill(100);
    // Gap exceeds window — next kill resets streak before incrementing
    ScoreSystem.recordKill(100 + SCORE.comboWindow + 1);
    expect(ScoreSystem.getCombo()).toBe(1);
    expect(ScoreSystem.getMultiplier()).toBe(1);
  });

  it('does not activate multiplier when a gap breaks the streak mid-build', () => {
    for (let i = 0; i < SCORE.comboKillCount - 2; i++) ScoreSystem.recordKill(i * 100);
    const lastKill = (SCORE.comboKillCount - 2) * 100;
    // Gap resets streak; two more kills start a fresh streak of 2 — not enough to activate
    ScoreSystem.recordKill(lastKill + SCORE.comboWindow + 1);
    ScoreSystem.recordKill(lastKill + SCORE.comboWindow + 100);
    expect(ScoreSystem.getMultiplier()).toBe(1);
    expect(ScoreSystem.getCombo()).toBe(2);
  });

  it('does not reset an active multiplier on kill even after a long gap', () => {
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    // Huge gap — but multiplier is already active; only decayCheck resets it
    ScoreSystem.recordKill(SCORE.comboKillCount * 100 + SCORE.comboWindow * 10);
    expect(ScoreSystem.getMultiplier()).toBe(SCORE.comboMultiplier);
  });
});

describe('ScoreSystem.decayCheck()', () => {
  it('does not decay when multiplier is inactive', () => {
    ScoreSystem.recordKill(0);
    ScoreSystem.decayCheck(SCORE.comboDecay + 1);
    expect(ScoreSystem.getMultiplier()).toBe(1);
    expect(ScoreSystem.getCombo()).toBe(1);
  });

  it('does not decay within the decay window', () => {
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    const lastKill = (SCORE.comboKillCount - 1) * 100;
    ScoreSystem.decayCheck(lastKill + SCORE.comboDecay - 1);
    expect(ScoreSystem.getMultiplier()).toBe(SCORE.comboMultiplier);
  });

  it('resets multiplier and combo once decay window expires', () => {
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    const lastKill = (SCORE.comboKillCount - 1) * 100;
    ScoreSystem.decayCheck(lastKill + SCORE.comboDecay + 1);
    expect(ScoreSystem.getMultiplier()).toBe(1);
    expect(ScoreSystem.getCombo()).toBe(0);
  });
});

describe('ScoreSystem.reset()', () => {
  it('clears score, combo, and multiplier', () => {
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    ScoreSystem.add(500, 0);
    ScoreSystem.reset();
    expect(ScoreSystem.getScore()).toBe(0);
    expect(ScoreSystem.getCombo()).toBe(0);
    expect(ScoreSystem.getMultiplier()).toBe(1);
  });

  it('allows a fresh streak to build after reset', () => {
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    ScoreSystem.reset();
    for (let i = 0; i < SCORE.comboKillCount; i++) ScoreSystem.recordKill(i * 100);
    expect(ScoreSystem.getMultiplier()).toBe(SCORE.comboMultiplier);
  });
});
