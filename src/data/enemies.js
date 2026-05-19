// All frames live in the 'sheet' atlas (Kenney Space Shooter Redux).
// hitboxScale: fraction of the rotated visual size used as the physics body.
// scale: Phaser sprite scale applied at runtime.

export const ENEMY_TYPES = {
  SMALL: {
    id: 'SMALL',
    frame: 'enemyBlack4.png',    // 82×84 — compact diamond
    scale: 0.55,
    hp: 1,
    speed: 120,
    scoreValue: 100,
    movement: 'straight',
    fireRate: null,
    dropChance: 0.05,
    hitboxScale: 0.7,
  },
  MEDIUM: {
    id: 'MEDIUM',
    frame: 'enemyBlue2.png',     // 104×84 — wide wedge
    scale: 0.7,
    hp: 3,
    speed: 70,
    scoreValue: 250,
    movement: 'sine',
    fireRate: 2000,
    dropChance: 0.10,
    hitboxScale: 0.6,
  },
  LARGE: {
    id: 'LARGE',
    frame: 'enemyRed1.png',      // 93×84 — saucer
    scale: 0.9,
    hp: 8,
    speed: 40,
    scoreValue: 500,
    movement: 'straight',
    fireRate: 1200,
    dropChance: 0.10,
    hitboxScale: 0.6,
  },
  TURRET: {
    id: 'TURRET',
    frame: 'enemyGreen3.png',    // 103×84 — solid wedge
    scale: 0.7,
    hp: 5,
    speed: 50,
    scoreValue: 300,
    movement: 'turret',
    fireRate: 1500,
    dropChance: 0.08,
    hitboxScale: 0.6,
  },
  BOSS: {
    id: 'BOSS',
    frame: 'enemyRed5.png',      // 97×84 — imposing ship, scaled up
    scale: 1.5,
    hp: 40,                      // overridden per level via boss.hp
    speed: 30,
    scoreValue: 5000,            // overridden per level via boss.scoreValue
    movement: 'boss',
    fireRate: 1800,
    dropChance: 0,
    hitboxScale: 0.5,
  },
};
