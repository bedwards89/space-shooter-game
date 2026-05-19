# Retro Space Side-Scroller — Project Plan

**Working title:** TBD (placeholder: `STARWAKE`)
**Genre:** 2D retro side-scrolling shoot-'em-up (R-Type / Gradius lineage)
**Platform:** Web browser, hosted on GitHub Pages
**Audience:** Single-player, keyboard-only
**Engineering audience for this document:** Junior engineer or AI coding assistant

---

## 1. Goals & Non-Goals

### Goals
- Build a playable 2D side-scrolling shooter with an 80s arcade aesthetic.
- Ship as a static web build deployed via GitHub Pages.
- Use only free, properly-licensed pixel art and audio assets.
- Implement a persistent score + unlock system that survives browser sessions.
- Provide at least two distinct, gameplay-affecting power-ups.
- Deliver a tight, polished demo with 3 playable levels and 2 unlockable ships.

### Non-Goals (Out of Scope for v1)
- Mobile / touch controls (keyboard only).
- Multiplayer of any kind.
- Online leaderboards or accounts.
- Procedural level generation.
- Original music composition (we will source CC-licensed tracks).
- Localization (English only).

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Game framework | **Phaser 3** (latest stable) | Mature, well-documented, batteries-included for 2D arcade games |
| Build tool | **Vite** | Fast dev server, simple GitHub Pages output |
| Language | **JavaScript (ES2022+)** | Lower barrier than TypeScript for handoff; revisit if engineer prefers TS |
| Persistence | **`localStorage`** | No backend needed; sufficient for high scores + unlocks |
| Asset bundling | Vite static `/public` directory | Phaser loads via URLs at runtime |
| Hosting | **GitHub Pages** via GitHub Actions | Auto-deploy on push to `main` |
| Version control | Git + GitHub | Standard |
| Node version | LTS (≥ 20) | Pin in `.nvmrc` |

**Junior engineer / AI tool autonomy:** If you have a strong reason to deviate (e.g., TypeScript, a different bundler), document it in `DECISIONS.md` before changing.

---

## 3. Repository Structure

```
/
├── README.md                  # Player-facing + how to run locally
├── DECISIONS.md               # Log of any deviations from this plan
├── CLAUDE.md                  # Context file for AI assistants (mirrors this plan)
├── LICENSE                    # MIT or similar for our code
├── package.json
├── vite.config.js
├── .nvmrc
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages CI/CD
├── index.html
├── src/
│   ├── main.js                # Phaser game config + bootstrap
│   ├── config.js              # Constants (resolution, physics, gameplay tuning)
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   ├── ShipSelectScene.js
│   │   ├── GameScene.js
│   │   ├── HUDScene.js        # Overlay, runs parallel to GameScene
│   │   ├── PauseScene.js
│   │   └── GameOverScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── Bullet.js
│   │   ├── PowerUp.js
│   │   └── Explosion.js
│   ├── systems/
│   │   ├── SaveSystem.js      # localStorage read/write + schema versioning
│   │   ├── ScoreSystem.js
│   │   ├── AudioManager.js
│   │   └── InputManager.js
│   └── data/
│       ├── levels.js          # Level definitions (waves, timing, boss)
│       ├── ships.js           # Ship stats + unlock criteria
│       └── enemies.js         # Enemy archetypes
├── public/
│   └── assets/
│       ├── sprites/
│       ├── audio/
│       ├── fonts/
│       └── ATTRIBUTIONS.md    # Source + license for every asset
└── tests/
    ├── manual/
    │   └── playtest-checklist.md
    └── unit/                  # Optional; for pure logic in /systems
```

---

## 4. Game Design Reference

### Core loop
Player flies a ship from left to right through scrolling space → shoots enemies → collects power-ups → defeats a boss → advances to next level → dies eventually → sees score → high score and unlocks saved.

### Resolution & feel
- Internal resolution: **480 × 270** (16:9, scaled up via Phaser `Scale.FIT`).
- Pixel-perfect rendering (`pixelArt: true` in Phaser config).
- Target: **60 fps** sustained on a mid-range laptop in Chrome.
- Parallax scrolling background (3+ layers) for depth.

### Controls (keyboard-only, remappable is non-goal)
| Action | Primary | Secondary |
|---|---|---|
| Move up / down / left / right | Arrow keys | WASD |
| Fire primary | Space | J |
| Use power-up / bomb | Shift | K |
| Pause | P or Esc | — |
| Confirm in menus | Enter | Space |

