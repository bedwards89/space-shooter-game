import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const CX = GAME_WIDTH / 2;
const STYLE = {
  fontFamily: '"Kenney Future", monospace',
  fontSize: '14px',
  color: '#ffffff',
};
const STYLE_SELECTED = { ...STYLE, color: '#ffdd00' };
const STYLE_TITLE = {
  fontFamily: '"Kenney Future", monospace',
  fontSize: '32px',
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

    // Parallax background
    this._bg = this.add.tileSprite(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_darkPurple');

    // Title
    this.add.text(CX, 55, 'STARWAKE', STYLE_TITLE).setOrigin(0.5);

    // Menu items
    const startY = 110;
    const gap = 22;
    this._texts = ITEMS.map((label, i) =>
      this.add.text(CX, startY + i * gap, label, STYLE).setOrigin(0.5)
    );

    // Reset confirm prompt (hidden until triggered)
    this._confirmText = this.add.text(CX, startY + 3 * gap + 18,
      'Are you sure? Press Enter again to confirm.', {
        fontFamily: '"Kenney Future", monospace',
        fontSize: '8px',
        color: '#ff4444',
      }
    ).setOrigin(0.5).setVisible(false);

    // Version / build stamp
    this.add.text(GAME_WIDTH - 4, GAME_HEIGHT - 4, 'v0.1', {
      fontFamily: '"Kenney Future", monospace',
      fontSize: '8px',
      color: '#444444',
    }).setOrigin(1, 1);

    this._renderSelection();
    this._setupKeys();

    // Play menu music — both listeners share a ref so whichever fires first
    // removes the other, preventing a second call on the same scene instance.
    this._music = null;
    this._unlockHandler = () => this._startMusic();
    this.input.once('pointerdown', this._unlockHandler);
    this.input.keyboard.once('keydown', this._unlockHandler);
  }

  update(time, delta) {
    this._bg.tilePositionX += (delta / 1000) * 20;
  }

  _startMusic() {
    // Cancel the sibling listener that didn't fire.
    this.input.off('pointerdown', this._unlockHandler);
    this.input.keyboard.off('keydown', this._unlockHandler);
    if (this._music?.isPlaying) return;
    this._music?.destroy();
    this._music = this.sound.add('music_menu', { loop: true, volume: this._getMusicVol() });
    this._music.play();
  }

  _getMusicVol() {
    const save = this.registry.get('save');
    return save?.settings?.musicVolume ?? 0.7;
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
    this._music?.destroy(); this._music = null;
    this.registry.set('currentLevel', 1);
    this.cameras.main.fade(300, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) this.scene.start('Game');
    });
  }

  _shipSelect() {
    this.sound.play('sfx_menuConfirm', { volume: this._getSfxVol() });
    this._music?.destroy(); this._music = null;
    this.scene.start('ShipSelect');
  }

  _credits() {
    this.sound.play('sfx_menuConfirm', { volume: this._getSfxVol() });
    this._music?.destroy(); this._music = null;
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
