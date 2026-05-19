// Power-up type definitions. Frames are in the 'sheet' atlas.
// Duration values live in src/config.js POWERUP object.
// Each type is visually distinct by shape AND colour per accessibility rules.

export const POWERUP_TYPES = {
  SPREAD: {
    id:    'SPREAD',
    frame: 'powerupBlue_star.png',   // blue star  — spread shot
    label: 'SPR',
    timed: true,
  },
  RAPID: {
    id:    'RAPID',
    frame: 'powerupGreen_bolt.png',  // green bolt — rapid fire
    label: 'RPD',
    timed: true,
  },
  SHIELD: {
    id:    'SHIELD',
    frame: 'powerupBlue_shield.png', // blue shield — absorbs one hit
    label: 'SHD',
    timed: false,
  },
};

export const POWERUP_TYPE_IDS = Object.keys(POWERUP_TYPES);
