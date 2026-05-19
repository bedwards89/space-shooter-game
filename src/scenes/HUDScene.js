import Phaser from 'phaser';
import { GAME_WIDTH } from '../config.js';
import { PLAYER } from '../config.js';

const STYLE = { fontFamily: '"Kenney Future", monospace', fontSize: '10px', color: '#ffffff' };

// Life icon frames per ship
const LIFE_FRAMES = {
  Comet:   'playerLife1_blue.png',
  Wraith:  'playerLife2_orange.png',
  Bulwark: 'playerLife3_green.png',
};

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
    this._comboTxt = this.add.text(6, 18, '', {
      ...STYLE, color: '#ffdd00',
    }).setVisible(false);

    // Life icons
    this._lifeIcons = [];
    this._buildLives();

    // Listen for game events emitted by GameScene via registry
    this.registry.events.on('changedata-score', (parent, score) => {
      this._score = score;
      this._scoreTxt.setText(`SCORE  ${score}`);
    });
    this.registry.events.on('changedata-lives', (parent, lives) => {
      this._lives = lives;
      this._buildLives();
    });
    this.registry.events.on('changedata-combo', (parent, combo) => {
      if (combo > 1) {
        this._comboTxt.setText(`x${combo} COMBO`).setVisible(true);
      } else {
        this._comboTxt.setVisible(false);
      }
    });
  }

  _buildLives() {
    this._lifeIcons.forEach((icon) => icon.destroy());
    this._lifeIcons = [];
    const shipId = this.registry.get('selectedShip') ?? 'Comet';
    const frame = LIFE_FRAMES[shipId] ?? 'playerLife1_blue.png';
    for (let i = 0; i < this._lives; i++) {
      const icon = this.add.image(GAME_WIDTH - 10 - i * 20, 8, 'sheet', frame).setScale(1);
      this._lifeIcons.push(icon);
    }
  }
}
