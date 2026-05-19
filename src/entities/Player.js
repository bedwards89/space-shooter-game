import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';
import { SHIPS } from '../data/ships.js';
import { InputManager } from '../systems/InputManager.js';

const SHIP_FRAMES = {
  Comet:   'playerShip1_blue.png',
  Wraith:  'playerShip2_orange.png',
  Bulwark: 'playerShip3_green.png',
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, shipId) {
    const ship = SHIPS.find((s) => s.id === shipId) ?? SHIPS[0];
    super(scene, x, y, 'sheet', SHIP_FRAMES[shipId] ?? SHIP_FRAMES.Comet);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this._ship = ship;
    this._lives = PLAYER.lives;
    this._invuln = false;
    this._alive = true;
    this._lastFireTime = 0;

    this.setScale(1).setAngle(90);

    // Hitbox: use unscaled frame dims (body size in Phaser 3 is pre-scale).
    // After +90° rotation (nose→right) frame height becomes the horizontal axis, so swap.
    const fw = this.frame.realWidth;
    const fh = this.frame.realHeight;
    this.body.setSize(fh * ship.hitboxScale, fw * ship.hitboxScale);

    this.setCollideWorldBounds(true);
  }

  get lives() { return this._lives; }
  get alive() { return this._alive; }

  // Called each frame by GameScene.
  tick(time, delta) {
    if (!this._alive) return;
    this._handleMovement();
    this._handleFire(time);
  }

  // Returns true if the hit killed the player.
  hit() {
    if (this._invuln || !this._alive) return false;
    this._lives--;
    this.emit('livesChanged', this._lives);

    if (this._lives <= 0) {
      this._alive = false;
      this.emit('died');
      return true;
    }

    // Survive the hit — start i-frames.
    this._startInvuln();
    return false;
  }

  // Called between levels or on retry to return player to start.
  resetForLevel(x, y) {
    this._alive = true;
    this._invuln = false;
    this.setAlpha(1);
    this.enableBody(true, x, y, true, true);
  }

  _handleMovement() {
    let vx = 0;
    let vy = 0;

    if (InputManager.isLeft())  vx -= 1;
    if (InputManager.isRight()) vx += 1;
    if (InputManager.isUp())    vy -= 1;
    if (InputManager.isDown())  vy += 1;

    // Normalize diagonal so it's not ~41% faster than cardinal.
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    this.setVelocity(vx * this._ship.speed, vy * this._ship.speed);
  }

  _handleFire(time) {
    if (!InputManager.isFire()) return;
    if (time - this._lastFireTime < this._ship.fireRate) return;
    this._lastFireTime = time;
    // After -90° rotation the "nose" is at x + half of the original frame height.
    this.emit('fire', this.x + (this.frame.realHeight * this.scaleX) / 2, this.y);
  }

  _startInvuln() {
    this._invuln = true;
    // Flash the ship to signal i-frames.
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.25, to: 1 },
      duration: 80,
      yoyo: true,
      repeat: Math.floor(PLAYER.invulnDuration / 160) - 1,
      onComplete: () => {
        this._invuln = false;
        this.setAlpha(1);
      },
    });
  }
}