### Power-ups (minimum two; recommended three)
Power-ups drop from specific enemies and float across-screen. Player collects by collision.

1. **Spread Shot** — temporarily replaces single forward bullet with a 3-way spread. Duration: ~10 seconds. Stacking does not increase shots; it refreshes the timer.
2. **Shield** — absorbs one hit, then breaks. Visible bubble around the ship. Does not stack; collecting a second shield refreshes a broken one.
3. *(Recommended)* **Rapid Fire** — increases fire rate (e.g., 5 shots/sec → 12 shots/sec) for ~8 seconds.

Each power-up must have:
- A unique sprite color/shape (colorblind-distinguishable).
- A distinct pickup sound.
- A visible HUD indicator with remaining duration (where applicable).

### Ships (unlockable)
- **Ship 1 — "Comet"** (default, unlocked): balanced. Speed 5, fire rate medium, hitbox medium.
- **Ship 2 — "Wraith"** (unlock: clear Level 2): fast, small hitbox, slower fire rate.
- **Ship 3 — "Bulwark"** (unlock: clear Level 3): slow, large hitbox, high fire rate, starts every level with a free Shield.

### Scoring
- Small enemy: 100
- Medium enemy: 250
- Large enemy: 500
- Boss: 5,000
- Power-up pickup: 50
- Combo multiplier: ×2 if 5+ enemies killed within 3 seconds, decays after 3 seconds without a kill.

### Levels (v1 scope: 3 levels)
1. **Asteroid Belt** — easy intro, lots of small dodgeable enemies, simple boss (large asteroid that splits).
2. **Nebula Patrol** — mid difficulty, mixed enemy waves, mini-boss + boss.
3. **Final Approach** — hard, dense waves, final boss with two phases.

---

## 5. Phased Build Plan

Each phase has: **Objective**, **Deliverables**, **Testing Requirements**, **Definition of Done (DoD)**. Phases are roughly sequential; some overlap is fine.

---

### Phase 0 — Foundation (½ day)

**Objective:** Get a runnable Phaser project deploying to GitHub Pages with a placeholder scene.

**Deliverables**
- Git repo initialized with `main` branch.
- `npm` project with Phaser 3 and Vite installed.
- `vite.config.js` configured with the correct `base` path for GitHub Pages (e.g., `/repo-name/`).
- `index.html` and `src/main.js` that boot Phaser and render a colored rectangle on screen.
- GitHub Actions workflow `.github/workflows/deploy.yml` that builds and deploys to the `gh-pages` branch (or GitHub Pages "Pages from Actions" flow) on push to `main`.
- `README.md` with: project description, `npm install` / `npm run dev` / `npm run build` instructions, and live URL once deployed.

**Testing Requirements**
- `npm run dev` opens local dev server and renders the placeholder.
- Pushing to `main` triggers the workflow, which completes green.
- The GitHub Pages URL loads the placeholder in Chrome and Firefox.

**DoD:** Live URL shows the placeholder. No console errors.

---

### Phase 1 — Asset Pipeline & Licensing (1 day)

**Objective:** Source, organize, and document all art and audio assets up front so later phases just consume.

**Sources to use (CC0 or permissive)**
- **Sprites:** Kenney.nl space packs (e.g., "Space Shooter Redux", "Space Shooter Extension"). All CC0.
- **Backgrounds / parallax:** Kenney "Background Elements Redux", or OpenGameArt CC0 starfields.
- **Fonts:** Kenney "Kenney Future" or "Kenney Pixel" — pixel-style, CC0.
- **SFX:** Kenney "Sci-fi Sounds" pack (CC0).
- **Music:** Lo-fi tracks from **Pixabay Music**, **FreePD**, or **Incompetech (Kevin MacLeod, CC-BY)**. Search terms: "lofi", "chillhop", "synthwave mellow", "ambient electronic". Target tracks with a mellow, slightly melancholy alt-electronic feel (think understated synths, soft beats, hopeful but moody). **Do not use copyrighted music** even as a placeholder — the project is publicly hosted.
- **Music alternative:** If suitable tracks are not found, use **Pixabay** royalty-free lo-fi only. Avoid AI music generators for v1 unless their commercial-use terms are unambiguous.

