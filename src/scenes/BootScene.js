import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load only what the preload progress bar needs (nothing for now — bar is drawn with graphics).
  }

  create() {
    this.scene.start('Preload');
  }
}
