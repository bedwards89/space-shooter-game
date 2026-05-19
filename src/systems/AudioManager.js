// Phase 8: wraps Phaser's sound system; handles music loops and volume.
export const AudioManager = {
  _scene: null,
  _music: null,
  _musicVolume: 0.7,
  _sfxVolume: 0.8,

  init(scene, settings) {
    this._scene = scene;
    this._musicVolume = settings.musicVolume ?? 0.7;
    this._sfxVolume = settings.sfxVolume ?? 0.8;
  },

  playMusic(key) {},
  stopMusic() {},
  playSfx(key) {},
  setMusicVolume(v) { this._musicVolume = v; },
  setSfxVolume(v) { this._sfxVolume = v; },
};
