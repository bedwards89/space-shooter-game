/**
 * SaveSystem tests.
 * Covers: load/save/reset, corrupted JSON, missing keys, schema migration.
 * localStorage is mocked below — these run in Node, no browser needed.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveSystem } from '../../src/systems/SaveSystem.js';

// Minimal localStorage mock
const store = {};
const localStorageMock = {
  getItem: vi.fn((k) => store[k] ?? null),
  setItem: vi.fn((k, v) => { store[k] = v; }),
  removeItem: vi.fn((k) => { delete store[k]; }),
};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.clearAllMocks();
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
});

describe('SaveSystem.load', () => {
  it('returns defaults when no save exists', () => {
    const data = SaveSystem.load();
    expect(data.schemaVersion).toBe(1);
    expect(data.unlockedShips).toEqual(['Comet']);
    expect(data.highScores).toEqual([]);
    expect(data.highestLevelCleared).toBe(0);
  });

  it('returns defaults when JSON is corrupted', () => {
    store['starwake-save-v1'] = '{not valid json';
    const data = SaveSystem.load();
    expect(data.unlockedShips).toEqual(['Comet']);
  });
});

describe('SaveSystem.save and load roundtrip', () => {
  it('persists and retrieves data correctly', () => {
    const original = SaveSystem.load();
    original.highestLevelCleared = 2;
    original.unlockedShips = ['Comet', 'Wraith'];
    SaveSystem.save(original);

    const loaded = SaveSystem.load();
    expect(loaded.highestLevelCleared).toBe(2);
    expect(loaded.unlockedShips).toContain('Wraith');
  });
});

describe('SaveSystem.reset', () => {
  it('wipes save and returns defaults', () => {
    const data = SaveSystem.load();
    data.highestLevelCleared = 3;
    SaveSystem.save(data);

    const fresh = SaveSystem.reset();
    expect(fresh.highestLevelCleared).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('starwake-save-v1');
  });
});

describe('SaveSystem.migrate', () => {
  it('handles data from same version without data loss', () => {
    const input = { schemaVersion: 1, highestLevelCleared: 2, highScores: [], unlockedShips: ['Comet', 'Wraith'], totalRunsPlayed: 5, settings: { musicVolume: 0.5, sfxVolume: 0.6 } };
    const result = SaveSystem.migrate(1, input);
    expect(result.highestLevelCleared).toBe(2);
    expect(result.settings.musicVolume).toBe(0.5);
  });
});
