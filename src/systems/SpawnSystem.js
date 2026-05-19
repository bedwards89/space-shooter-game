/**
 * SpawnSystem: pure (no Phaser) wave scheduler + formation helpers.
 * GameScene constructs one per level and calls tick() each update frame.
 */

import { GAME_HEIGHT } from '../config.js';

const Y_MARGIN = 30;
const Y_SAFE   = GAME_HEIGHT - Y_MARGIN * 2;

export class SpawnSystem {
  // timeline must be sorted by time ascending (as authored in levels.js).
  constructor(timeline) {
    this._timeline  = timeline;
    this._nextIndex = 0;
  }

  // Returns an array of timeline entries whose time has elapsed and haven't
  // been dispatched yet. Call once per update with cumulative elapsed ms.
  tick(elapsedMs) {
    const due = [];
    while (
      this._nextIndex < this._timeline.length &&
      this._timeline[this._nextIndex].time <= elapsedMs
    ) {
      due.push(this._timeline[this._nextIndex]);
      this._nextIndex++;
    }
    return due;
  }

  get isDone() {
    return this._nextIndex >= this._timeline.length;
  }

  reset() {
    this._nextIndex = 0;
  }
}

// Returns an array of Y positions for `count` enemies using the given formation.
export function getSpawnPositions(count, formation) {
  switch (formation) {
    case 'line': {
      const step = Y_SAFE / Math.max(count, 1);
      return Array.from({ length: count }, (_, i) =>
        Y_MARGIN + step * i + step / 2
      );
    }

    case 'v': {
      const cx = GAME_HEIGHT / 2;
      const spread = Math.min(Y_SAFE / Math.max(count, 2), 40);
      return Array.from({ length: count }, (_, i) =>
        cx + (i - (count - 1) / 2) * spread
      );
    }

    case 'random':
      return Array.from({ length: count }, () =>
        Y_MARGIN + Math.random() * Y_SAFE
      );

    case 'single':
    default:
      return [GAME_HEIGHT / 2];
  }
}
