import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, POWERUP } from '../config.js';

const STYLE      = { fontFamily: '"Kenney Future", monospace', fontSize: '20px', color: '#ffffff' };
const STYLE_TINY = { fontFamily: '"Kenney Future", monospace', fontSize: '14px', color: '#aaaaaa' };

const LIFE_FRAMES = {
  Comet:   'playerLife1_blue.png',
  Wraith:  'playerLife2_orange.png',
  Bulwark: 'playerLife3_green.png',
};

// Power-up bar layout constants
const BAR_X      = 16;   // left edge of label
const BAR_LBL_W  = 52;   // pixels reserved for the 3-char label
const BAR_W      = 140;  // width of the fill area
const BAR_H      = 10;
const BAR_Y_SPR  = GAME_HEIGHT - 38;
const BAR_Y_RPD  = GAME_HEIGHT - 20;
const SHD_Y      = GAME_HEIGHT - 38;

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this._score = 0;
    this._lives = PLAYER.lives;
    this._combo = 1;

    // Score
    this._scoreTxt = this.add.text(16, 14, 'SCORE  0', STYLE);

    // Combo multiplier (hidden until ×2 activates)
    this._comboTxt = this.add.text(16, 42, '', { ...STYLE, color: '#ff8800' }).setVisible(false);

    // Life icons
    this._lifeIcons = [];
    this._buildLives();

    // Power-up indicators
    this._spreadBar  = this._makePowerupBar(BAR_Y_SPR, 0x4488ff, 'SPR');
    this._rapidBar   = this._makePowerupBar(BAR_Y_RPD, 0x44cc44, 'RPD');
    this._shieldText = this.add.text(GAME_WIDTH - 16, SHD_Y, 'SHIELD', {
      ...STYLE_TINY, color: '#88ccff',
    }).setOrigin(1, 0.5).setVisible(false);

    // Registry listeners — stored so they can be removed on shutdown.
    this._onScore  = (_p, score)  => { this._scoreTxt.setText(`SCORE  ${score}`); };
    this._onLives  = (_p, lives)  => { this._lives = lives; this._buildLives(); };
    this._onCombo  = (_p, combo)  => {
      if (combo > 1) {
        this._comboTxt.setText(`x${combo} MULTI`).setVisible(true);
      } else {
        this._comboTxt.setVisible(false);
      }
    };
    this._onShield = (_p, active) => { this._shieldText.setVisible(active); };

    this.registry.events.on('changedata-score',        this._onScore);
    this.registry.events.on('changedata-lives',        this._onLives);
    this.registry.events.on('changedata-combo',        this._onCombo);
    this.registry.events.on('changedata-powerupShield', this._onShield);

    this.events.once('shutdown', () => {
      this.registry.events.off('changedata-score',        this._onScore);
      this.registry.events.off('changedata-lives',        this._onLives);
      this.registry.events.off('changedata-combo',        this._onCombo);
      this.registry.events.off('changedata-powerupShield', this._onShield);
    });
  }

  update(time) {
    this._updateBar(this._spreadBar, time,
      this.registry.get('powerupSpreadEnds') ?? 0, POWERUP.spreadDuration);
    this._updateBar(this._rapidBar,  time,
      this.registry.get('powerupRapidEnds')  ?? 0, POWERUP.rapidDuration);
  }

  // ------------------------------------------------------------------ //

  _makePowerupBar(y, fillColor, label) {
    const lbl  = this.add.text(BAR_X, y, label, STYLE_TINY).setVisible(false);
    const bg   = this.add.rectangle(BAR_X + BAR_LBL_W, y + BAR_H / 2, BAR_W, BAR_H, 0x333333)
      .setOrigin(0, 0.5).setVisible(false);
    const fill = this.add.rectangle(BAR_X + BAR_LBL_W, y + BAR_H / 2, BAR_W, BAR_H, fillColor)
      .setOrigin(0, 0.5).setVisible(false);
    return { lbl, bg, fill };
  }

  _updateBar({ lbl, bg, fill }, time, endsAt, duration) {
    const active = endsAt > 0 && time < endsAt;
    lbl.setVisible(active);
    bg.setVisible(active);
    fill.setVisible(active);
    if (active) {
      fill.setScale(Math.max(0, (endsAt - time) / duration), 1);
    }
  }

  _buildLives() {
    this._lifeIcons.forEach((icon) => icon.destroy());
    this._lifeIcons = [];
    const shipId = this.registry.get('selectedShip') ?? 'Comet';
    const frame  = LIFE_FRAMES[shipId] ?? 'playerLife1_blue.png';
    for (let i = 0; i < this._lives; i++) {
      const icon = this.add.image(GAME_WIDTH - 50 - i * 80, 10, 'sheet', frame)
        .setScale(2).setOrigin(0.5, 0);
      this._lifeIcons.push(icon);
    }
  }
}
