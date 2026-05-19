export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TARGET_FPS = 60;

export const PLAYER = {
  speed: 400,
  fireRate: 200, // ms between shots
  lives: 3,
  invulnDuration: 2000, // ms of i-frames after hit
  bulletSpeed: 1000,
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
  rapidFireRate: 83,        // ms (~12 shots/sec)
  onScreenLifetime: 9000,
  driftSpeed: 100,          // px/s leftward
};

export const ENEMY = {
  bulletSpeed: 500,
  turretStopX: GAME_WIDTH * 0.72,
  bossStopX:   GAME_WIDTH * 0.75,
  bossOscillateAmplitude: 130,
  bossOscillateSpeed: 0.8,      // radians/sec
  bossBulletAngles: [-8, 0, 8], // degrees; dodgeable spread on a 720px screen
  sineAmplitude: 160,           // px/s vertical amplitude for sine-movement enemies
};

export const BG_SPEEDS = [55, 120, 240]; // px/s for far/mid/near parallax layers
