import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioManager } from '../systems/AudioManager.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;
const BAR_W = 200;
const BAR_H = 12;

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this._buildProgressBar();

    this.load.on('progress', (v) => this._bar.scaleX = v);

    // Sprite atlases — Kenney uses Starling XML format, not JSON.
    this.load.atlasXML('sheet',  'assets/sprites/sheet.png',  'assets/sprites/sheet.xml');
    this.load.atlasXML('sheet2', 'assets/sprites/sheet2.png', 'assets/sprites/sheet2.xml');

    // Backgrounds (individual PNGs, used as TileSprite textures)
    this.load.image('bg_black',      'assets/sprites/bg_black.png');
    this.load.image('bg_blue',       'assets/sprites/bg_blue.png');
    this.load.image('bg_darkPurple', 'assets/sprites/bg_darkPurple.png');
    this.load.image('bg_purple',     'assets/sprites/bg_purple.png');

    // SFX
    this.load.audio('sfx_shoot',          'assets/audio/sfx/sfx_shoot.ogg');
    this.load.audio('sfx_enemyShoot',     'assets/audio/sfx/sfx_enemyShoot.ogg');
    this.load.audio('sfx_enemyHit',       'assets/audio/sfx/sfx_enemyHit.ogg');
    this.load.audio('sfx_explosion',      'assets/audio/sfx/sfx_explosion.ogg');
    this.load.audio('sfx_explosionLarge', 'assets/audio/sfx/sfx_explosionLarge.ogg');
    this.load.audio('sfx_playerDeath',    'assets/audio/sfx/sfx_playerDeath.ogg');
    this.load.audio('sfx_bossDeath',      'assets/audio/sfx/sfx_bossDeath.ogg');
    this.load.audio('sfx_shieldBreak',    'assets/audio/sfx/sfx_shieldBreak.ogg');
    this.load.audio('sfx_powerupPickup',  'assets/audio/sfx/sfx_powerupPickup.ogg');
    this.load.audio('sfx_menuSelect',     'assets/audio/sfx/sfx_menuSelect.ogg');
    this.load.audio('sfx_menuConfirm',    'assets/audio/sfx/sfx_menuConfirm.ogg');
    this.load.audio('sfx_levelComplete',  'assets/audio/sfx/sfx_levelComplete.ogg');

    // Music
    this.load.audio('music_menu',   'assets/audio/music/music_menu.mp3');
    this.load.audio('music_level1', 'assets/audio/music/music_level1.mp3');
    this.load.audio('music_level2', 'assets/audio/music/music_level2.mp3');
    this.load.audio('music_boss',   'assets/audio/music/music_boss.mp3');
  }

  create() {
    // Load save data into the game registry so every scene can read it.
    const save = SaveSystem.load();
    this.registry.set('save', save);
    this.registry.set('selectedShip', save.unlockedShips[0] ?? 'Comet');
    this.registry.set('currentLevel', 1);

    AudioManager.init(this, save.settings);

    this.scene.start('Menu');
  }

  _buildProgressBar() {
    const bg = this.add.rectangle(CX, CY, BAR_W + 4, BAR_H + 4, 0x333333);
    this._bar = this.add.rectangle(CX - BAR_W / 2, CY, BAR_W, BAR_H, 0x4488ff)
      .setOrigin(0, 0.5);
    this._bar.scaleX = 0;

    this.add.text(CX, CY - 20, 'LOADING…', {
      fontFamily: '"Kenney Future", monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5);
  }
}
