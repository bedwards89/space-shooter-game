import Phaser from 'phaser';

export const POWERUP_TYPES = Object.freeze({ SPREAD: 'SPREAD', SHIELD: 'SHIELD', RAPID: 'RAPID' });

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'powerup');
    // Phase 5: float left, auto-deactivate after POWERUP.onScreenLifetime ms.
  }

  reset(x, y, type) {}
}
