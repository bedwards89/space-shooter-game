const SAVE_KEY = 'starwake-save-v1';
const CURRENT_SCHEMA_VERSION = 1;

const DEFAULT_SAVE = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  highScores: [],
  unlockedShips: ['Comet'],
  highestLevelCleared: 0,
  totalRunsPlayed: 0,
  settings: { musicVolume: 0.7, sfxVolume: 0.8 },
};

// Phase 7: full implementation with migrate(), quota handling, corruption recovery.
export const SaveSystem = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return structuredClone(DEFAULT_SAVE);
      const data = JSON.parse(raw);
      return this.migrate(data.schemaVersion ?? 0, data);
    } catch {
      return structuredClone(DEFAULT_SAVE);
    }
  },

  save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // Quota exceeded or storage disabled — silently degrade.
    }
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    return structuredClone(DEFAULT_SAVE);
  },

  migrate(fromVersion, data) {
    // Add migration steps here as schema evolves.
    // e.g., if (fromVersion < 2) { data.newField = default; data.schemaVersion = 2; }
    return { ...structuredClone(DEFAULT_SAVE), ...data, schemaVersion: CURRENT_SCHEMA_VERSION };
  },
};
