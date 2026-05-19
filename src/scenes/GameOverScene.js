import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;
const STYLE = { fontFamily: '"Kenney Future", monospace', fontSize: '12px', color: '#ffffff' };
const STYLE_SEL = { ...STYLE, color: '#ffdd00' };
const STYLE_TITLE = { fontFamily: '"Kenney Future", monospace', fontSize: '24px', color: '#ff4444' };
const STYLE_SCORE = { fontFamily: '"Kenney Future", monospace', fontSize: '14px', color: '#ffffff' };
const STYLE_HI = { fontFamily: '"Kenney Future", monospace', fontSize: '11px', color: '#ffdd00' };

const ITEMS = ['Retry', 'Main Menu'];

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  // Data passed from GameScene: { score, ship, won }
  init(data) {
    this._finalScore = data.score ?? 0;
    this._ship = data.ship ?? 'Comet';
    this._won = data.won ?? false;
  }

  create() {
    this._sel = 0;

    // Background
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0x000011);

    // Title
    const titleText = this._won ? 'YOU WIN!' : 'GAME OVER';
    const titleColor = this._won ? '#44ff44' : '#ff4444';
    this.add.text(CX, 50, titleText, { ...STYLE_TITLE, color: titleColor }).setOrigin(0.5);

    // Score
    this.add.text(CX, 85, `SCORE  ${this._finalScore}`, STYLE_SCORE).setOrigin(0.5);

    // High score handling
    const save = this._saveScore();
    const isNewHigh = save.highScores[0]?.score === this._finalScore && this._finalScore > 0;
    if (isNewHigh) {
      this.add.text(CX, 100, 'NEW HIGH SCORE!', STYLE_HI).setOrigin(0.5);
    }

    // Top 5 leaderboard
    this._buildLeaderboard(save.highScores, 115);

    // Menu items
    this._texts = ITEMS.map((label, i) =>
      this.add.text(CX, 210 + i * 22, label, STYLE).setOrigin(0.5)
    );
    this._renderSelection();
    this._setupKeys();
  }

  _saveScore() {
    const save = this.registry.get('save') ?? SaveSystem.load();
    if (this._finalScore > 0) {
      save.highScores.push({
        score: this._finalScore,
        ship: this._ship,
        date: new Date().toISOString().slice(0, 10),
      });
      save.highScores.sort((a, b) => b.score - a.score);
      save.highScores = save.highScores.slice(0, 5);
      save.totalRunsPlayed = (save.totalRunsPlayed ?? 0) + 1;
      SaveSystem.save(save);
      this.registry.set('save', save);
    }
    return save;
  }

  _buildLeaderboard(scores, startY) {
    this.add.text(CX, startY, 'HIGH SCORES', {
      fontFamily: '"Kenney Future", monospace', fontSize: '9px', color: '#888888',
    }).setOrigin(0.5);

    if (scores.length === 0) {
      this.add.text(CX, startY + 14, 'No scores yet', {
        fontFamily: '"Kenney Future", monospace', fontSize: '9px', color: '#444444',
      }).setOrigin(0.5);
      return;
    }

    scores.slice(0, 5).forEach((entry, i) => {
      this.add.text(CX, startY + 14 + i * 12,
        `${i + 1}.  ${String(entry.score).padStart(7)}   ${entry.ship}`, {
          fontFamily: '"Kenney Future", monospace', fontSize: '9px', color: '#cccccc',
        }
      ).setOrigin(0.5);
    });
  }

  _setupKeys() {
    this.input.keyboard.on('keydown-UP',    () => this._move(-1));
    this.input.keyboard.on('keydown-DOWN',  () => this._move(1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
  }

  _move(dir) {
    this._sel = Phaser.Math.Wrap(this._sel + dir, 0, ITEMS.length);
    this._renderSelection();
  }

  _confirm() {
    if (this._sel === 0) {
      this.scene.start('Game');
    } else {
      this.scene.start('Menu');
    }
  }

  _renderSelection() {
    this._texts.forEach((t, i) => t.setStyle(i === this._sel ? STYLE_SEL : STYLE));
  }
}
