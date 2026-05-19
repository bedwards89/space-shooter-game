# Manual Playtest Checklist

Run through this before any release. Sign off each section with date + tester name.

---

## Controls

- [ ] Arrow keys move the ship in all 4 directions
- [ ] WASD moves the ship in all 4 directions
- [ ] Diagonal movement is not faster than cardinal
- [ ] Ship cannot leave the visible playfield
- [ ] Space fires primary weapon
- [ ] J fires primary weapon
- [ ] P pauses the game
- [ ] Esc pauses the game
- [ ] Pause: Resume returns to gameplay
- [ ] Pause: Quit returns to main menu
- [ ] Main menu: all buttons reachable by keyboard
- [ ] Ship select: all ships viewable / selectable by keyboard

## Gameplay

- [ ] Player starts with 3 lives
- [ ] Taking a hit reduces lives by 1 and triggers i-frames (brief flicker)
- [ ] 0 lives → Game Over screen
- [ ] Enemies spawn per level timeline
- [ ] Enemies die when HP reaches 0
- [ ] Boss appears at end of each level
- [ ] Defeating boss triggers Level Complete
- [ ] Level transitions load the next level correctly
- [ ] Winning Level 3 shows "You Win" then Game Over with final score

## Power-Ups

- [ ] Spread Shot fires 3 bullets at documented angles (~15° spread)
- [ ] Spread Shot expires after ~10 seconds
- [ ] Shield absorbs exactly one hit then breaks (SFX + visual)
- [ ] Rapid Fire increases fire rate visibly (~12 shots/sec)
- [ ] Rapid Fire expires after ~8 seconds
- [ ] Power-ups disappear from screen after ~9 seconds if not collected
- [ ] HUD timer shows remaining duration for active power-ups
- [ ] Each power-up has a distinct color AND distinct shape
- [ ] Each power-up has a distinct pickup sound

## Score & Save

- [ ] Killing enemies adds correct base score
- [ ] 5 kills within 3 seconds activates ×2 multiplier (visible in HUD)
- [ ] Multiplier resets after 3 seconds without a kill
- [ ] Score persists across level transitions within a run
- [ ] Score resets at the start of a new run
- [ ] High score persists after browser refresh
- [ ] Unlock progress (ships, highest level) persists after refresh
- [ ] "Reset Save" in menu wipes all data after confirmation
- [ ] Game loads cleanly with no prior save data

## Audio

- [ ] Music plays when game starts (after first interaction)
- [ ] Music loops without audible gap
- [ ] SFX play for: shoot, enemy hit, explosion, power-up pickup, shield break, player hit, level complete
- [ ] Music volume slider works (0% = silence)
- [ ] SFX volume slider works (0% = silence)
- [ ] Volume settings persist after refresh
- [ ] Audio survives tab-out and tab-in

## Performance & Polish

- [ ] 60 fps sustained in normal gameplay (check browser DevTools)
- [ ] ≥ 55 fps in stress test (50 enemies + 100+ bullets on screen)
- [ ] No console errors during full playthrough
- [ ] Screen shake on player hit (subtle)
- [ ] Enemies flash white on damage
- [ ] Explosions play on enemy/player death
- [ ] Boss intro: pause + name banner + music change

## Accessibility

- [ ] No flashing faster than 3 Hz
- [ ] All menu text readable at 1080p
- [ ] Credits screen shows all CC-BY attributions

## Browser Matrix

| Browser | OS | Result | Tester | Date |
|---------|-----|--------|--------|------|
| Chrome (latest) | macOS | | | |
| Firefox (latest) | macOS | | | |
| Safari (latest) | macOS | | | |
| Edge (latest) | Windows | | | |
| Chrome (latest) | Windows | | | |
