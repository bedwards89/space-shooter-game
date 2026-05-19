import Phaser from 'phaser';

export default class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'explosion');
    // Phase 10: particle-based or sprite sheet, pooled.
  }

  reset(x, y) {}
}
