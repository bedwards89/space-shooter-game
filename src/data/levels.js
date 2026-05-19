// Level timelines: each entry fires at `time` ms into the level.
// type: enemy type id from ENEMY_TYPES | 'BOSS'
// formation: 'line' | 'v' | 'random' | 'single'
// bgFar/bgMid/bgNear: preloaded background texture keys.

export const LEVELS = [
  {
    id: 1,
    name: 'Asteroid Belt',
    music: 'music_level1',
    bgFar:  'bg_black',
    bgMid:  'bg_darkPurple',
    bgNear: 'bg_purple',
    timeline: [
      { time:  3000, type: 'SMALL',  count: 3, formation: 'line'   },
      { time:  7000, type: 'SMALL',  count: 5, formation: 'v'      },
      { time: 12000, type: 'MEDIUM', count: 2, formation: 'line'   },
      { time: 18000, type: 'SMALL',  count: 6, formation: 'random' },
      { time: 25000, type: 'LARGE',  count: 1, formation: 'single' },
      { time: 30000, type: 'MEDIUM', count: 3, formation: 'v'      },
      { time: 40000, type: 'SMALL',  count: 8, formation: 'random' },
      { time: 55000, type: 'BOSS',   count: 1, formation: 'single' },
    ],
    boss: { hp: 40, scoreValue: 5000 },
  },
  {
    id: 2,
    name: 'Nebula Patrol',
    music: 'music_level2',
    bgFar:  'bg_black',
    bgMid:  'bg_blue',
    bgNear: 'bg_darkPurple',
    timeline: [
      { time:  3000, type: 'SMALL',  count: 4, formation: 'v'      },
      { time:  8000, type: 'MEDIUM', count: 3, formation: 'line'   },
      { time: 15000, type: 'TURRET', count: 2, formation: 'line'   },
      { time: 22000, type: 'LARGE',  count: 2, formation: 'line'   },
      { time: 30000, type: 'MEDIUM', count: 4, formation: 'random' },
      { time: 40000, type: 'SMALL',  count: 8, formation: 'v'      },
      { time: 50000, type: 'BOSS',   count: 1, formation: 'single' },
    ],
    boss: { hp: 70, scoreValue: 5000 },
  },
  {
    id: 3,
    name: 'Final Approach',
    music: 'music_boss',
    bgFar:  'bg_black',
    bgMid:  'bg_purple',
    bgNear: 'bg_blue',
    timeline: [
      { time:  2000, type: 'SMALL',  count: 6,  formation: 'random' },
      { time:  7000, type: 'MEDIUM', count: 4,  formation: 'v'      },
      { time: 12000, type: 'TURRET', count: 3,  formation: 'line'   },
      { time: 18000, type: 'LARGE',  count: 3,  formation: 'line'   },
      { time: 25000, type: 'SMALL',  count: 10, formation: 'random' },
      { time: 35000, type: 'MEDIUM', count: 5,  formation: 'v'      },
      { time: 45000, type: 'LARGE',  count: 3,  formation: 'random' },
      { time: 60000, type: 'BOSS',   count: 1,  formation: 'single' },
    ],
    boss: { hp: 120, scoreValue: 5000 },
  },
];
