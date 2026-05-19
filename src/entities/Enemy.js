import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);
    // Phase 4: movement patterns, HP, firing, pool-friendly reset().
  }

  reset(x, y, config) {
    // Reinitialize from pool — no `new` at runtime.
  }
}
