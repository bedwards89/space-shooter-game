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
    this._sparkle     = null;
  }

  // Activate from pool at a world position with the given type.
  reset(x, y, typeId) {
    this._typeId = typeId;
    this.setTexture('sheet', POWERUP_TYPES[typeId].frame);
    this.enableBody(true, x, y, true, true);
    this.setVelocityX(-POWERUP.driftSpeed);

    this._sparkle?.destroy();
    this._sparkle = this.scene.add.particles(0, 0, 'sheet', {
      frame: ['star1.png', 'star2.png'],
      follow: this,
      lifespan: 500,
      speed: { min: 20, max: 55 },
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.75, end: 0 },
      blendMode: 'ADD',
      frequency: 90,
      angle: { min: 0, max: 360 },
    }).setDepth(3);

    // Auto-despawn if the player doesn't collect it in time.
    this._expireEvent = this.scene.time.delayedCall(
      POWERUP.onScreenLifetime,
      () => {
        if (this.active) this.disableBody(true, true);
        this._sparkle?.destroy();
        this._sparkle = null;
      }
    );
  }

  // Called on player collision — cancels the expire timer and returns the typeId.
  collect() {
    this._expireEvent?.remove();
    this.disableBody(true, true);
    this._sparkle?.destroy();
    this._sparkle = null;
    return this._typeId;
  }
}
