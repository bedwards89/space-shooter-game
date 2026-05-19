# Decisions Log

Deviations from the project plan and architectural decisions made during implementation.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-19 | npm installed Phaser 4.1.0 (not Phaser 3) — **decision pending** | Phaser 4 is now the current npm latest. API compatibility with Phaser 3 code needs verification before proceeding to Phase 2. See open question below. |

---

## Open Questions

1. **Phaser 3 vs 4** — The project plan specifies Phaser 3. npm `latest` tag now resolves to Phaser 4.1.0. Decision needed before Phase 2: pin to Phaser 3 (`npm install phaser@3`) or adopt Phaser 4 and note any API differences.

2. **Game title** — Keep `STARWAKE` or pick another? Affects logo art and README.

3. **Music tracks** — Final picks from Phase 1 sourcing. Confirm vibe + license before integrating.

4. **Difficulty** — Should Level 1 be beatable on first try? Recommendation: yes, with 1–2 deaths allowed.
