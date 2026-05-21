import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { version } from '../../package.json';

const CX = GAME_WIDTH / 2;
const STYLE = {
  fontFamily: '"Kenney Future", monospace',
  fontSize: '24px',
  color: '#ffffff',
};
const STYLE_SELECTED = { ...STYLE, color: '#ffdd00' };
const STYLE_TITLE = {
  fontFamily: '"Kenney Future", monospace',
  fontSize: '64px',
  color: '#ffffff',
};

const ITEMS = ['Start Game', 'Ship Select', 'Credits', 'Reset Save'];

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this._sel = 0;
    this._confirming = false;

    this.cameras.main.fadeIn(250);

    // Parallax background
    this._bg = this.add.tileSprite(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_darkPurple');

    // Animated starfield — particles drift right-to-left at varying speeds and scales
    this.add.particles(GAME_WIDTH + 30, GAME_HEIGHT / 2, 'sheet', {
      frame: ['star1.png', 'star2.png', 'star3.png'],
      x:      { min: -30, max: 30 },
      y:      { min: -GAME_HEIGHT / 2, max: GAME_HEIGHT / 2 },
      lifespan:  9000,
      speedX:    { min: -240, max: -50 },
      speedY:    { min: -10,  max: 10  },
      scale:     { min: 0.12, max: 0.5 },
      alpha:     { start: 1.0, end: 0   },
      blendMode: 'ADD',
      frequency: 60,
      quantity:  1,
    }).setDepth(0);

    // Title
    this.add.text(CX, 160, 'STARWAKE', STYLE_TITLE).setOrigin(0.5);

    // Menu items
    const startY = 300;
    const gap = 52;
    this._texts = ITEMS.map((label, i) =>
      this.add.text(CX, startY + i * gap, label, STYLE).setOrigin(0.5)
    );

    // Reset confirm prompt (hidden until triggered)
    this._confirmText = this.add.text(CX, startY + 3 * gap + 36,
      'Are you sure? Press Enter again to confirm.', {
        fontFamily: '"Kenney Future", monospace',
        fontSize: '14px',
        color: '#ff4444',
      }
    ).setOrigin(0.5).setVisible(false);

    // Version / build stamp
    this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, `v${version}`, {
      fontFamily: '"Kenney Future", monospace',
      fontSize: '12px',
      color: '#444444',
    }).setOrigin(1, 1);

    this._renderSelection();
    this._setupKeys();

    // Start menu music on first user interaction (audio context unlock).
    // Both listeners share a ref; whichever fires first removes the other.
    this._unlockHandler = () => {
      this.input.off('pointerdown', this._unlockHandler);
      this.input.keyboard.off('keydown', this._unlockHandler);
      AudioManager.playMusic('music_menu');
    };
    this.input.once('pointerdown', this._unlockHandler);
    this.input.keyboard.once('keydown', this._unlockHandler);
  }

  update(time, delta) {
    this._bg.tilePositionX += (delta / 1000) * 20;
  }

  _setupKeys() {
    this.input.keyboard.on('keydown-UP',    () => this._move(-1));
    this.input.keyboard.on('keydown-DOWN',  () => this._move(1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
  }

  _move(dir) {
    if (this._confirming) { this._cancelConfirm(); return; }
    this._sel = Phaser.Math.Wrap(this._sel + dir, 0, ITEMS.length);
    this.sound.play('sfx_menuSelect', { volume: this._getSfxVol() });
    this._renderSelection();
  }

  _confirm() {
    const actions = [
      () => this._startGame(),
      () => this._shipSelect(),
      () => this._credits(),
      () => this._resetSave(),
    ];
    actions[this._sel]();
  }

  _startGame() {
    this.sound.play('sfx_menuConfirm', { volume: this._getSfxVol() });
    AudioManager.stopMusic();
    this.registry.set('currentLevel', 1);
    this.cameras.main.fade(300, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) this.scene.start('Game');
    });
  }

  _shipSelect() {
    this.sound.play('sfx_menuConfirm', { volume: this._getSfxVol() });
    this.scene.start('ShipSelect');
  }

  _credits() {
    this.sound.play('sfx_menuConfirm', { volume: this._getSfxVol() });
    this.scene.start('Credits');
  }

  _resetSave() {
    if (!this._confirming) {
      this._confirming = true;
      this._confirmText.setVisible(true);
      this.sound.play('sfx_menuSelect', { volume: this._getSfxVol() });
    } else {
      const fresh = SaveSystem.reset();
      this.registry.set('save', fresh);
      this.registry.set('selectedShip', 'Comet');
      this._cancelConfirm();
      // Flash the Reset Save text to confirm
      this.tweens.add({
        targets: this._texts[3],
        alpha: { from: 1, to: 0 },
        yoyo: true,
        repeat: 3,
        duration: 100,
      });
    }
  }

  _cancelConfirm() {
    this._confirming = false;
    this._confirmText.setVisible(false);
    this._renderSelection();
  }

  _renderSelection() {
    this._texts.forEach((t, i) => {
      Object.assign(t.style, i === this._sel ? STYLE_SELECTED : STYLE);
      t.setStyle(i === this._sel ? STYLE_SELECTED : STYLE);
    });
  }

  _getSfxVol() {
    const save = this.registry.get('save');
    return save?.settings?.sfxVolume ?? 0.8;
  }
}
