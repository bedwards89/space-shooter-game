import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Phase 2+: scrolling parallax background, player, enemies, level timeline.
    this.scene.launch('HUD');
  }

  update() {}
}
