# Changelog

Completed work, newest first. Tasks move here from `todo.md` when done.

---

## 2026-05-19

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
