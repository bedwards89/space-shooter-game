# STARWAKE — Todo

Tasks are removed when complete. Completed work lives in `changelog.md`.

---

## Phase 4 — Enemies & Levels

- [ ] Playtest each level start-to-finish (manual)

## Phase 5 — Power-Ups

- [ ] Playtest power-up drops, stacking, and HUD bars (manual)

## Phase 9 — UI / UX Polish

- [ ] Animated title screen / starfield
- [ ] Consistent pixel font across all UI
- [ ] Full HUD: score, lives icons, combo, power-up timers, level name
- [ ] Pause overlay dim
- [ ] Credits scene with all CC-BY attributions
- [ ] Scene fade transitions (200–400 ms)
- [ ] Consider replacing Kenney sprite sheet with higher-resolution or vector-style assets for smoother look at 1280×720 (current assets are ~100px pixel art, bilinear filtering only goes so far)

## Phase 10 — Game Feel & Polish

- [ ] Explosion particles, engine trails, power-up sparkles
- [ ] Screen shake (player hit, boss damage, boss death)
- [ ] Enemy hit flash (white)
- [ ] Boss intro: pause, name banner, music change
- [ ] Tune sprite scales and hitboxScale values so visible sprite edges more closely match the physics body (player, all enemy archetypes, boss)
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
