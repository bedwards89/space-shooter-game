import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    // Phase 3: pooled, velocity-driven, auto-deactivate off-screen.
  }

  reset(x, y, vx, vy) {}
}
