# Changelog

Completed work, newest first. Tasks move here from `todo.md` when done.

---

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
