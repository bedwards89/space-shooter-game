import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';
import { InputManager } from '../systems/InputManager.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';

const BULLET_POOL_SIZE = 20;
const PLAYER_START_X = 80;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Physics world == canvas bounds.
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // --- Parallax layers ---
    this._bgFar  = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_black');
    this._bgMid  = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_darkPurple').setAlpha(0.6);
    this._bgNear = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_purple').setAlpha(0.3);

    // --- Bullet pool (pre-created, no runtime allocations) ---
    this._bullets = [];
    for (let i = 0; i < BULLET_POOL_SIZE; i++) {
      this._bullets.push(new Bullet(this, -200, -200));
    }

    // --- Player ---
    const shipId = this.registry.get('selectedShip') ?? 'Comet';
    this._player = new Player(this, PLAYER_START_X, GAME_HEIGHT / 2, shipId);

    this._player.on('fire', (x, y) => this._fireBullet(x, y));
    this._player.on('livesChanged', (lives) => {
      this.registry.set('lives', lives);
    });
    this._player.on('died', () => this._onPlayerDied());

    // Initialise HUD values.
    this.registry.set('score', 0);
    this.registry.set('lives', PLAYER.lives);
    this.registry.set('combo', 1);

    // --- Input ---
    InputManager.init(this);

    // --- HUD runs in parallel ---
    this.scene.launch('HUD');

    // --- Pause ---
    this._dead = false;
  }

  update(time, delta) {
    if (this._dead) return;

    const dt = delta / 1000;
    this._bgFar.tilePositionX  += 20 * dt;
    this._bgMid.tilePositionX  += 45 * dt;
    this._bgNear.tilePositionX += 90 * dt;

    this._player.tick(time, delta);

    // Pause — InputManager reads the same keyboard the scene uses.
    if (InputManager.isPauseJustDown()) {
      this._openPause();
    }
  }

  // ------------------------------------------------------------------ //

  _fireBullet(x, y) {
    const b = this._bullets.find((b) => !b.active);
    if (!b) return; // pool exhausted (shouldn't happen at 20 bullets)
    b.fire(x, y, PLAYER.bulletSpeed);
    this.sound.play('sfx_shoot', { volume: this._getSfxVol() * 0.6 });
  }

  _onPlayerDied() {
    this._dead = true;
    this.sound.play('sfx_playerDeath', { volume: this._getSfxVol() });

    // Brief explosion flash at player position.
    this.cameras.main.shake(300, 0.015);

    // Short delay then go to GameOver.
    this.time.delayedCall(1200, () => {
      this.scene.stop('HUD');
      const save = this.registry.get('save');
      this.scene.start('GameOver', {
        score: this.registry.get('score') ?? 0,
        ship: this.registry.get('selectedShip') ?? 'Comet',
        won: false,
      });
    });
  }

  _openPause() {
    this.scene.pause();
    this.scene.launch('Pause');
  }

  _getSfxVol() {
    return this.registry.get('save')?.settings?.sfxVolume ?? 0.8;
  }
}
