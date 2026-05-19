import Phaser from 'phaser';
import { GAME_WIDTH, PLAYER, POWERUP } from '../config.js';

const STYLE      = { fontFamily: '"Kenney Future", monospace', fontSize: '10px', color: '#ffffff' };
const STYLE_TINY = { fontFamily: '"Kenney Future", monospace', fontSize: '7px',  color: '#aaaaaa' };

const LIFE_FRAMES = {
  Comet:   'playerLife1_blue.png',
  Wraith:  'playerLife2_orange.png',
  Bulwark: 'playerLife3_green.png',
};

// Power-up bar layout constants
const BAR_X      = 6;   // left edge of label
const BAR_LBL_W  = 22;  // pixels reserved for the 3-char label
const BAR_W      = 50;  // width of the fill area
const BAR_H      = 4;
const BAR_Y_SPR  = 252;
const BAR_Y_RPD  = 260;
const SHD_Y      = 260;

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this._score = 0;
    this._lives = PLAYER.lives;
    this._combo = 1;

    // Score
    this._scoreTxt = this.add.text(6, 6, 'SCORE  0', STYLE);

    // Combo (hidden until active)
    this._comboTxt = this.add.text(6, 18, '', { ...STYLE, color: '#ffdd00' }).setVisible(false);

    // Life icons
    this._lifeIcons = [];
    this._buildLives();

    // Power-up indicators
    this._spreadBar  = this._makePowerupBar(BAR_Y_SPR, 0x4488ff, 'SPR');
    this._rapidBar   = this._makePowerupBar(BAR_Y_RPD, 0x44cc44, 'RPD');
    this._shieldText = this.add.text(GAME_WIDTH - 40, SHD_Y, 'SHIELD', {
      ...STYLE_TINY, color: '#88ccff',
    }).setOrigin(0, 0).setVisible(false);

    // Registry listeners
    this.registry.events.on('changedata-score', (_p, score) => {
      this._scoreTxt.setText(`SCORE  ${score}`);
    });
    this.registry.events.on('changedata-lives', (_p, lives) => {
      this._lives = lives;
      this._buildLives();
    });
    this.registry.events.on('changedata-combo', (_p, combo) => {
      if (combo > 1) {
        this._comboTxt.setText(`x${combo} COMBO`).setVisible(true);
      } else {
        this._comboTxt.setVisible(false);
      }
    });
    this.registry.events.on('changedata-powerupShield', (_p, active) => {
      this._shieldText.setVisible(active);
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
      const icon = this.add.image(GAME_WIDTH - 10 - i * 20, 8, 'sheet', frame).setScale(1);
      this._lifeIcons.push(icon);
    }
  }
}
