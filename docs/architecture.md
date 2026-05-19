# Architecture

## Scene Graph

```
Boot → Preload → Menu
Menu → ShipSelect → (back to Menu)
Menu → Game (+ HUD in parallel)
Game → Pause (overlay)
Game → GameOver
Game → LevelComplete interstitial → Game (next level)
Game (after Level 3 win) → GameOver
GameOver → Menu | Game (retry)
Menu → Credits
```

## Save Schema (v1)

```json
{
  "schemaVersion": 1,
  "highScores": [
    { "score": 12500, "ship": "Comet", "date": "2026-05-19" }
  ],
  "unlockedShips": ["Comet"],
  "highestLevelCleared": 0,
  "totalRunsPlayed": 0,
  "settings": {
    "musicVolume": 0.7,
    "sfxVolume": 0.8
  }
}
```

Storage key: `starwake-save-v1` in `localStorage`.
Schema changes require: version bump + migration function in `SaveSystem.migrate()` + migration test.

## Pooling Strategy

All runtime-spawned objects use Phaser `Group` with `createMultiple()`. Objects are activated/deactivated via `setActive()`/`setVisible()` — never `new` inside `update()`.

| Pool | Managed in |
|------|-----------|
| Player bullets | `GameScene` |
| Enemy bullets | `GameScene` |
| Enemies | `GameScene` |
| Power-ups | `GameScene` |
| Explosions | `GameScene` |

## Key Design Decisions

- **480×270 internal resolution** — scales cleanly to 1920×1080 (×4) and 1280×720 (×2.67). `pixelArt: true` prevents blurring.
- **HUDScene runs parallel to GameScene** — avoids polluting GameScene with UI code. Communicates via Phaser scene events.
- **Flat JS, no TypeScript** — lower handoff friction. Revisit after v1.
- **`localStorage` for persistence** — no backend, no auth, sufficient for top-5 scores + unlocks.
- **Data-driven levels** — `data/levels.js` timelines allow QA to tune difficulty without touching game logic.
