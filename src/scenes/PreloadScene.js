import Phaser from 'phaser';

// Loads all sprite atlases, audio, and fonts. Shows a progress bar.
// Transitions to MenuScene when complete.
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Phase 1 assets will be loaded here.
  }

  create() {
    this.scene.start('Menu');
  }
}
