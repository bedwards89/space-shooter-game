import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SHIPS } from '../data/ships.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

const SHIP_FRAMES = {
  Comet:   'playerShip1_blue.png',
  Wraith:  'playerShip2_orange.png',
  Bulwark: 'playerShip3_green.png',
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // --- Parallax background (3 layers, scrolling left at different speeds) ---
    this._bgFar  = this.add.tileSprite(CX, CY, GAME_WIDTH, GAME_HEIGHT, 'bg_black');
    this._bgMid  = this.add.tileSprite(CX, CY, GAME_WIDTH, GAME_HEIGHT, 'bg_darkPurple').setAlpha(0.6);
    this._bgNear = this.add.tileSprite(CX, CY, GAME_WIDTH, GAME_HEIGHT, 'bg_purple').setAlpha(0.3);

    // --- Player ship (static in Phase 2; Phase 3 adds movement) ---
    const shipId = this.registry.get('selectedShip') ?? 'Comet';
    this._player = this.add.image(80, CY, 'sheet', SHIP_FRAMES[shipId]).setScale(2);

    // --- HUD runs in parallel ---
    this.scene.launch('HUD');

    // --- Pause input ---
    this._pauseKey = this.input.keyboard.addKeys({ p: 'P', esc: 'ESC' });
    this._paused = false;
  }

  update(time, delta) {
    const dt = delta / 1000;
    this._bgFar.tilePositionX  += 20 * dt;
    this._bgMid.tilePositionX  += 45 * dt;
    this._bgNear.tilePositionX += 90 * dt;

    if (
      Phaser.Input.Keyboard.JustDown(this._pauseKey.p) ||
      Phaser.Input.Keyboard.JustDown(this._pauseKey.esc)
    ) {
      this._openPause();
    }
  }

  _openPause() {
    this.scene.pause();
    this.scene.launch('Pause');
  }
}
