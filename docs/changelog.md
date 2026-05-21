# Changelog

Completed work, newest first. Tasks move here from `todo.md` when done.

---

## 2026-05-21

### Phase 9 — UI / UX Polish

- `MenuScene`: animated particle starfield — stars drift right-to-left at varying speeds and scales using the `sheet` atlas star frames; blended with ADD for a glow effect. `cameras.main.fadeIn(250)` on every create().
- `HUDScene`: level name text added to top-center (e.g. "LEVEL 1 — Asteroid Belt") in a dimmed small font. `GameScene` sets `levelNum` and `levelName` in the registry before launching HUD.
- Scene fade transitions — 250–300 ms fade-out before all scene changes, fade-in on arrival:
  - `GameScene._onLevelComplete()`: camera fades to black before `scene.restart()` (level progression) or `scene.start('GameOver')` (final win). Total elapsed time matches previous 2 s banner duration.
  - `GameOverScene`: fades in on create; fades out before scene.start on confirm.
  - `ShipSelectScene`: fades in on create; `_transitioning` guard + fade-out on confirm and back.
  - `CreditsScene`: fades in on create; `_transitioning` guard + fade-out on back.
- Remaining Phase 9 items already complete from earlier phases: consistent Kenney Future font, pause overlay dim, credits scene with CC-BY attributions, full HUD (score/lives/combo/power-up timers). Asset replacement deferred (see memory note).

### Phase 8 — Audio

- `AudioManager`: implemented `playMusic(key)` (looped, deduped), `stopMusic()`, `setMusicVolume(v)` (live update on active track), `setSfxVolume(v)`. Stores the game-level sound manager (`scene.sound`) so it works across all scenes without requiring re-init.
- `PreloadScene`: calls `AudioManager.init(this, save.settings)` after loading save, so volume settings are applied from the start.
- `MenuScene`: replaced inline music object with `AudioManager.playMusic('music_menu')` called from the existing audio-context unlock handler. Removed `_startMusic()` / `_getMusicVol()`. Music continues seamlessly into ShipSelect and Credits.
- `ShipSelectScene` / `CreditsScene`: call `AudioManager.playMusic('music_menu')` in `create()` — no-op if already playing, starts it if first interaction happened earlier.
- `GameScene`: plays `music_level1` on levels 1+, `music_level2` on levels 2+; switches to `music_boss` when a BOSS wave spawns. Calls `AudioManager.stopMusic()` on player death and on final level win. Added `sfx_enemyShoot` (plays on every enemy fire burst at 45% SFX vol). Switched boss kill from `sfx_explosionLarge` to `sfx_bossDeath`.
- `PauseScene`: added Music Vol and SFX Vol slider items (LEFT/RIGHT to adjust in 10% steps, persisted to save on each change). Calls `AudioManager.stopMusic()` before quitting to menu.

### Phase 7 — Save System

- `SaveSystem`: rewrote with `_repair()` for field-by-field validation and defaults. `_num()` helper rejects non-finite numbers. `_validScoreEntry()` validates score entries. `migrate()` always calls `_repair()` last so any future migration step can't leave gaps. `reset()` now guards `localStorage.removeItem()` in try/catch for storage-disabled environments.
- Fixes: shallow `{...DEFAULT, ...data}` spread silently dropped nested `settings` keys (e.g. missing `sfxVolume`); now each nested field is explicitly validated and defaulted.
- Tests: 18 SaveSystem tests covering load defaults, corrupted JSON, `localStorage` disabled (getItem throws), quota exceeded (setItem throws), partial settings, invalid score entries, score trimming to 5, invalid `unlockedShips`, non-finite numerics, save/load roundtrip, reset with storage disabled, and v0 migration. Total: 97 tests passing.

## 2026-05-22

### Bug Fix — Retry freeze

- `HUDScene`: registry listeners (`changedata-score/lives/combo/powerupShield`) were attached to `this.registry.events` (game-level emitter) and survived `scene.stop()`. On retry, stale listeners fired into a stopped scene during `GameScene.create()`, breaking scene initialisation before `InputManager.init()` could run. Fixed by storing callback refs and removing them via `this.events.once('shutdown', ...)`.
- `GameOverScene`: added `_confirmed` guard to prevent double `scene.start()` if SPACE and ENTER fire in the same frame.

### Phase 6 — Score System

