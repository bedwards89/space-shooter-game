// Wraps Phaser's global sound manager. _sound is game.sound — same reference in every scene.
export const AudioManager = {
  _sound: null,
  _music: null,
  _musicVolume: 0.7,
  _sfxVolume: 0.8,

  init(scene, settings) {
    this._sound        = scene.sound;
    this._musicVolume  = settings?.musicVolume ?? 0.7;
    this._sfxVolume    = settings?.sfxVolume   ?? 0.8;
  },

  playMusic(key) {
    if (this._music?.key === key && this._music.isPlaying) return;
    this.stopMusic();
    this._music = this._sound.add(key, { loop: true, volume: this._musicVolume });
    this._music.play();
  },

  stopMusic() {
    if (!this._music) return;
    this._music.stop();
    this._music.destroy();
    this._music = null;
  },

  setMusicVolume(v) {
    this._musicVolume = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
    if (this._music) this._music.setVolume(this._musicVolume);
  },

  setSfxVolume(v) {
    this._sfxVolume = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
  },

  getMusicVol() { return this._musicVolume; },
  getSfxVol()   { return this._sfxVolume; },
};
