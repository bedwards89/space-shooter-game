# Decisions Log

Deviations from the project plan and architectural decisions made during implementation.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-19 | Pinned to Phaser 3 (3.90.0) despite npm latest being Phaser 4.1.0 | Phaser 3 has vastly more reference material for the 2D arcade shmup genre. Phaser 4 at v4.1.0 is early; community content hasn't caught up. Risk of undocumented API gaps mid-build outweighs Phaser 4's architectural improvements for this scope. |
| 2026-05-19 | Node.js runtime bumped from 20 → 22 in .nvmrc and CI | GitHub Actions is deprecating Node 20 runners on June 2 2026 (2 weeks away). Node 22 is LTS and supported. |

---

## Open Questions

1. **Game title** — Keep `STARWAKE` or pick another? Affects logo art and README.

3. **Music tracks** — Final picks from Phase 1 sourcing. Confirm vibe + license before integrating.

4. **Difficulty** — Should Level 1 be beatable on first try? Recommendation: yes, with 1–2 deaths allowed.
