import Phaser from 'phaser';
import { GAME_WIDTH } from '../config.js';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, frame = 'laserBlue01.png') {
    super(scene, x, y, 'sheet', frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setAngle(-90); // atlas sprite is vertical; rotate to face right
    this.setActive(false).setVisible(false);
  }

  // Called by GameScene to activate from the pool.
  fire(x, y, vx, vy = 0) {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(vx, vy);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.x > GAME_WIDTH + 32 || this.x < -32) {
      this.disableBody(true, true);
    }
  }
}
