import { SCORE } from '../config.js';

// Phase 6: full implementation with combo tracking.
export const ScoreSystem = {
  _score: 0,
  _combo: 0,
  _multiplier: 1,
  _lastKillTime: 0,
  _comboTimer: null,

  reset() {
    this._score = 0;
    this._combo = 0;
    this._multiplier = 1;
    this._lastKillTime = 0;
  },

  getScore() { return this._score; },
  getCombo() { return this._combo; },
  getMultiplier() { return this._multiplier; },

  add(points, now = Date.now()) {
    this._score += points * this._multiplier;
    return this._score;
  },

  recordKill(now = Date.now()) {
    // Reset streak if the gap since last kill exceeded the combo window
    // (only while multiplier is not yet active — active multiplier decays via decayCheck).
    if (this._multiplier === 1 && now - this._lastKillTime > SCORE.comboWindow) {
      this._combo = 0;
    }
    this._combo++;
    this._lastKillTime = now;
    if (this._combo >= SCORE.comboKillCount) {
      this._multiplier = SCORE.comboMultiplier;
    }
  },

  decayCheck(now = Date.now()) {
    if (this._multiplier > 1 && now - this._lastKillTime >= SCORE.comboDecay) {
      this._multiplier = 1;
      this._combo = 0;
    }
  },
};
