# STARWAKE — Todo

Tasks are removed when complete. Completed work lives in `changelog.md`.

---

## Phase 3 — Player & Combat

- [ ] Implement Player entity: arcade physics, movement (arrows + WASD), bounds clamping
- [ ] Implement primary fire with bullet pool (Space + J)
- [ ] Normalize diagonal movement (no speed boost on diagonals)
- [ ] Implement 3 lives, death animation, 2s i-frames on respawn
- [ ] Per-ship stats consumed from `data/ships.js`
- [ ] Tuning pass: movement and fire rate feel good

## Phase 4 — Enemies & Levels

- [ ] Implement Enemy base class with pool-friendly `reset()`
- [ ] Implement 4 enemy archetypes: SMALL, MEDIUM, LARGE, TURRET
- [ ] Implement boss class (one per level)
- [ ] Implement wave spawn system reading from `data/levels.js`
- [ ] Implement collision: player bullet → enemy, enemy/bullet → player, player → power-up hook
- [ ] Implement level transitions + "Level Complete" interstitial
- [ ] Implement "You Win" flow after Level 3
- [ ] Playtest each level start-to-finish

## Phase 5 — Power-Ups

- [ ] Implement PowerUp entity: Spread Shot, Shield, Rapid Fire
- [ ] Drop logic: ~10% from MEDIUM/LARGE; guarantee one in first 30s of Level 1
- [ ] HUD timer bars for time-limited power-ups
- [ ] Stacking rules: same type refreshes, different types stack
- [ ] Debug/cheat key for manual triggering (document in `DECISIONS.md`, strip before release)

## Phase 6 — Score System

- [ ] Implement `ScoreSystem.add()`, `recordKill()`, `decayCheck()`
- [ ] Wire combo multiplier to kill detection in GameScene
- [ ] HUD: live score, combo count, multiplier display
- [ ] GameOverScene: "NEW HIGH SCORE!" flourish when applicable
- [ ] Write unit tests for ScoreSystem

## Phase 7 — Save System

- [ ] Implement `SaveSystem.load()` / `save()` / `reset()` / `migrate()`
- [ ] Auto-save on level clear, game over, settings change
- [ ] "Reset Save" menu option with confirmation
- [ ] Handle: corrupted JSON, missing keys, localStorage disabled, quota exceeded
- [ ] Write unit tests for SaveSystem (all edge cases)

## Phase 8 — Audio

- [ ] Implement `AudioManager.playMusic()` / `stopMusic()` / `playSfx()`
- [ ] Assign SFX to all game events
- [ ] Music volume and SFX volume sliders in settings menu
- [ ] Audio context unlock on first user interaction
- [ ] Test: no gap on loop, no clipping at max volume

## Phase 9 — UI / UX Polish

- [ ] Animated title screen / starfield
- [ ] Consistent pixel font across all UI
- [ ] Full HUD: score, lives icons, combo, power-up timers, level name
- [ ] Pause overlay dim
- [ ] Credits scene with all CC-BY attributions
- [ ] Scene fade transitions (200–400 ms)

## Phase 10 — Game Feel & Polish

- [ ] Explosion particles, engine trails, power-up sparkles
- [ ] Screen shake (player hit, boss damage, boss death)
- [ ] Enemy hit flash (white)
- [ ] Boss intro: pause, name banner, music change
- [ ] Stress test: ≥ 55 fps with 50 enemies + 150 bullets on screen

## Phase 11 — QA

- [ ] Write / finalize `tests/manual/playtest-checklist.md`
- [ ] Full playtest by second person
- [ ] Browser matrix: Chrome, Firefox, Safari, Edge
- [ ] All P0/P1 bugs fixed

## Phase 12 — Deploy

- [ ] `npm run build` + `npm run preview` clean
- [ ] GitHub Actions deploy green
- [ ] README with instructions, live URL, screenshots
- [ ] Tag `v1.0.0`

---

## Stretch / Future (do not start before v1.0 ships)

- Gamepad support
- Mobile / touch controls
- Online leaderboards
- Additional levels (4+)
- Additional ships (4+)
- Procedural level generation
