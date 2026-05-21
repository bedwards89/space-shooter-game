const SAVE_KEY = 'starwake-save-v1';
const CURRENT_SCHEMA_VERSION = 1;

const DEFAULTS = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  highScores: [],
  unlockedShips: ['Comet'],
  highestLevelCleared: 0,
  totalRunsPlayed: 0,
  settings: { musicVolume: 0.1, sfxVolume: 0.1 },
};

function _num(v, fallback) {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

function _validScoreEntry(e) {
  return e != null
    && typeof e.score === 'number'
    && typeof e.ship  === 'string'
    && typeof e.date  === 'string';
}

// Reconstruct the save document field-by-field, filling any missing or
// invalid keys with defaults. Called after every load and migrate so the
// rest of the game can trust the shape unconditionally.
function _repair(data) {
  const d = data ?? {};
  const ships = Array.isArray(d.unlockedShips)
    ? d.unlockedShips.filter((s) => typeof s === 'string')
    : [];

  return {
    schemaVersion:       CURRENT_SCHEMA_VERSION,
    highScores:          Array.isArray(d.highScores)
                           ? d.highScores.filter(_validScoreEntry).slice(0, 5)
                           : [],
    unlockedShips:       ships.length > 0 ? ships : ['Comet'],
    highestLevelCleared: _num(d.highestLevelCleared, 0),
    totalRunsPlayed:     _num(d.totalRunsPlayed,     0),
    settings: {
      musicVolume: _num(d.settings?.musicVolume, DEFAULTS.settings.musicVolume),
      sfxVolume:   _num(d.settings?.sfxVolume,   DEFAULTS.settings.sfxVolume),
    },
  };
}

export const SaveSystem = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return _repair(null);
      const data = JSON.parse(raw);
      return this.migrate(data.schemaVersion ?? 0, data);
    } catch {
      return _repair(null);
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
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Storage disabled — silently degrade.
    }
    return _repair(null);
  },

  migrate(fromVersion, data) {
    // Add incremental version steps here as the schema evolves.
    // Each block mutates data in-place then falls through to the next.
    // Example for a future v2:
    //   if (fromVersion < 2) { data.newField = 'default'; }
    //
    // _repair() runs last to fill any gaps the migration left and
    // stamp the current schemaVersion.
    return _repair(data);
  },
};
