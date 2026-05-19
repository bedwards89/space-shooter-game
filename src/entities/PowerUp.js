import Phaser from 'phaser';
import { POWERUP } from '../config.js';
import { POWERUP_TYPES } from '../data/powerups.js';

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'sheet', 'powerupBlue_star.png');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.disableBody(true, true);

    this._typeId      = null;
    this._expireEvent = null;
  }

  // Activate from pool at a world position with the given type.
  reset(x, y, typeId) {
    this._typeId = typeId;
    this.setTexture('sheet', POWERUP_TYPES[typeId].frame);
    this.enableBody(true, x, y, true, true);
    this.setVelocityX(-POWERUP.driftSpeed);

    // Auto-despawn if the player doesn't collect it in time.
    this._expireEvent = this.scene.time.delayedCall(
      POWERUP.onScreenLifetime,
      () => { if (this.active) this.disableBody(true, true); }
    );
  }

  // Called on player collision — cancels the expire timer and returns the typeId.
  collect() {
    this._expireEvent?.remove();
    this.disableBody(true, true);
    return this._typeId;
  }
}
