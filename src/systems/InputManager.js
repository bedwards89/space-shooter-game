// Phase 3: wraps Phaser cursors + WASD so game logic never reads keys directly.
export const InputManager = {
  _cursors: null,
  _wasd: null,
  _fire: null,
  _pause: null,

  init(scene) {
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this._fire = scene.input.keyboard.addKeys({ space: 'SPACE', j: 'J' });
    this._pause = scene.input.keyboard.addKeys({ p: 'P', esc: 'ESC' });
  },

  isUp() { return this._cursors?.up.isDown || this._wasd?.up.isDown; },
  isDown() { return this._cursors?.down.isDown || this._wasd?.down.isDown; },
  isLeft() { return this._cursors?.left.isDown || this._wasd?.left.isDown; },
  isRight() { return this._cursors?.right.isDown || this._wasd?.right.isDown; },
  isFire() { return this._fire?.space.isDown || this._fire?.j.isDown; },
  isPauseJustDown() {
    return Phaser.Input.Keyboard.JustDown(this._pause?.p) ||
           Phaser.Input.Keyboard.JustDown(this._pause?.esc);
  },
};