- `ScoreSystem.recordKill(now)`: fixed combo window gap — resets streak to 0 before incrementing if `_multiplier === 1 && gap > comboWindow`, so kills spread across multiple windows can't accumulate into a multiplier.
- `GameScene`: imports and calls `ScoreSystem.reset()` in `create()`; `_onBulletHitEnemy` calls `ScoreSystem.recordKill()` + `ScoreSystem.add()` and pushes updated score + multiplier to registry; `_onPlayerCollectPowerup` routes power-up points through `ScoreSystem.add()` (benefits from active multiplier); `update()` calls `ScoreSystem.decayCheck(time)` each frame and pushes multiplier to registry when it changes.
- `HUDScene`: combo text changed from yellow "x2 COMBO" to orange "x2 MULTI"; only shown when multiplier is active (registry `combo > 1`).
- `GameOverScene`: "NEW HIGH SCORE!" check now captures `prevTop` before saving so tied scores don't falsely trigger the banner; added a continuous scale-pulse tween (×1.2, 350 ms, sine ease) on the banner text.
- 7 new ScoreSystem tests (window reset, streak breakage, mid-multiplier kill, decay guards). Total: 84 tests passing.

## 2026-05-21

### Phase 5 — Power-Ups

- `src/data/powerups.js`: three type definitions (SPREAD/RAPID/SHIELD) with atlas frame names, labels, and timed flag. Distinct shape + colour per accessibility rules: blue star, green bolt, blue shield.
- `PowerUp` entity: pool-friendly (`reset(x, y, typeId)`), auto-despawns via `delayedCall` after `POWERUP.onScreenLifetime`, `collect()` cancels timer and returns typeId.
- `Player`: tracks `_spreadEnds`, `_rapidEnds`, `_shielded`. `applyPowerup(typeId)` sets state + registry. `_handleFire` respects rapid rate and emits 3 angled `fire` events for spread. Shield absorbs one hit, plays `sfx_shieldBreak`, applies i-frames; blue tint while active. Separate `shoot` event keeps sound playing once per fire action regardless of bullet count.
- `GameScene`: player bullet pool bumped to 48 (covers rapid + spread); 6-slot PowerUp pool; `physics.add.overlap` for player↔powerups; `_tryDropPowerup` with guaranteed first drop in Level 1's first 30 s; `_firePlayerBullet` accepts `angleDeg` for angled spread bullets; registry initialises `powerupSpreadEnds`, `powerupRapidEnds`, `powerupShield` on create.
- `HUDScene`: `update(time)` drives two draining timer bars (SPR blue, RPD green) in the bottom-left; shield indicator text bottom-right; registry listener for shield toggle.
- 6 new data-validator tests for `powerups.js`. Total: 77 tests passing.

## 2026-05-20

### Phase 4 — Enemies & Levels

- Reconciled data files: `enemies.js` now maps each archetype to real atlas frame names with `scale` and `hitboxScale`; `levels.js` replaces phantom background/boss-sprite keys with preloaded assets; `config.js` gains `ENEMY` constants (bullet speed, stop positions, boss oscillation).
- Implemented `Enemy` entity: pool-friendly (`reset(typeId, overrides)`), four movement strategies (straight, sine, turret, boss oscillate), hit-flash tween with active guard, fires via `emit('fire')` for GameScene to pool-dispatch.
- `Bullet` updated to accept optional `frame` param — enemy bullets reuse the same class with `laserRed01.png`.
- Created `SpawnSystem`: pure (no Phaser), advances a sorted timeline by elapsed ms, returns entries due each tick, exposes `isDone`. Formation helpers (`getSpawnPositions`) return Y arrays for line, V, random, and single layouts.
- Overhauled `GameScene`: three separate object pools (player bullets ×20, enemy bullets ×16, enemies by type); arcade-physics overlaps for all collision pairs; `SpawnSystem` driven by frame delta; level-complete detection (spawner done + no active enemies); "LEVEL COMPLETE" banner → `scene.restart()` for levels 1–2; win path to `GameOver(won:true)` after Level 3; ship-unlock persistence on level clear.
- `PreloadScene` seeds `currentLevel: 1` in registry; `MenuScene._startGame` resets it to 1; `GameOverScene` retry resets to 1.
- Added 57 unit tests across `SpawnSystem.test.js` (timing, single-fire, isDone, reset, formations) and `dataValidators.test.js` (levels.js shape, background keys, timeline sort, enemies.js fields). Total: 71 tests, all passing.

## 2026-05-19

### Phase 3 — Player & Combat

