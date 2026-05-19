import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;
const STYLE = { fontFamily: '"Kenney Future", monospace', fontSize: '12px', color: '#ffffff' };
const STYLE_SEL = { ...STYLE, color: '#ffdd00' };
const STYLE_TITLE = { fontFamily: '"Kenney Future", monospace', fontSize: '22px', color: '#ffffff' };

const ITEMS = ['Resume', 'Quit to Menu'];

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    this._sel = 0;

    // Semi-transparent overlay
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    this.add.text(CX, CY - 40, 'PAUSED', STYLE_TITLE).setOrigin(0.5);

    this._texts = ITEMS.map((label, i) =>
      this.add.text(CX, CY - 8 + i * 22, label, STYLE).setOrigin(0.5)
    );

    this._renderSelection();
    this._setupKeys();
  }

  _setupKeys() {
    this.input.keyboard.on('keydown-UP',    () => this._move(-1));
    this.input.keyboard.on('keydown-DOWN',  () => this._move(1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
    // P or Esc also resumes
    this.input.keyboard.on('keydown-P',   () => this._resume());
    this.input.keyboard.on('keydown-ESC', () => this._resume());
  }

  _move(dir) {
    this._sel = Phaser.Math.Wrap(this._sel + dir, 0, ITEMS.length);
    this._renderSelection();
  }

  _confirm() {
    if (this._sel === 0) this._resume(); else this._quitToMenu();
  }

  _resume() {
    this.scene.resume('Game');
    this.scene.stop();
  }

  _quitToMenu() {
    this.scene.stop('HUD');
    this.scene.stop('Game');
    this.scene.stop();
    this.scene.start('Menu');
  }

  _renderSelection() {
    this._texts.forEach((t, i) => t.setStyle(i === this._sel ? STYLE_SEL : STYLE));
  }
}
