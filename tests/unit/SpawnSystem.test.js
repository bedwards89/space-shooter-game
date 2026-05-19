/**
 * SpawnSystem + getSpawnPositions tests.
 * Covers: correct dispatch timing, single-fire guarantee, isDone flag,
 * reset(), and formation Y-position constraints.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpawnSystem, getSpawnPositions } from '../../src/systems/SpawnSystem.js';
import { GAME_HEIGHT } from '../../src/config.js';

const TIMELINE = [
  { time: 1000, type: 'SMALL',  count: 3, formation: 'line'   },
  { time: 3000, type: 'MEDIUM', count: 2, formation: 'v'      },
  { time: 5000, type: 'BOSS',   count: 1, formation: 'single' },
];

describe('SpawnSystem.tick', () => {
  let spawner;

  beforeEach(() => { spawner = new SpawnSystem(TIMELINE); });

  it('returns nothing before any entry is due', () => {
    expect(spawner.tick(999)).toHaveLength(0);
  });

  it('returns an entry exactly at its scheduled time', () => {
    const due = spawner.tick(1000);
    expect(due).toHaveLength(1);
    expect(due[0].type).toBe('SMALL');
  });

  it('returns all entries due within the elapsed window', () => {
    const due = spawner.tick(3000);
    expect(due).toHaveLength(2);
    expect(due.map((e) => e.type)).toEqual(['SMALL', 'MEDIUM']);
  });

  it('never dispatches the same entry twice', () => {
    spawner.tick(3000); // consumes first two entries
    const second = spawner.tick(3000);
    expect(second).toHaveLength(0);
  });

  it('continues from where it left off on subsequent calls', () => {
    spawner.tick(3000);           // entries at 1000 and 3000 consumed
    const due = spawner.tick(5000);
    expect(due).toHaveLength(1);
    expect(due[0].type).toBe('BOSS');
  });

  it('sets isDone only after all entries have fired', () => {
    expect(spawner.isDone).toBe(false);
    spawner.tick(5000);
    expect(spawner.isDone).toBe(true);
  });

  it('reset() allows the timeline to replay from the start', () => {
    spawner.tick(5000);
    spawner.reset();
    expect(spawner.isDone).toBe(false);
    const due = spawner.tick(1000);
    expect(due).toHaveLength(1);
    expect(due[0].type).toBe('SMALL');
  });
});

describe('getSpawnPositions', () => {
  const inBounds = (y) => y >= 0 && y <= GAME_HEIGHT;

  it('returns exactly count positions', () => {
    expect(getSpawnPositions(4, 'line')).toHaveLength(4);
    expect(getSpawnPositions(5, 'v')).toHaveLength(5);
    expect(getSpawnPositions(6, 'random')).toHaveLength(6);
    expect(getSpawnPositions(1, 'single')).toHaveLength(1);
  });

  it('keeps all positions within the canvas height', () => {
    ['line', 'v', 'random', 'single'].forEach((f) => {
      getSpawnPositions(8, f).forEach((y) => {
        expect(inBounds(y)).toBe(true);
      });
    });
  });

  it('single formation always returns canvas centre', () => {
    const [y] = getSpawnPositions(1, 'single');
    expect(y).toBe(GAME_HEIGHT / 2);
  });

  it('falls back to single for unknown formations', () => {
    expect(getSpawnPositions(3, 'unknown')).toHaveLength(1);
  });
});