**Deliverables**
- `/public/assets/sprites/` populated with: player ships (3), enemy types (≥4), bullets (player + enemy variants), power-up icons (3), explosion sprite sheet, boss sprites (3), parallax background layers (≥3).
- `/public/assets/audio/sfx/`: shoot, enemy hit, explosion, power-up pickup, shield break, player death, menu select, menu confirm.
- `/public/assets/audio/music/`: at least 4 tracks — menu theme, level 1, level 2/3, boss theme.
- `/public/assets/fonts/`: one pixel font in a web-loadable format (bitmap font preferred for Phaser).
- **`ATTRIBUTIONS.md`** listing, for every single asset: filename, original source URL, author, license (CC0 / CC-BY / etc.), and any required attribution text.

**Testing Requirements**
- Every asset listed in `ATTRIBUTIONS.md` exists on disk with the exact filename referenced.
- Every asset on disk appears in `ATTRIBUTIONS.md` — no orphans.
- CC-BY assets have attribution text included in the in-game credits screen mockup (full screen comes later).
- Spot-check at least one image in a viewer to confirm it's not corrupt.

**DoD:** A peer reviewer (or you in 6 months) can identify the license of any asset by name in under 30 seconds.

---

### Phase 2 — Core Scene Architecture (1 day)

**Objective:** Wire up the scene graph and asset loader so all later work has a home.

**Deliverables**
- `BootScene` → loads minimal assets needed for the preload progress bar; transitions to `PreloadScene`.
- `PreloadScene` → loads all sprite atlases, audio, and fonts; shows a progress bar; transitions to `MenuScene`.
- `MenuScene` → title art, "Start", "Ship Select", "Credits", "Reset Save" buttons; keyboard-navigable.
- `ShipSelectScene` → shows owned ships with stats, allows selection, locked ships display unlock criteria.
- `GameScene` → empty scrolling parallax background; player ship visible but not yet moving.
- `HUDScene` → launches in parallel with `GameScene`; placeholder for score and lives.
- `PauseScene` → overlays `GameScene` when P/Esc pressed; "Resume", "Quit to Menu".
- `GameOverScene` → "Game Over", final score, "Retry", "Main Menu".
- `config.js` exporting tunable constants (player speed, bullet speed, spawn intervals, etc.).

**Testing Requirements**
- All scene transitions work via keyboard.
- Pressing P during `GameScene` pauses; physics and timers stop until resumed.
- No assets fail to load (check browser console).
- Resizing the window scales the canvas without distortion or blurring.

**DoD:** Navigation between all scenes works cleanly. No placeholder text remains in the menu scene.

---

### Phase 3 — Player & Combat (1–2 days)

**Objective:** Player ship feels good to fly and shoot.

