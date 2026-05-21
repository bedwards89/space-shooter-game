// One-shot particle burst helpers. Phaser manages particle lifecycle internally.
// Each call creates an emitter, fires a burst via explode(), then destroys after lifespan.
export class Explosion {

  // Small enemies (SMALL type)
  static spawnSmall(scene, x, y) {
    const e = scene.add.particles(x, y, 'sheet', {
      frame: ['star1.png', 'star2.png', 'star3.png'],
      lifespan: 400,
      speed: { min: 60, max: 240 },
      scale: { start: 1.8, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
    }).setDepth(5);
    e.explode(12);
    scene.time.delayedCall(600, () => { if (e.active) e.destroy(); });
  }

  // Medium/large enemies (MEDIUM, LARGE, TURRET types)
  static spawnMedium(scene, x, y) {
    const e = scene.add.particles(x, y, 'sheet', {
      frame: ['star1.png', 'star2.png', 'star3.png'],
      lifespan: 600,
      speed: { min: 100, max: 380 },
      scale: { start: 3.0, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
    }).setDepth(5);
    e.explode(22);
    scene.time.delayedCall(850, () => { if (e.active) e.destroy(); });
  }

  // Boss kill and player death — two-layer blast
  static spawnLarge(scene, x, y) {
    const outer = scene.add.particles(x, y, 'sheet', {
      frame: ['star1.png', 'star2.png', 'star3.png'],
      lifespan: 800,
      speed: { min: 200, max: 580 },
      scale: { start: 4.0, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
    }).setDepth(5);
    outer.explode(32);

    // Dense slow core using rendered glow sprites from the Space Kit atlas
    const core = scene.add.particles(x, y, 'sheet2', {
      frame: ['spaceEffects_013.png', 'spaceEffects_014.png', 'spaceEffects_015.png', 'spaceEffects_016.png'],
      lifespan: 600,
      speed: { min: 20, max: 140 },
      scale: { start: 3.0, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
    }).setDepth(5);
    core.explode(12);

    scene.time.delayedCall(1100, () => {
      if (outer.active) outer.destroy();
      if (core.active) core.destroy();
    });
  }
}
