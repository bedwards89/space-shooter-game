import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Minimal assets needed to show the preload progress bar go here.
    // Nothing yet — placeholder rectangle will suffice for Phase 0.
  }

  create() {
    // Phase 0 placeholder: draw a colored rectangle so we can confirm Phaser boots.
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, 200, 60, 0x1a1aff);
    this.add
      .text(cx, cy, 'STARWAKE', { fontSize: '20px', color: '#ffffff' })
      .setOrigin(0.5);

    // TODO Phase 2: transition to PreloadScene once assets exist.
    // this.scene.start('Preload');
  }
}
