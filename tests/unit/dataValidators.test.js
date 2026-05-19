/**
 * Data-shape validators for levels.js and enemies.js.
 * Ensures all design-data files have the required fields before runtime
 * would silently fail on a missing key.
 */

import { describe, it, expect } from 'vitest';
import { LEVELS } from '../../src/data/levels.js';
import { ENEMY_TYPES } from '../../src/data/enemies.js';
import { POWERUP_TYPES, POWERUP_TYPE_IDS } from '../../src/data/powerups.js';

// Background keys that are actually preloaded in PreloadScene.
const VALID_BG_KEYS = new Set(['bg_black', 'bg_blue', 'bg_darkPurple', 'bg_purple']);

const VALID_FORMATIONS = new Set(['line', 'v', 'random', 'single']);
const VALID_MOVEMENTS  = new Set(['straight', 'sine', 'turret', 'boss']);
const VALID_TYPE_IDS   = new Set(Object.keys(ENEMY_TYPES));

describe('LEVELS data', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  LEVELS.forEach((level) => {
    describe(`Level ${level.id} — ${level.name}`, () => {
      it('has required top-level keys', () => {
        expect(typeof level.id).toBe('number');
        expect(typeof level.name).toBe('string');
        expect(typeof level.music).toBe('string');
        expect(Array.isArray(level.timeline)).toBe(true);
        expect(level.timeline.length).toBeGreaterThan(0);
        expect(typeof level.boss).toBe('object');
      });

      it('uses valid preloaded background keys', () => {
        expect(VALID_BG_KEYS.has(level.bgFar),  `bgFar "${level.bgFar}" not preloaded`).toBe(true);
        expect(VALID_BG_KEYS.has(level.bgMid),  `bgMid "${level.bgMid}" not preloaded`).toBe(true);
        expect(VALID_BG_KEYS.has(level.bgNear), `bgNear "${level.bgNear}" not preloaded`).toBe(true);
      });

      it('boss has hp and scoreValue', () => {
        expect(typeof level.boss.hp).toBe('number');
        expect(level.boss.hp).toBeGreaterThan(0);
        expect(typeof level.boss.scoreValue).toBe('number');
      });

      it('timeline is sorted by time ascending', () => {
        for (let i = 1; i < level.timeline.length; i++) {
          expect(level.timeline[i].time).toBeGreaterThanOrEqual(level.timeline[i - 1].time);
        }
      });

      level.timeline.forEach((entry, i) => {
        it(`timeline[${i}] has valid type, count, formation`, () => {
          expect(VALID_TYPE_IDS.has(entry.type), `unknown type "${entry.type}"`).toBe(true);
          expect(typeof entry.count).toBe('number');
          expect(entry.count).toBeGreaterThan(0);
          expect(VALID_FORMATIONS.has(entry.formation), `unknown formation "${entry.formation}"`).toBe(true);
        });
      });
    });
  });
});

describe('ENEMY_TYPES data', () => {
  const REQUIRED_FIELDS = ['id', 'frame', 'scale', 'hp', 'speed', 'scoreValue',
                           'movement', 'dropChance', 'hitboxScale'];

  Object.entries(ENEMY_TYPES).forEach(([key, type]) => {
    describe(`ENEMY_TYPES.${key}`, () => {
      it('has all required fields with correct types', () => {
        REQUIRED_FIELDS.forEach((field) => {
          expect(type, `missing field "${field}"`).toHaveProperty(field);
        });
        expect(typeof type.frame).toBe('string');
        expect(type.frame.endsWith('.png')).toBe(true);
        expect(type.scale).toBeGreaterThan(0);
        expect(type.hp).toBeGreaterThan(0);
        expect(type.hitboxScale).toBeGreaterThan(0);
        expect(type.hitboxScale).toBeLessThanOrEqual(1);
      });

      it('has a valid movement strategy', () => {
        expect(VALID_MOVEMENTS.has(type.movement), `unknown movement "${type.movement}"`).toBe(true);
      });
    });
  });
});

describe('POWERUP_TYPES data', () => {
  it('exports exactly 3 types', () => {
    expect(POWERUP_TYPE_IDS).toHaveLength(3);
  });

  it('POWERUP_TYPE_IDS matches POWERUP_TYPES keys', () => {
    expect(POWERUP_TYPE_IDS).toEqual(Object.keys(POWERUP_TYPES));
  });

  Object.entries(POWERUP_TYPES).forEach(([key, type]) => {
    describe(`POWERUP_TYPES.${key}`, () => {
      it('has required fields', () => {
        expect(typeof type.id).toBe('string');
        expect(type.id).toBe(key);
        expect(typeof type.frame).toBe('string');
        expect(type.frame.endsWith('.png')).toBe(true);
        expect(typeof type.label).toBe('string');
        expect(type.label.length).toBeLessThanOrEqual(3);
        expect(typeof type.timed).toBe('boolean');
      });
    });
  });

  it('SHIELD is not timed, SPREAD and RAPID are timed', () => {
    expect(POWERUP_TYPES.SHIELD.timed).toBe(false);
    expect(POWERUP_TYPES.SPREAD.timed).toBe(true);
    expect(POWERUP_TYPES.RAPID.timed).toBe(true);
  });
});
