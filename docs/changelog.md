# Changelog

Completed work, newest first. Tasks move here from `todo.md` when done.

---

## 2026-05-19

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
