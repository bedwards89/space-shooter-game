/**
 * SaveSystem tests.
 * Covers: load/save/reset, corrupted JSON, missing keys, schema migration,
 * localStorage disabled, quota exceeded, invalid data shapes.
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
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true, configurable: true });
});

describe('SaveSystem.load', () => {
  it('returns defaults when no save exists', () => {
    const data = SaveSystem.load();
    expect(data.schemaVersion).toBe(1);
    expect(data.unlockedShips).toEqual(['Comet']);
    expect(data.highScores).toEqual([]);
    expect(data.highestLevelCleared).toBe(0);
    expect(data.totalRunsPlayed).toBe(0);
    expect(data.settings.musicVolume).toBe(0.7);
    expect(data.settings.sfxVolume).toBe(0.8);
  });

  it('returns defaults when JSON is corrupted', () => {
    store['starwake-save-v1'] = '{not valid json';
    const data = SaveSystem.load();
    expect(data.unlockedShips).toEqual(['Comet']);
    expect(data.highestLevelCleared).toBe(0);
  });

  it('returns defaults when localStorage.getItem throws (storage disabled)', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new TypeError('localStorage is disabled'); });
    const data = SaveSystem.load();
    expect(data.unlockedShips).toEqual(['Comet']);
    expect(data.schemaVersion).toBe(1);
  });

  it('fills missing settings fields with defaults (partial settings object)', () => {
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1,
      highScores: [],
      unlockedShips: ['Comet'],
      highestLevelCleared: 1,
      totalRunsPlayed: 2,
      settings: { musicVolume: 0.3 }, // sfxVolume missing
    });
    const data = SaveSystem.load();
    expect(data.settings.musicVolume).toBe(0.3);
    expect(data.settings.sfxVolume).toBe(0.8); // default restored
  });

  it('filters invalid score entries', () => {
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1,
      highScores: [
        { score: 1000, ship: 'Comet', date: '2026-01-01' }, // valid
        { score: 'bad', ship: 'Comet', date: '2026-01-01' }, // score not number
        { score: 500, ship: 42, date: '2026-01-01' },        // ship not string
        { score: 200, ship: 'Wraith' },                      // date missing
        null,                                                  // null entry
      ],
      unlockedShips: ['Comet'],
      highestLevelCleared: 0,
      totalRunsPlayed: 0,
      settings: { musicVolume: 0.7, sfxVolume: 0.8 },
    });
    const data = SaveSystem.load();
    expect(data.highScores).toHaveLength(1);
    expect(data.highScores[0].score).toBe(1000);
  });

  it('trims highScores to 5 entries max', () => {
    const scores = Array.from({ length: 8 }, (_, i) => ({
      score: 1000 - i * 100, ship: 'Comet', date: '2026-01-01',
    }));
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1, highScores: scores, unlockedShips: ['Comet'],
      highestLevelCleared: 0, totalRunsPlayed: 0,
      settings: { musicVolume: 0.7, sfxVolume: 0.8 },
    });
    const data = SaveSystem.load();
    expect(data.highScores).toHaveLength(5);
  });

  it('defaults unlockedShips to [Comet] when array is empty', () => {
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1, highScores: [], unlockedShips: [],
      highestLevelCleared: 0, totalRunsPlayed: 0,
      settings: { musicVolume: 0.7, sfxVolume: 0.8 },
    });
    const data = SaveSystem.load();
    expect(data.unlockedShips).toEqual(['Comet']);
  });

  it('defaults unlockedShips to [Comet] when value is not an array', () => {
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1, highScores: [], unlockedShips: 'Comet',
      highestLevelCleared: 0, totalRunsPlayed: 0,
      settings: { musicVolume: 0.7, sfxVolume: 0.8 },
    });
    const data = SaveSystem.load();
    expect(data.unlockedShips).toEqual(['Comet']);
  });

  it('filters non-string values out of unlockedShips', () => {
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1, highScores: [], unlockedShips: ['Comet', 42, null, 'Wraith'],
      highestLevelCleared: 0, totalRunsPlayed: 0,
      settings: { musicVolume: 0.7, sfxVolume: 0.8 },
    });
    const data = SaveSystem.load();
    expect(data.unlockedShips).toEqual(['Comet', 'Wraith']);
  });

  it('replaces non-finite numeric fields with defaults', () => {
    store['starwake-save-v1'] = JSON.stringify({
      schemaVersion: 1, highScores: [], unlockedShips: ['Comet'],
      highestLevelCleared: Infinity,
      totalRunsPlayed: NaN,
      settings: { musicVolume: null, sfxVolume: undefined },
    });
    const data = SaveSystem.load();
    expect(data.highestLevelCleared).toBe(0);
    expect(data.totalRunsPlayed).toBe(0);
    expect(data.settings.musicVolume).toBe(0.7);
    expect(data.settings.sfxVolume).toBe(0.8);
  });
});

describe('SaveSystem.save', () => {
  it('persists data to localStorage', () => {
    const data = SaveSystem.load();
    data.highestLevelCleared = 2;
    SaveSystem.save(data);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('starwake-save-v1', expect.any(String));
    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored.highestLevelCleared).toBe(2);
  });

  it('silently degrades when setItem throws (quota exceeded)', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => SaveSystem.save({ schemaVersion: 1 })).not.toThrow();
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

  it('silently degrades when removeItem throws (storage disabled)', () => {
    localStorageMock.removeItem.mockImplementationOnce(() => {
      throw new TypeError('localStorage is disabled');
    });
    const fresh = SaveSystem.reset();
    expect(fresh.unlockedShips).toEqual(['Comet']);
    expect(fresh.highestLevelCleared).toBe(0);
  });
});

describe('SaveSystem.migrate', () => {
  it('handles data from same version without data loss', () => {
    const input = {
      schemaVersion: 1, highestLevelCleared: 2, highScores: [],
      unlockedShips: ['Comet', 'Wraith'], totalRunsPlayed: 5,
      settings: { musicVolume: 0.5, sfxVolume: 0.6 },
    };
    const result = SaveSystem.migrate(1, input);
    expect(result.highestLevelCleared).toBe(2);
    expect(result.settings.musicVolume).toBe(0.5);
    expect(result.settings.sfxVolume).toBe(0.6);
  });

  it('repairs and returns defaults for v0 (unknown version) data', () => {
    const input = { highestLevelCleared: 1 }; // schemaVersion missing → treated as v0
    const result = SaveSystem.migrate(0, input);
    expect(result.schemaVersion).toBe(1);
    expect(result.highestLevelCleared).toBe(1);
    expect(result.unlockedShips).toEqual(['Comet']);
    expect(result.settings.musicVolume).toBe(0.7);
  });

  it('always stamps result with current schemaVersion', () => {
    const result = SaveSystem.migrate(0, {});
    expect(result.schemaVersion).toBe(1);
  });
});