**Deliverables**
- `Player` entity: arcade physics body, movement clamped to screen bounds, configurable speed per ship.
- Smooth diagonal movement (normalized so diagonal isn't faster).
- Primary fire on Space with configurable fire rate; bullets pooled (no `new` allocations during gameplay).
- Hitbox is smaller than the visual sprite (standard bullet-hell convention; player should feel "fairly" hit).
- Death animation, brief invulnerability on respawn, 3 lives per run.
- `Bullet` entity, pooled, with collision against enemies (collision logic stubbed in Phase 4).
- Per-ship stats consumed from `data/ships.js`.

**Testing Requirements**
- Movement feels responsive — no perceptible input lag.
- Holding fire produces a consistent stream at the configured rate (test with a frame counter or timer).
- Ship cannot leave the visible playfield in any direction.
- Bullet pool does not grow unbounded over 60+ seconds of continuous fire.
- Switching ships in `ShipSelectScene` produces visibly different behavior in `GameScene`.

**DoD:** Player can fly around an empty level and shoot. Movement and firing are tuned to feel good (a tuning pass with the playtester is part of this phase).

---

### Phase 4 — Enemies & Levels (2–3 days)

**Objective:** Populate the world with enemies, waves, and bosses across 3 levels.

**Deliverables**
- `Enemy` base class with subclasses or data-driven variants for: small fast (straight line), medium (sine wave), large (slow, fires back), turret (stationary), and one boss-class per level.
- Enemy bullets, pooled.
- Wave / spawn system reading from `data/levels.js`. A level is a timeline of `{time, type, count, formation}` entries plus a boss trigger.
- Collision: player bullet → enemy (damage, score), enemy or enemy bullet → player (life lost), player → power-up (Phase 5 hook).
- Three level definitions matching the design (Asteroid Belt, Nebula Patrol, Final Approach), each ~90–120 seconds + boss.
- Level transitions: brief "Level Complete" interstitial, then load next level. After Level 3, "You Win" then `GameOverScene` with the final score.

**Testing Requirements**
- Each level can be completed without bugs (enemies don't get stuck, bosses die when HP hits 0).
- Each enemy archetype is playable for at least 30 seconds without crashing.
- Memory: pool sizes stay bounded; verify with browser memory snapshot before and after a full Level 1 run.
- Spawn timing is deterministic given a fixed start time (helps QA reproduce bugs).
- Boss HP bars (if used) decrement correctly.

**DoD:** A skilled tester can play all three levels start to finish. A new player can complete Level 1 within 3 attempts.

---

### Phase 5 — Power-Ups (1 day)

**Objective:** At least two gameplay-altering power-ups, with visual + audio feedback.

**Deliverables**
- `PowerUp` entity with type (`SPREAD`, `SHIELD`, `RAPID`).
- Drop logic: assign a low chance (~10%) to medium and large enemies; guarantee one drop in the first 30 seconds of Level 1 so players see the mechanic.
- Spread Shot, Shield, and (recommended) Rapid Fire behavior as specified in Section 4.
- HUD timer rings or bars for time-limited power-ups.
- Power-ups visually distinct (different colors/shapes), each with a unique pickup SFX.
- Stacking rules: collecting the same power-up refreshes duration; collecting different power-ups while one is active is allowed (both effects stack independently).

**Testing Requirements**
- Each power-up can be triggered manually in a debug mode or with a cheat key (document the cheat key in `DECISIONS.md`, then strip before release).
- Spread Shot fires 3 bullets at the documented angles.
- Shield absorbs exactly one hit and emits the break SFX + visual.
- HUD timer matches actual remaining duration within ±100 ms.
- Power-ups disappear after 8–10 seconds on screen if not collected.

**DoD:** All power-ups work end-to-end and are visibly distinct. A new player notices power-ups exist without being told.

---

### Phase 6 — Score System (½ day)

**Objective:** Track and display in-run score with a combo multiplier.

**Deliverables**
- `ScoreSystem` module exposing: `add(points)`, `getScore()`, `reset()`, `getCombo()`.
- Combo multiplier per Section 4 (×2 if 5+ kills within 3 seconds; decays after 3 seconds without a kill).
- HUD displays current score, current combo, and current multiplier.
- On `GameOverScene`, final score is displayed; if it's a top-5 high score, a "NEW HIGH SCORE!" flourish plays.

**Testing Requirements**
- Killing one enemy at a time yields the documented base points.
- Killing 5 enemies within 3 seconds activates the multiplier.
- Multiplier resets correctly when the timer expires.
- Score persists across level transitions but resets at run start.

**DoD:** Score is always visible, always correct, and reaching a high score feels rewarding.

---

### Phase 7 — Save System (1 day)

**Objective:** Persist high scores and unlock progress across browser sessions.

**Persisted data (versioned schema)**
```
{
  "schemaVersion": 1,
  "highScores": [ { "score": 12500, "ship": "Comet", "date": "2026-05-18" }, ... up to 10 ],
  "unlockedShips": ["Comet", "Wraith"],
  "highestLevelCleared": 2,
  "totalRunsPlayed": 47,
  "settings": { "musicVolume": 0.7, "sfxVolume": 0.8 }
}
```

**Deliverables**
- `SaveSystem` module: `load()`, `save()`, `reset()`, `migrate(oldVersion, data)`.
- Auto-save triggers: on level clear, on game over, on settings change.
- "Reset Save" option in menu with confirmation prompt.
- Graceful handling of: corrupted JSON, missing keys, `localStorage` disabled, quota exceeded.
- Migration path: if `schemaVersion` is older than current, run migrations; if newer, fall back to defaults and warn.

**Testing Requirements**
- Set a high score, refresh browser → score persists.
- Clear Level 2 → "Wraith" appears unlocked in ShipSelectScene after refresh.
- Manually corrupt the localStorage entry via DevTools → game loads with defaults, no crash.
- Disable localStorage (e.g., Safari Private Mode behavior) → game runs but doesn't save; no crash.
- "Reset Save" wipes everything and returns to default state.

**DoD:** Save system survives a hostile QA pass (corruption, disabled storage, version skew).

---

### Phase 8 — Audio (½–1 day)

**Objective:** Music and SFX integrated, with volume controls.

**Deliverables**
- `AudioManager` module wrapping Phaser's sound system.
- Music loops cleanly between levels; menu has its own loop.
- SFX assigned to: shoot, enemy hit, enemy explode, player hit, player explode, power-up pickup, shield break, menu select, menu confirm, level complete, boss death.
- Volume sliders for music and SFX in the menu, persisted via `SaveSystem`.
- Music ducks (lowers volume ~30%) during boss intro voice/SFX if any.
- First user interaction triggers audio context unlock (browser autoplay policy).

**Testing Requirements**
- Music loops without an audible gap or click.
- No SFX clips or distorts at max volume.
- Mute and 0% volume both produce silence.
- Audio survives tab-out / tab-in (no permanent silence).

**DoD:** Game sounds good at default settings. No audio bugs at any volume.

---

### Phase 9 — UI / UX Polish (1 day)

**Objective:** Menus, HUD, and transitions feel cohesive and arcade-appropriate.

**Deliverables**
- Title screen with animated text or starfield.
- Consistent pixel font across all UI.
- HUD: score, lives (icons), combo multiplier, active power-up timers, current level name.
- Pause overlay dims the game and shows a paused indicator.
- Game Over screen: final score, top-5 leaderboard view, "Retry" and "Main Menu".
- Credits screen accessible from main menu, listing all CC-BY attributions verbatim from `ATTRIBUTIONS.md`.
- Subtle screen transitions between scenes (fade or pixelate, 200–400 ms).

**Testing Requirements**
- All text is legible at the default scale.
- No UI element overlaps gameplay-critical areas at any aspect ratio between 16:10 and 21:9.
- Keyboard navigation reaches every interactive element. Tab order is sensible.
- Credits screen shows every CC-BY attribution.

**DoD:** A first-time player can navigate the entire menu system without guidance.

---

### Phase 10 — Game Feel & Polish (1 day)

**Objective:** Add "juice" — the small effects that make arcade games feel alive.

**Deliverables**
- Particle effects: explosions, engine trails, power-up sparkles.
- Screen shake on player hit, boss damage, boss death (subtle — easy to overdo).
- Hit flashes: enemies flash white on damage.
- Slight bullet recoil / kickback animation on player.
- Boss intro: dramatic pause, name banner, music change.
- Performance pass: confirm 60 fps with a stress-test wave (50+ enemies + 100+ bullets on screen).

**Testing Requirements**
- Stress test: maintain ≥ 55 fps with 50 enemies, 100 enemy bullets, 50 player bullets on screen for 10 seconds.
- Screen shake never makes the player lose track of their ship.
- No new memory leaks introduced by particles.

**DoD:** Game looks and feels like an arcade game, not a tech demo.

---

### Phase 11 — Testing & QA (1 day)

**Objective:** A real QA pass before release.

**Deliverables**
- `tests/manual/playtest-checklist.md` — a comprehensive checklist covering every feature.
- At least one full playtest by someone other than the developer.
- Bug list with severity (P0 blocker, P1 major, P2 minor, P3 polish) and disposition (fixed / deferred / wontfix).
- All P0 and P1 bugs fixed.

**Cross-cutting test matrix**

| Area | Test |
|---|---|
| Browsers | Chrome, Firefox, Safari, Edge — latest stable, on desktop |
| OS | macOS, Windows; Linux best-effort |
| Resolution | 1280×720, 1920×1080, 2560×1440, 3440×1440 |
| Input | Both arrow keys and WASD work; both Space and J fire; key remap not required |
| Save | Persists across refresh; survives corruption; "Reset Save" works |
| Audio | Plays on first interaction; loops cleanly; volume sliders work |
| Performance | Sustains ≥ 55 fps in stress conditions |
| Accessibility | Pause is reachable from gameplay; no flashing strobes faster than 3 Hz (epilepsy safety) |
| First load | Cold load on a throttled "Fast 3G" connection completes in under 15 seconds |

**DoD:** Playtest checklist signed off. No P0/P1 bugs open.

---

### Phase 12 — Deployment & Launch (½ day)

**Objective:** Production deploy to GitHub Pages.

**Deliverables**
- Verified production build (`npm run build`) runs locally via `npm run preview` with no errors.
- GitHub Actions deploy on push to `main` is green.
- README.md updated with: gameplay instructions, controls, credits link, live URL, screenshots/GIF.
- Tagged release `v1.0.0`.

**Testing Requirements**
- Live URL plays end-to-end on a fresh browser profile (no cached assets).
- Open Graph / social preview tags render correctly when the URL is shared.
- 404 fallback exists (GitHub Pages SPA-style routing isn't needed but a 404.html is courteous).

**DoD:** Public URL plays the full game. README is accurate.

---

## 6. Cross-Cutting Standards

### Code style
- Use Phaser 3 conventions; prefer scene methods over global state.
- Avoid magic numbers in entity classes — pull tuning into `config.js` or per-entity data files.
- One concept per file. Files > 300 lines should be reviewed for splitting.
- Comment intent, not mechanics. ("We give the player 500ms of i-frames on respawn to prevent instant re-deaths in dense waves" — not "// set invuln = true".)

### Performance
- Object-pool all bullets, enemies, particles, and power-ups.
- No `new` calls inside per-frame update loops.
- Bitmap fonts > web fonts for HUD text in Phaser.

### Accessibility (light pass for v1)
- No strobe effects faster than 3 Hz.
- Color is never the only signal — power-ups also vary in shape.
- Audio is never the only signal — every audio cue has a visual counterpart.

### Asset licensing discipline
- Every new asset added must be recorded in `ATTRIBUTIONS.md` in the same commit.
- If a CC-BY asset is added, attribution text must appear in the Credits scene.
- If license cannot be verified, do not use the asset.

---

## 7. Acceptance Criteria for v1.0

The project is "done" when **all** of the following are true:

1. Live on GitHub Pages at a documented URL.
2. Three levels playable start to finish.
3. Three ships defined (one unlocked by default, two unlockable).
4. At least two power-ups, each gameplay-affecting and visually distinct.
5. Score system with combo multiplier; top-5 high scores persist across sessions.
6. Unlock progress persists across sessions.
7. Music and SFX play; volume is adjustable and persisted.
8. Game runs at ≥ 55 fps on a mid-range laptop in Chrome, Firefox, Safari, and Edge.
9. Every asset is documented in `ATTRIBUTIONS.md` with a verifiable license.
10. README explains how to run locally and how to play.
11. No P0 or P1 bugs open.

---

## 8. Open Questions for the Implementer

Resolve in `DECISIONS.md` before relevant phase begins:

1. **Title.** Keep `STARWAKE` or pick another? Affects logo art and README.
2. **Aspect ratio.** Strict 16:9 letterboxed, or scale to fit window? Recommendation: 16:9 letterboxed.
3. **Music tracks.** Final picks from the sourcing pass — confirm each is appropriate-vibe and license-clear before integration.
4. **Difficulty tuning.** Should Level 1 be beatable on first try? Recommendation: yes, with 1–2 deaths.
5. **TypeScript or stay on JS.** Recommendation: stay on JS for v1.

---

## 9. Estimated Timeline

For a junior engineer working ~6 productive hours/day:

| Phase | Estimate |
|---|---|
| 0. Foundation | 0.5 day |
| 1. Asset Pipeline | 1 day |
| 2. Scene Architecture | 1 day |
| 3. Player & Combat | 1.5 days |
| 4. Enemies & Levels | 2.5 days |
| 5. Power-Ups | 1 day |
| 6. Score System | 0.5 day |
| 7. Save System | 1 day |
| 8. Audio | 0.75 day |
| 9. UI / UX | 1 day |
| 10. Polish | 1 day |
| 11. QA | 1 day |
| 12. Deploy | 0.5 day |
| **Total** | **~13 working days** |

Buffer +25% for unfamiliar territory → **~16 working days** end-to-end.

---

## 10. Handoff Notes

- This document is the source of truth. Disagreements between this document and code should be resolved by either (a) updating this document or (b) fixing the code — never silent drift.
- Mirror this plan into `CLAUDE.md` at the repo root for AI assistants to consume.
- Log every meaningful decision deviation in `DECISIONS.md` with date, decision, and rationale.
- When in doubt, ship the smaller version. Polish beats scope for an arcade demo.
