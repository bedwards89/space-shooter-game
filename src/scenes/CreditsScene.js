import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { AudioManager } from '../systems/AudioManager.js';

const CX = GAME_WIDTH / 2;
const STYLE = { fontFamily: '"Kenney Future", monospace', fontSize: '16px', color: '#aaaaaa' };
const STYLE_HEAD = { fontFamily: '"Kenney Future", monospace', fontSize: '20px', color: '#ffffff' };
const STYLE_TITLE = { fontFamily: '"Kenney Future", monospace', fontSize: '40px', color: '#ffffff' };

// All CC-BY attributions from ATTRIBUTIONS.md (CC0 assets listed for completeness).
const CREDITS = [
  { heading: 'SPRITES' },
  { text: 'Space Shooter Redux' },
  { text: 'Space Shooter Extension' },
  { text: 'Kenney · kenney.nl · CC0' },
  { heading: '' },
  { heading: 'SOUND EFFECTS' },
  { text: 'Sci-Fi Sounds · Kenney · kenney.nl · CC0' },
  { heading: '' },
  { heading: 'MUSIC' },
  { text: '"Title Screen" · Juhani Junkala · CC0' },
  { text: '"Level 1" · Juhani Junkala · CC0' },
  { text: '"Level 2" · Juhani Junkala · CC0' },
  { text: '"Boss Fight" · Juhani Junkala · CC0' },
  { heading: '' },
  { heading: 'FONTS' },
  { text: 'Kenney Future · Kenney Pixel · kenney.nl · CC0' },
  { heading: '' },
  { heading: 'ENGINE' },
  { text: 'Phaser 3 · photonstorm.com · MIT' },
];

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create() {
    AudioManager.playMusic('music_menu');

    this.add.tileSprite(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_black');

    this.add.text(CX, 40, 'CREDITS', STYLE_TITLE).setOrigin(0.5);

    let y = 100;
    for (const entry of CREDITS) {
      if (entry.heading !== undefined) {
        if (entry.heading) {
          this.add.text(CX, y, entry.heading, STYLE_HEAD).setOrigin(0.5);
          y += 26;
        } else {
          y += 12;
        }
      } else {
        this.add.text(CX, y, entry.text, STYLE).setOrigin(0.5);
        y += 22;
      }
    }

    this.add.text(CX, GAME_HEIGHT - 20, 'ESC or ENTER — Back', STYLE).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC',   () => this.scene.start('Menu'));
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Menu'));
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('Menu'));
  }
}
