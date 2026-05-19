# Development

## Prerequisites

- Node.js LTS ≥ 20 (see `.nvmrc`)
- `npm` (bundled with Node)
- A GitHub account with access to the `bedwards89/space-shooter-game` repo

## Setup

```bash
git clone https://github.com/bedwards89/space-shooter-game.git
cd space-shooter-game
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server at `http://localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve `dist/` locally to verify the production build |
| `npm test` | Run Vitest unit tests |

## Deploy

Push to `main` → GitHub Actions runs `.github/workflows/deploy.yml` → deploys `dist/` to GitHub Pages.

Live URL: `https://bedwards89.github.io/space-shooter-game/`

## Project Structure

See `docs/architecture.md` for the full scene graph and data flow.

Key files:

- `src/config.js` — all tuning constants. Edit here, not inside entity files.
- `src/data/` — static design data (levels, ships, enemies). No logic here.
- `public/assets/ATTRIBUTIONS.md` — every asset must be listed here before merging.
- `docs/todo.md` — current task list.
- `docs/changelog.md` — completed work log.
- `DECISIONS.md` — log any deviations from the project plan here.

## Testing

Unit tests live in `tests/unit/`. Each test file has a top-level comment explaining coverage.

Game-feel testing uses `tests/manual/playtest-checklist.md` — run through this before any release.

```bash
npm test              # run unit tests
npm test -- --watch   # watch mode during TDD
```