- Implemented `Bullet` entity: pool-friendly arcade sprite, rotated -90° (vertical atlas frame → horizontal beam), auto-deactivates off-screen via `disableBody`.
- Implemented `Player` entity: arcade physics, scale ×2, hitbox set to `hitboxScale` fraction of the frame (per ship data), world-bounds clamping. Diagonal movement normalised to `Math.SQRT1_2`.
- Fire: event-driven (`'fire'` → GameScene pulls from pool); rate limited by `ship.fireRate`; plays `sfx_shoot`.
- Lives: 3 per run; hit() triggers 2 s of i-frames (alpha flicker tween); death emits `'died'`.
- GameScene refactored: physics world bounds set; 20-bullet pre-created pool (zero runtime allocations); registry drives HUD (score/lives/combo); death → 1.2 s delay → GameOverScene.
- InputManager wired as singleton; Pause now uses `InputManager.isPauseJustDown()`.
- Per-ship speed and fire rate visible immediately on ship switch.

### Phase 2 — Core Scene Architecture

- Implemented full scene graph: Boot → Preload → Menu → (ShipSelect | Credits | Game → Pause → GameOver).
- PreloadScene: loads all atlases, backgrounds, SFX, music, and fonts with a progress bar. Seeds game registry with save data on complete.
- MenuScene: scrolling parallax background, keyboard navigation (↑↓ + Enter/Space), audio unlock on first keypress, Reset Save with confirmation flash.
- ShipSelectScene: 3 ship cards with sprites (←→/AD to navigate); locked ships shown greyed out with unlock criteria; shake feedback on locked selection.
- GameScene: 3-layer parallax scrolling background (20/45/90 px/s); static player ship for Phase 2; launches HUDScene in parallel; P/Esc opens PauseScene.
- HUDScene: score text + life icons, wired to registry events (ready for Phase 3/6).
- PauseScene: translucent overlay, Resume/Quit to Menu, P/Esc also resumes.
- GameOverScene: win/lose title, final score, top-5 leaderboard, saves score to SaveSystem, Retry/Main Menu.
- CreditsScene: full CC attribution list, ESC/Enter/Space returns to Menu.
- Updated docs/todo.md and docs/changelog.md.

### Phase 1 — Asset Pipeline & Licensing

- Downloaded Kenney Space Shooter Redux (CC0) — main sprite atlas `sheet.png/xml` plus 4 tileable backgrounds.
- Downloaded Kenney Space Shooter Extension (CC0) — second sprite atlas `sheet2.png/xml` with additional ships, meteors, effects.
- Downloaded Kenney Sci-Fi Sounds (CC0) — 12 SFX mapped to game events (shoot, hit, explosion, shield, power-up, menu, level complete, boss death).
- Downloaded Kenney Fonts (CC0) — Kenney Future and Kenney Pixel TTFs.
- Sourced 4 music tracks (CC0, Juhani Junkala via OpenGameArt): Title Screen, Level 1, Level 2, Boss Fight. Converted WAVs to MP3 via ffmpeg (~1–2 MB each).
- Populated `public/assets/ATTRIBUTIONS.md` with every asset entry (source URL, author, license).
- Wrote `tests/unit/assetManifest.test.js` — bidirectional check: every disk file is in ATTRIBUTIONS.md and vice versa.
- Music note: chiptune/retro-electronic style (Pixabay blocked, FreePD offline). Flagged for swap in Phase 8 if lo-fi feel is preferred.

### Phase 0 — Foundation

- Initialized git repository with `main` branch.
- Created npm project with Phaser (latest), Vite, and Vitest.
- Scaffolded full `src/` tree: `scenes/`, `entities/`, `systems/`, `data/`.
- Created `src/main.js` — Phaser game config with 480×270 resolution, `pixelArt: true`, `Scale.FIT`.
- Created `src/config.js` — all tuning constants (player speed, fire rate, score values, power-up durations).
- Created stub files for all 9 scenes, 5 entities, 4 systems, and 3 data files.
- Created `public/assets/` directory tree: `sprites/`, `audio/sfx/`, `audio/music/`, `fonts/`.
- Created `public/assets/ATTRIBUTIONS.md` stub.
- Created `docs/` living documentation: `todo.md`, `changelog.md`, `architecture.md`, `development.md`, `accessibility.md`.
- Created `.github/workflows/deploy.yml` — GitHub Actions deploy to GitHub Pages on push to `main`.
- Created `vite.config.js` with `base: '/space-shooter-game/'`.
- Created `index.html` — minimal SPA shell.
- Created GitHub repo `bedwards89/space-shooter-game` and pushed initial commit.
