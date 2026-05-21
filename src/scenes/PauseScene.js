import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AudioManager } from '../systems/AudioManager.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;
const STYLE     = { fontFamily: '"Kenney Future", monospace', fontSize: '24px', color: '#ffffff' };
const STYLE_SEL = { ...STYLE, color: '#ffdd00' };
const STYLE_DIM = { ...STYLE, color: '#888888' };
const STYLE_TITLE = { fontFamily: '"Kenney Future", monospace', fontSize: '48px', color: '#ffffff' };

// type 'action': navigate with UP/DOWN, activate with ENTER/SPACE
// type 'volume': LEFT/RIGHT to adjust; getVol/setVol wired to AudioManager
const ITEMS = [
  { label: 'Resume',       type: 'action' },
  { label: 'Music Vol',    type: 'volume', get: () => AudioManager.getMusicVol(), set: (v) => AudioManager.setMusicVolume(v), key: 'musicVolume' },
  { label: 'SFX Vol',      type: 'volume', get: () => AudioManager.getSfxVol(),   set: (v) => AudioManager.setSfxVolume(v),   key: 'sfxVolume'   },
  { label: 'Quit to Menu', type: 'action' },
];

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    this._sel = 0;

    // Semi-transparent overlay
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);

    this.add.text(CX, CY - 160, 'PAUSED', STYLE_TITLE).setOrigin(0.5);

    this._texts = ITEMS.map((item, i) =>
      this.add.text(CX, CY - 50 + i * 60, this._itemLabel(item, false), STYLE).setOrigin(0.5)
    );

    this._renderSelection();
    this._setupKeys();
  }

  _itemLabel(item, selected) {
    if (item.type !== 'volume') return item.label;
    const pct = Math.round(item.get() * 100);
    return selected
      ? `${item.label}   < ${pct}% >`
      : `${item.label}   ${pct}%`;
  }

  _setupKeys() {
    this.input.keyboard.on('keydown-UP',    () => this._move(-1));
    this.input.keyboard.on('keydown-DOWN',  () => this._move(1));
    this.input.keyboard.on('keydown-LEFT',  () => this._adjustVolume(-0.1));
    this.input.keyboard.on('keydown-RIGHT', () => this._adjustVolume(0.1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
    this.input.keyboard.on('keydown-P',     () => this._resume());
    this.input.keyboard.on('keydown-ESC',   () => this._resume());
  }

  _move(dir) {
    this._sel = Phaser.Math.Wrap(this._sel + dir, 0, ITEMS.length);
    this._renderSelection();
  }

  _adjustVolume(delta) {
    const item = ITEMS[this._sel];
    if (item.type !== 'volume') return;
    item.set(item.get() + delta);
    this._persistVolumes();
    this._renderSelection();
  }

  _persistVolumes() {
    const save = this.registry.get('save');
    if (!save) return;
    save.settings.musicVolume = AudioManager.getMusicVol();
    save.settings.sfxVolume   = AudioManager.getSfxVol();
    SaveSystem.save(save);
    this.registry.set('save', save);
  }

  _confirm() {
    if (this._sel === 0) this._resume();
    else if (this._sel === ITEMS.length - 1) this._quitToMenu();
  }

  _resume() {
    this.scene.resume('Game');
    this.scene.stop();
  }

  _quitToMenu() {
    AudioManager.stopMusic();
    this.scene.stop('HUD');
    this.scene.stop('Game');
    this.scene.stop();
    this.scene.start('Menu');
  }

  _renderSelection() {
    this._texts.forEach((t, i) => {
      const item = ITEMS[i];
      const selected = i === this._sel;
      t.setText(this._itemLabel(item, selected));
      t.setStyle(item.type === 'volume' && !selected ? STYLE_DIM : (selected ? STYLE_SEL : STYLE));
    });
  }
}
