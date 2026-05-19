// Level timelines: each entry fires at `time` ms into the level.
// type: enemy type id | 'BOSS'
// formation: 'line' | 'v' | 'random' | 'single'

export const LEVELS = [
  {
    id: 1,
    name: 'Asteroid Belt',
    music: 'music_level1',
    background: 'bg_asteroids',
    timeline: [
      { time: 3000,  type: 'SMALL',  count: 3, formation: 'line' },
      { time: 7000,  type: 'SMALL',  count: 5, formation: 'v' },
      { time: 12000, type: 'MEDIUM', count: 2, formation: 'line' },
      { time: 18000, type: 'SMALL',  count: 6, formation: 'random' },
      { time: 25000, type: 'LARGE',  count: 1, formation: 'single' },
      { time: 30000, type: 'MEDIUM', count: 3, formation: 'v' },
      { time: 40000, type: 'SMALL',  count: 8, formation: 'random' },
      { time: 55000, type: 'BOSS',   count: 1, formation: 'single' },
    ],
    boss: { spriteKey: 'boss_asteroid', hp: 40, scoreValue: 5000 },
  },
  {
    id: 2,
    name: 'Nebula Patrol',
    music: 'music_level2',
    background: 'bg_nebula',
    timeline: [
      { time: 3000,  type: 'SMALL',  count: 4, formation: 'v' },
      { time: 8000,  type: 'MEDIUM', count: 3, formation: 'line' },
      { time: 15000, type: 'TURRET', count: 2, formation: 'line' },
      { time: 22000, type: 'LARGE',  count: 2, formation: 'line' },
      { time: 30000, type: 'MEDIUM', count: 4, formation: 'random' },
      { time: 40000, type: 'SMALL',  count: 8, formation: 'v' },
      { time: 50000, type: 'BOSS',   count: 1, formation: 'single' }, // mini-boss
      { time: 80000, type: 'BOSS',   count: 1, formation: 'single' }, // main boss
    ],
    boss: { spriteKey: 'boss_cruiser', hp: 70, scoreValue: 5000 },
  },
  {
    id: 3,
    name: 'Final Approach',
    music: 'music_boss',
    background: 'bg_final',
    timeline: [
      { time: 2000,  type: 'SMALL',  count: 6, formation: 'random' },
      { time: 7000,  type: 'MEDIUM', count: 4, formation: 'v' },
      { time: 12000, type: 'TURRET', count: 3, formation: 'line' },
      { time: 18000, type: 'LARGE',  count: 3, formation: 'line' },
      { time: 25000, type: 'SMALL',  count: 10, formation: 'random' },
      { time: 35000, type: 'MEDIUM', count: 5, formation: 'v' },
      { time: 45000, type: 'LARGE',  count: 3, formation: 'random' },
      { time: 60000, type: 'BOSS',   count: 1, formation: 'single' },
    ],
    boss: { spriteKey: 'boss_dreadnought', hp: 120, scoreValue: 5000, phases: 2 },
  },
];
