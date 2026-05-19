import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SHIPS } from '../data/ships.js';

const CX = GAME_WIDTH / 2;
const STYLE = { fontFamily: '"Kenney Future", monospace', fontSize: '10px', color: '#ffffff' };
const STYLE_LOCKED = { ...STYLE, color: '#555555' };
const STYLE_SELECTED = { ...STYLE, color: '#ffdd00' };
const STYLE_TITLE = { fontFamily: '"Kenney Future", monospace', fontSize: '18px', color: '#ffffff' };

// Which atlas frame to show for each ship
const SHIP_FRAMES = {
  Comet:   'playerShip1_blue.png',
  Wraith:  'playerShip2_orange.png',
  Bulwark: 'playerShip3_green.png',
};

export default class ShipSelectScene extends Phaser.Scene {
  constructor() {
    super('ShipSelect');
  }

  create() {
    const save = this.registry.get('save');
    this._unlocked = save?.unlockedShips ?? ['Comet'];
    this._sel = 0;

    // Background
    this.add.tileSprite(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_black');

    this.add.text(CX, 18, 'SELECT SHIP', STYLE_TITLE).setOrigin(0.5);
    this.add.text(CX, GAME_HEIGHT - 10, 'ESC — Back', STYLE).setOrigin(0.5);

    this._buildCards();
    this._renderSelection();
    this._setupKeys();
  }

  _buildCards() {
    const colW = GAME_WIDTH / 3;
    this._cards = SHIPS.map((ship, i) => {
      const x = colW * i + colW / 2;
      const locked = !this._unlocked.includes(ship.id);

      const sprite = this.add.image(x, 100, 'sheet', SHIP_FRAMES[ship.id])
        .setScale(2)
        .setAlpha(locked ? 0.25 : 1);

      const nameText = this.add.text(x, 140, ship.label, locked ? STYLE_LOCKED : STYLE)
        .setOrigin(0.5);

      const desc = locked
        ? `Unlock: clear Level ${ship.unlockCriteria?.levelCleared}`
        : ship.description;

      const descText = this.add.text(x, 152, desc, {
        fontFamily: '"Kenney Future", monospace',
        fontSize: '7px',
        color: locked ? '#444444' : '#aaaaaa',
        wordWrap: { width: colW - 8 },
        align: 'center',
      }).setOrigin(0.5, 0);

      return { sprite, nameText, descText, locked };
    });
  }

  _renderSelection() {
    this._cards.forEach(({ nameText, locked }, i) => {
      if (i === this._sel) {
        nameText.setStyle(STYLE_SELECTED);
      } else {
        nameText.setStyle(locked ? STYLE_LOCKED : STYLE);
      }
    });
  }

  _setupKeys() {
    this.input.keyboard.on('keydown-LEFT',  () => this._move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this._move(1));
    this.input.keyboard.on('keydown-A',     () => this._move(-1));
    this.input.keyboard.on('keydown-D',     () => this._move(1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
    this.input.keyboard.on('keydown-ESC',   () => this._back());
  }

  _move(dir) {
    // Walk in the requested direction, skipping locked ships.
    let next = Phaser.Math.Wrap(this._sel + dir, 0, SHIPS.length);
    let steps = 0;
    while (this._cards[next].locked && steps < SHIPS.length) {
      next = Phaser.Math.Wrap(next + dir, 0, SHIPS.length);
      steps++;
    }
    // Only move if we actually landed on an unlocked ship.
    if (!this._cards[next].locked && next !== this._sel) {
      this._sel = next;
      this.sound.play('sfx_menuSelect', { volume: this._getSfxVol() });
      this._renderSelection();
    }
  }

  _confirm() {
    const ship = SHIPS[this._sel];
    if (this._cards[this._sel].locked) {
      // Shake the locked ship to indicate it can't be selected
      this.tweens.add({
        targets: this._cards[this._sel].sprite,
        x: { from: this._cards[this._sel].sprite.x - 4, to: this._cards[this._sel].sprite.x + 4 },
        yoyo: true, repeat: 3, duration: 50,
      });
      return;
    }
    this.registry.set('selectedShip', ship.id);
    this.sound.play('sfx_menuConfirm', { volume: this._getSfxVol() });
    this.scene.start('Menu');
  }

  _back() {
    this.scene.start('Menu');
  }

  _getSfxVol() {
    const save = this.registry.get('save');
    return save?.settings?.sfxVolume ?? 0.8;
  }
}
