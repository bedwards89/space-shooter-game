export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const TARGET_FPS = 60;

export const PLAYER = {
  speed: 150,
  fireRate: 200, // ms between shots
  lives: 3,
  invulnDuration: 2000, // ms of i-frames after hit
  bulletSpeed: 400,
};

export const SCORE = {
  enemySmall: 100,
  enemyMedium: 250,
  enemyLarge: 500,
  boss: 5000,
  powerUpPickup: 50,
  comboKillCount: 5,
  comboWindow: 3000,   // ms
  comboDecay: 3000,    // ms without kill before multiplier drops
  comboMultiplier: 2,
};

export const POWERUP = {
  spreadDuration: 10000,
  rapidDuration: 8000,
  rapidFireRate: 83, // ms (~12 shots/sec)
  onScreenLifetime: 9000,
};
