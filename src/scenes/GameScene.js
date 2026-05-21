import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, ENEMY, SCORE, BG_SPEEDS } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { POWERUP_TYPE_IDS } from '../data/powerups.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { InputManager } from '../systems/InputManager.js';
import { SpawnSystem, getSpawnPositions } from '../systems/SpawnSystem.js';
import Player  from '../entities/Player.js';
import Bullet  from '../entities/Bullet.js';
import Enemy   from '../entities/Enemy.js';
import PowerUp from '../entities/PowerUp.js';
import { Explosion } from '../entities/Explosion.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

const PLAYER_BULLET_COUNT = 48; // enough for rapid + spread (3 bullets per 83 ms over ~1.3 s)
const ENEMY_BULLET_COUNT  = 16;
const POWERUP_POOL_SIZE   = 6;
const POOL_SIZES = { SMALL: 15, MEDIUM: 8, LARGE: 5, TURRET: 4, BOSS: 1 };

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
    this._setupPowerupPool();
    this._setupPlayer();
    this._setupColliders();

    this._spawner            = new SpawnSystem(this._levelData.timeline);
    this._elapsed            = 0;
    this._guaranteedDropDone = false;
    this._levelComplete      = false;
    this._dead               = false;
    this._lastMultiplier     = 1;

    ScoreSystem.reset();

    this.registry.set('score',            0);
    this.registry.set('lives',            PLAYER.lives);
    this.registry.set('combo',            1);
    this.registry.set('powerupSpreadEnds', 0);
    this.registry.set('powerupRapidEnds',  0);
    this.registry.set('powerupShield',     false);

    InputManager.init(this);
    this.scene.launch('HUD');

    const musicKey = levelNum <= 1 ? 'music_level1' : 'music_level2';
    AudioManager.playMusic(musicKey);
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

    ScoreSystem.decayCheck(time);
    const mult = ScoreSystem.getMultiplier();
    if (mult !== this._lastMultiplier) {
      this._lastMultiplier = mult;
      this.registry.set('combo', mult);
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
        enemy.on('fire', (x, y, isBoss) => this._fireEnemyBullet(x, y, isBoss));
        pool.push(enemy);
        this._allEnemies.push(enemy);
      }
      this._enemyPools[typeId] = pool;
    });
  }

  _setupPowerupPool() {
    this._powerups = [];
    for (let i = 0; i < POWERUP_POOL_SIZE; i++) {
      this._powerups.push(new PowerUp(this, -200, -200));
    }
  }

  _setupPlayer() {
    const shipId = this.registry.get('selectedShip') ?? 'Comet';
    this._player = new Player(this, 200, CY, shipId);

    this._player.on('fire',         (x, y, ang) => this._firePlayerBullet(x, y, ang));
    this._player.on('shoot',        ()           => this.sound.play('sfx_shoot', { volume: this._getSfxVol() * 0.6 }));
    this._player.on('livesChanged', (lives)      => this.registry.set('lives', lives));
    this._player.on('died',         ()           => this._onPlayerDied());
  }

  _setupColliders() {
    this.physics.add.overlap(
      this._bullets, this._allEnemies,
      this._onBulletHitEnemy, null, this
    );
    this.physics.add.overlap(
      this._enemyBullets, this._player,
      this._onEnemyBulletHitPlayer, null, this
    );
    this.physics.add.overlap(
      this._allEnemies, this._player,
      this._onEnemyContactPlayer, null, this
    );
    this.physics.add.overlap(
      this._powerups, this._player,
      this._onPlayerCollectPowerup, null, this
    );
  }

  // ------------------------------------------------------------------ //

  _spawnWave({ type, count, formation }) {
    const pool = this._enemyPools[type];
    if (!pool) return;
    if (type === 'BOSS' && pool.some((e) => e.active)) return;

    if (type === 'BOSS') AudioManager.playMusic('music_boss');

    const yPositions = getSpawnPositions(count, formation);
    yPositions.forEach((y, i) => {
      const enemy = pool.find((e) => !e.active);
      if (!enemy) return;
      const overrides = type === 'BOSS'
        ? { hp: this._levelData.boss.hp, scoreValue: this._levelData.boss.scoreValue }
        : {};
      const xOffset = formation === 'v' ? i * 64 : 0;
      enemy.reset(GAME_WIDTH + 32 + xOffset, y, type, overrides);
    });
  }

  _firePlayerBullet(x, y, angleDeg = 0) {
    const b = this._bullets.find((b) => !b.active);
    if (!b) return;
    const rad = Phaser.Math.DegToRad(angleDeg);
    b.fire(x, y, PLAYER.bulletSpeed * Math.cos(rad), PLAYER.bulletSpeed * Math.sin(rad));
  }

  _fireEnemyBullet(x, y, isBoss) {
    const angles = isBoss ? ENEMY.bossBulletAngles : [0];
    angles.forEach((deg) => {
      const b = this._enemyBullets.find((b) => !b.active);
      if (!b) return;
      const rad = Phaser.Math.DegToRad(deg);
      b.fire(x - 10, y, -ENEMY.bulletSpeed * Math.cos(rad), ENEMY.bulletSpeed * Math.sin(rad));
    });
    this.sound.play('sfx_enemyShoot', { volume: this._getSfxVol() * 0.45 });
  }

  _tryDropPowerup(x, y, dropChance) {
    if (dropChance <= 0) return;

    const levelNum    = this.registry.get('currentLevel') ?? 1;
    const isGuaranteed = levelNum === 1 && !this._guaranteedDropDone && this._elapsed < 30000;

    if (!isGuaranteed && Math.random() > dropChance) return;

    this._guaranteedDropDone = true;

    if (this._powerups.filter((p) => p.active).length >= 3) return;
    const slot = this._powerups.find((p) => !p.active);
    if (!slot) return;

    const typeId = POWERUP_TYPE_IDS[Math.floor(Math.random() * POWERUP_TYPE_IDS.length)];
    slot.reset(x, y, typeId);
  }

  // ------------------------------------------------------------------ //

  _onBulletHitEnemy(bullet, enemy) {
    if (!enemy._type) return;
    bullet.disableBody(true, true);
    const killed = enemy.hit(1);
    if (killed) {
      ScoreSystem.recordKill(this.time.now);
      this.registry.set('score', ScoreSystem.add(enemy._type.scoreValue, this.time.now));
      const mult = ScoreSystem.getMultiplier();
      if (mult !== this._lastMultiplier) {
        this._lastMultiplier = mult;
        this.registry.set('combo', mult);
      }
      this._spawnKillFX(enemy.x, enemy.y, enemy._type.id);
      this._tryDropPowerup(enemy.x, enemy.y, enemy._type.dropChance);
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

  _onPlayerCollectPowerup(powerup, player) {
    const typeId = powerup.collect();
    if (!typeId) return;
    player.applyPowerup(typeId);
    this.sound.play('sfx_powerupPickup', { volume: this._getSfxVol() });
    this.registry.set('score', ScoreSystem.add(SCORE.powerUpPickup, this.time.now));
  }

  // ------------------------------------------------------------------ //

  _spawnKillFX(x, y, typeId) {
    const vol = this._getSfxVol();
    if (typeId === 'BOSS') {
      Explosion.spawnLarge(this, x, y);
      this.cameras.main.shake(500, 0.025);
      this.sound.play('sfx_bossDeath', { volume: vol });
    } else if (typeId === 'LARGE' || typeId === 'MEDIUM' || typeId === 'TURRET') {
      Explosion.spawnMedium(this, x, y);
      this.cameras.main.shake(120, 0.010);
      this.sound.play('sfx_explosion', { volume: vol * 0.85 });
    } else {
      Explosion.spawnSmall(this, x, y);
      this.cameras.main.shake(60, 0.005);
      this.sound.play('sfx_explosion', { volume: vol * 0.7 });
    }
  }

  _onPlayerDied() {
    this._dead = true;
    AudioManager.stopMusic();
    Explosion.spawnLarge(this, this._player.x, this._player.y);
    this.sound.play('sfx_playerDeath', { volume: this._getSfxVol() });
    this.cameras.main.shake(300, 0.020);

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
      AudioManager.stopMusic();
      this.time.delayedCall(1500, () => {
        this.scene.stop('HUD');
        this.scene.start('GameOver', { score, ship: shipId, won: true });
      });
    } else {
      const banner = this.add.text(CX, CY, 'LEVEL COMPLETE', {
        fontFamily: '"Kenney Future", monospace',
        fontSize: '52px',
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
