import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, ENEMY } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { InputManager } from '../systems/InputManager.js';
import { SpawnSystem, getSpawnPositions } from '../systems/SpawnSystem.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import Enemy from '../entities/Enemy.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

const PLAYER_BULLET_COUNT = 20;
const ENEMY_BULLET_COUNT  = 16;
const POOL_SIZES = { SMALL: 15, MEDIUM: 8, LARGE: 5, TURRET: 4, BOSS: 1 };

// Scroll speeds (px/s) for the three parallax layers.
const BG_SPEEDS = [20, 45, 90];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const levelNum = this.registry.get('currentLevel') ?? 1;
    this._levelData = LEVELS[levelNum - 1] ?? LEVELS[0];

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this._setupBackground();
    this._setupPlayerBulletPool();
    this._setupEnemyBulletPool();
    this._setupEnemyPool();
    this._setupPlayer();
    this._setupColliders();

    this._spawner = new SpawnSystem(this._levelData.timeline);
    this._elapsed = 0;
    this._levelComplete = false;
    this._dead = false;

    this.registry.set('score',  0);
    this.registry.set('lives',  PLAYER.lives);
    this.registry.set('combo',  1);

    InputManager.init(this);
    this.scene.launch('HUD');
  }

  update(time, delta) {
    if (this._dead || this._levelComplete) return;

    const dt = delta / 1000;
    this._bgFar.tilePositionX  += BG_SPEEDS[0] * dt;
    this._bgMid.tilePositionX  += BG_SPEEDS[1] * dt;
    this._bgNear.tilePositionX += BG_SPEEDS[2] * dt;

    this._player.tick(time, delta);

    this._allEnemies.forEach((e) => { if (e.active) e.tick(time, delta); });

    this._elapsed += delta;
    const waves = this._spawner.tick(this._elapsed);
    waves.forEach((entry) => this._spawnWave(entry));

    if (this._spawner.isDone && !this._allEnemies.some((e) => e.active)) {
      this._onLevelComplete();
    }

    if (InputManager.isPauseJustDown()) this._openPause();
  }

  // ------------------------------------------------------------------ //

  _setupBackground() {
    const { bgFar, bgMid, bgNear } = this._levelData;
    this._bgFar  = this.add.tileSprite(CX, CY, GAME_WIDTH, GAME_HEIGHT, bgFar);
    this._bgMid  = this.add.tileSprite(CX, CY, GAME_WIDTH, GAME_HEIGHT, bgMid).setAlpha(0.6);
    this._bgNear = this.add.tileSprite(CX, CY, GAME_WIDTH, GAME_HEIGHT, bgNear).setAlpha(0.3);
  }

  _setupPlayerBulletPool() {
    this._bullets = [];
    for (let i = 0; i < PLAYER_BULLET_COUNT; i++) {
      this._bullets.push(new Bullet(this, -200, -200));
    }
  }

  _setupEnemyBulletPool() {
    this._enemyBullets = [];
    for (let i = 0; i < ENEMY_BULLET_COUNT; i++) {
      this._enemyBullets.push(new Bullet(this, -200, -200, 'laserRed01.png'));
    }
  }

  _setupEnemyPool() {
    this._enemyPools = {};
    this._allEnemies = [];

    Object.entries(POOL_SIZES).forEach(([typeId, count]) => {
      const pool = [];
      for (let i = 0; i < count; i++) {
        const enemy = new Enemy(this, -200, -200);
        // Single persistent listener per enemy instance — safe across resets.
        enemy.on('fire', (x, y, isBoss) => this._fireEnemyBullet(x, y, isBoss));
        pool.push(enemy);
        this._allEnemies.push(enemy);
      }
      this._enemyPools[typeId] = pool;
    });
  }

  _setupPlayer() {
    const shipId = this.registry.get('selectedShip') ?? 'Comet';
    this._player = new Player(this, 80, CY, shipId);

    this._player.on('fire',         (x, y) => this._firePlayerBullet(x, y));
    this._player.on('livesChanged', (lives) => this.registry.set('lives', lives));
    this._player.on('died',         ()      => this._onPlayerDied());
  }

  _setupColliders() {
    // Player bullets vs enemies.
    this.physics.add.overlap(
      this._bullets, this._allEnemies,
      this._onBulletHitEnemy, null, this
    );

    // Enemy bullets vs player.
    this.physics.add.overlap(
      this._enemyBullets, this._player,
      this._onEnemyBulletHitPlayer, null, this
    );

    // Enemies touching the player (contact damage).
    this.physics.add.overlap(
      this._allEnemies, this._player,
      this._onEnemyContactPlayer, null, this
    );
  }

  // ------------------------------------------------------------------ //

  _spawnWave({ type, count, formation }) {
    const pool = this._enemyPools[type];
    if (!pool) return;

    // Only one boss alive at a time.
    if (type === 'BOSS' && pool.some((e) => e.active)) return;

    const yPositions = getSpawnPositions(count, formation);

    yPositions.forEach((y, i) => {
      const enemy = pool.find((e) => !e.active);
      if (!enemy) return;

      const overrides = type === 'BOSS'
        ? { hp: this._levelData.boss.hp, scoreValue: this._levelData.boss.scoreValue }
        : {};

      // V-formation: stagger X so wings trail behind the lead ship.
      const xOffset = formation === 'v' ? i * 24 : 0;
      enemy.reset(GAME_WIDTH + 32 + xOffset, y, type, overrides);
    });
  }

  _firePlayerBullet(x, y) {
    const b = this._bullets.find((b) => !b.active);
    if (!b) return;
    b.fire(x, y, PLAYER.bulletSpeed);
    this.sound.play('sfx_shoot', { volume: this._getSfxVol() * 0.6 });
  }

  _fireEnemyBullet(x, y, isBoss) {
    const angles = isBoss ? [-15, 0, 15] : [0];
    angles.forEach((deg) => {
      const b = this._enemyBullets.find((b) => !b.active);
      if (!b) return;
      const rad = Phaser.Math.DegToRad(deg);
      b.fire(x - 10, y, -ENEMY.bulletSpeed * Math.cos(rad), ENEMY.bulletSpeed * Math.sin(rad));
    });
  }

  // ------------------------------------------------------------------ //

  _onBulletHitEnemy(bullet, enemy) {
    bullet.disableBody(true, true);
    const killed = enemy.hit(1);
    if (killed) {
      const score = (this.registry.get('score') ?? 0) + enemy._type.scoreValue;
      this.registry.set('score', score);
      this.sound.play('sfx_explosion', { volume: this._getSfxVol() * 0.7 });
      this.cameras.main.shake(60, 0.005);
      // Phase 5: power-up drop hook goes here.
    } else {
      this.sound.play('sfx_enemyHit', { volume: this._getSfxVol() * 0.6 });
    }
  }

  _onEnemyBulletHitPlayer(bullet, player) {
    bullet.disableBody(true, true);
    if (!this._dead) player.hit();
  }

  _onEnemyContactPlayer(enemy, player) {
    enemy.disableBody(true, true);
    if (!this._dead) player.hit();
  }

  // ------------------------------------------------------------------ //

  _onPlayerDied() {
    this._dead = true;
    this.sound.play('sfx_playerDeath', { volume: this._getSfxVol() });
    this.cameras.main.shake(300, 0.015);

    this.time.delayedCall(1200, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', {
        score: this.registry.get('score') ?? 0,
        ship:  this.registry.get('selectedShip') ?? 'Comet',
        won:   false,
      });
    });
  }

  _onLevelComplete() {
    if (this._levelComplete) return;
    this._levelComplete = true;

    const levelNum = this.registry.get('currentLevel') ?? 1;
    const score    = this.registry.get('score') ?? 0;
    const shipId   = this.registry.get('selectedShip') ?? 'Comet';

    // Persist highest level cleared + ship unlocks.
    const save = this.registry.get('save');
    if (save) {
      if (save.highestLevelCleared < levelNum) save.highestLevelCleared = levelNum;
      if (levelNum >= 2 && !save.unlockedShips.includes('Wraith'))  save.unlockedShips.push('Wraith');
      if (levelNum >= 3 && !save.unlockedShips.includes('Bulwark')) save.unlockedShips.push('Bulwark');
      SaveSystem.save(save);
      this.registry.set('save', save);
    }

    this.sound.play('sfx_levelComplete', { volume: this._getSfxVol() });

    if (levelNum >= 3) {
      // Player cleared the final level.
      this.time.delayedCall(1500, () => {
        this.scene.stop('HUD');
        this.scene.start('GameOver', { score, ship: shipId, won: true });
      });
    } else {
      const banner = this.add.text(CX, CY, 'LEVEL COMPLETE', {
        fontFamily: '"Kenney Future", monospace',
        fontSize: '20px',
        color: '#44ff44',
      }).setOrigin(0.5).setDepth(10);

      this.time.delayedCall(2000, () => {
        banner.destroy();
        this.registry.set('currentLevel', levelNum + 1);
        this.scene.stop('HUD');
        this.scene.restart();
      });
    }
  }

  _openPause() {
    this.scene.pause();
    this.scene.launch('Pause');
  }

  _getSfxVol() {
    return this.registry.get('save')?.settings?.sfxVolume ?? 0.8;
  }
}
