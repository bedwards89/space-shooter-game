import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, POWERUP } from '../config.js';
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

    this._ship        = ship;
    this._lives       = PLAYER.lives;
    this._invuln      = false;
    this._alive       = true;
    this._lastFireTime = 0;

    // Power-up state
    this._spreadEnds = 0;
    this._rapidEnds  = 0;
    this._shielded   = false;

    // Scale the sprite to ship.scale so the visible art matches the physics body exactly.
    // body.setSize uses unscaled frame dims; Phaser multiplies by scaleX/Y internally.
    // After +90° rotation the frame height becomes the horizontal axis, so fh/fw are swapped.
    this.setScale(ship.scale).setAngle(90);
    const fw = this.frame.realWidth;
    const fh = this.frame.realHeight;
    this.body.setSize(fh, fw);

    this.setCollideWorldBounds(true);
  }

  get lives()    { return this._lives; }
  get alive()    { return this._alive; }
  get shielded() { return this._shielded; }

  // Called each frame by GameScene.
  tick(time, delta) {
    if (!this._alive) return;
    this._handleMovement();
    this._handleFire(time);
  }

  // Apply a collected power-up. typeId: 'SPREAD' | 'RAPID' | 'SHIELD'.
  applyPowerup(typeId) {
    const now = this.scene.time.now;
    switch (typeId) {
      case 'SPREAD':
        this._spreadEnds = now + POWERUP.spreadDuration;
        this.scene.registry.set('powerupSpreadEnds', this._spreadEnds);
        break;
      case 'RAPID':
        this._rapidEnds = now + POWERUP.rapidDuration;
        this.scene.registry.set('powerupRapidEnds', this._rapidEnds);
        break;
      case 'SHIELD':
        this._shielded = true;
        this.setTint(0x88ccff); // visual cue: blue tint while shielded
        this.scene.registry.set('powerupShield', true);
        break;
    }
  }

  // Returns true if the hit killed the player.
  hit() {
    if (this._invuln || !this._alive) return false;

    // Shield absorbs one hit instead of losing a life.
    if (this._shielded) {
      this._shielded = false;
      this.clearTint();
      this.scene.registry.set('powerupShield', false);
      this.scene.sound.play('sfx_shieldBreak', {
        volume: this.scene.registry.get('save')?.settings?.sfxVolume ?? 0.8,
      });
      this.emit('shieldBroke');
      this._startInvuln();
      return false;
    }

    this._lives--;
    this.emit('livesChanged', this._lives);
    this.emit('lostLife');

    if (this._lives <= 0) {
      this._alive = false;
      this.emit('died');
      return true;
    }

    this._startInvuln();
    return false;
  }

  // Called between levels or on retry.
  resetForLevel(x, y) {
    this._alive      = true;
    this._invuln     = false;
    this._spreadEnds = 0;
    this._rapidEnds  = 0;
    this._shielded   = false;
    this.clearTint();
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

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    this.setVelocity(vx * this._ship.speed, vy * this._ship.speed);
  }

  _handleFire(time) {
    if (!InputManager.isFire()) return;

    const rate = time < this._rapidEnds ? POWERUP.rapidFireRate : this._ship.fireRate;
    if (time - this._lastFireTime < rate) return;
    this._lastFireTime = time;

    const nx = this.x + (this.frame.realHeight * this.scaleX) / 2;

    if (time < this._spreadEnds) {
      this.emit('fire', nx, this.y, -15);
      this.emit('fire', nx, this.y,   0);
      this.emit('fire', nx, this.y,  15);
    } else {
      this.emit('fire', nx, this.y, 0);
    }
    // Single sound cue per fire action regardless of bullet count.
    this.emit('shoot');
  }

  _startInvuln() {
    this._invuln = true;
    this.scene.tweens.add({
      targets:  this,
      alpha:    { from: 0.25, to: 1 },
      duration: 80,
      yoyo:     true,
      repeat:   Math.floor(PLAYER.invulnDuration / 160) - 1,
      onComplete: () => {
        this._invuln = false;
        this.setAlpha(1);
      },
    });
  }
}
