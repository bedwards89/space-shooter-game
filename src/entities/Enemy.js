import Phaser from 'phaser';
import { GAME_HEIGHT, ENEMY } from '../config.js';
import { ENEMY_TYPES } from '../data/enemies.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'sheet', 'enemyBlack4.png');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);

    this._type = null;
    this._hp = 0;
    this._sineOffset = 0;
    this._lastFireTime = 0;
    this._stopX = null;
  }

  // Activate from the pool. overrides let level data replace hp/scoreValue for bosses.
  reset(x, y, typeId, overrides = {}) {
    const base = ENEMY_TYPES[typeId];
    if (!base) return this;

    this._type = { ...base, ...overrides };
    this._hp = this._type.hp;
    this._sineOffset = Math.random() * Math.PI * 2;
    this._lastFireTime = 0;

    this._stopX = this._type.movement === 'turret' ? ENEMY.turretStopX
                : this._type.movement === 'boss'   ? ENEMY.bossStopX
                : null;

    this.setTexture('sheet', this._type.frame);
    this.setScale(this._type.scale);
    this.setAngle(-90); // Kenney sprites face up; -90° rotates nose to face left
    this.clearTint();
    this.setAlpha(1);

    // Hitbox: after -90° rotation, the frame's height is the horizontal axis.
    const fw = this.frame.realWidth;
    const fh = this.frame.realHeight;
    this.body.setSize(fh * this._type.hitboxScale, fw * this._type.hitboxScale);

    this.enableBody(true, x, y, true, true);
    return this;
  }

  // Returns true if the hit killed this enemy.
  hit(damage = 1) {
    this._hp -= damage;
    if (this._hp <= 0) {
      this.disableBody(true, true);
      return true;
    }
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });
    return false;
  }

  tick(time, delta) {
    const dt = delta / 1000;

    switch (this._type.movement) {
      case 'straight': this._moveStraight(dt);      break;
      case 'sine':     this._moveSine(dt);           break;
      case 'turret':   this._moveTurret(dt);         break;
      case 'boss':     this._moveBoss(time, dt);     break;
    }

    if (this._type.fireRate) this._handleFire(time);

    // Fell off the left edge — reclaim to pool.
    if (this.x < -64) this.disableBody(true, true);
  }

  _moveStraight(dt) {
    this.x -= this._type.speed * dt;
  }

  _moveSine(dt) {
    this._sineOffset += dt * 2.5;
    this.x -= this._type.speed * dt;
    this.y += Math.sin(this._sineOffset) * 60 * dt;
    this.y = Phaser.Math.Clamp(this.y, 20, GAME_HEIGHT - 20);
  }

  _moveTurret(dt) {
    if (this.x > this._stopX) {
      this.x -= this._type.speed * dt;
    }
    // Holds position once stopped.
  }

  _moveBoss(time, dt) {
    if (this.x > this._stopX) {
      this.x -= this._type.speed * dt;
    }
    this.y = GAME_HEIGHT / 2 +
      Math.sin((time / 1000) * ENEMY.bossOscillateSpeed) * ENEMY.bossOscillateAmplitude;
  }

  _handleFire(time) {
    if (time - this._lastFireTime < this._type.fireRate) return;
    this._lastFireTime = time;
    this.emit('fire', this.x, this.y, this._type.id === 'BOSS');
  }
}
