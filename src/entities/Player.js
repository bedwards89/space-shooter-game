import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, shipKey) {
    super(scene, x, y, shipKey);
    // Phase 3: movement, fire rate, pooled bullets, invulnerability frames.
  }
}
