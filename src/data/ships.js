export const SHIPS = [
  {
    id: 'Comet',
    label: 'Comet',
    spriteKey: 'ship_comet',
    speed: 150,
    fireRate: 200,
    hitboxScale: 0.5,
    unlockCriteria: null, // default ship, always unlocked
    description: 'Balanced. Speed 5, medium fire rate, medium hitbox.',
  },
  {
    id: 'Wraith',
    label: 'Wraith',
    spriteKey: 'ship_wraith',
    speed: 210,
    fireRate: 300,
    hitboxScale: 0.35,
    unlockCriteria: { levelCleared: 2 },
    description: 'Fast, small hitbox, slower fire rate. Unlock: clear Level 2.',
  },
  {
    id: 'Bulwark',
    label: 'Bulwark',
    spriteKey: 'ship_bulwark',
    speed: 100,
    fireRate: 120,
    hitboxScale: 0.65,
    startsWithShield: true,
    unlockCriteria: { levelCleared: 3 },
    description: 'Slow, large hitbox, high fire rate. Starts each level with a free Shield. Unlock: clear Level 3.',
  },
];
