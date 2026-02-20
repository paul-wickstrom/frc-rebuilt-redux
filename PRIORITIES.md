# FRC Rebuilt Redux - Priorities

Captured on: 2026-02-20

## Priority 1 (Blockers / High Risk)
1. Fix run config mismatch in `.replit`.
   - Current workflow references `./.config/static-web-server.toml`, but that path is missing.
   - Action: add the missing config file or update serve command to use defaults.

2. Decompose `index.html` into maintainable modules.
   - Move logic into separate JS files (`scene`, `entities`, `controllers`, `ui`, `config`).
   - Keep behavior parity while reducing regression risk.

3. Add deterministic mode for balancing.
   - Seed random choices (shot spread, tie-breaks, auto random recovery).
   - Action: configurable seed + toggle.

4. Add tests for core rules.
   - Focus:
     - timeframe progression
     - hub activation schedule
     - airborne-only scoring
     - fuel conservation invariant
     - reset behavior

5. Harden collision/intake/scoring edge handling.
   - Verify no duplicate score/intake from multi-pair collision bursts.
   - Validate compound-body sensor assumptions.

## Priority 2 (Important Improvements)
6. Calibrate controller fairness.
   - Align practical performance across `human`, `cursor`, `fuelSeeker`, `adaptiveHub`.
   - Define acceptable score bands per matchup.

7. Add lightweight telemetry HUD for tuning.
   - Include world/stored/hub fuel counts, intakes, shots, phase scoring rate.

8. Centralize gameplay constants.
   - Move tunables to one config object/file for easier balancing iteration.

## Priority 3 (Cleanup / Productization)
9. Resolve CSS ownership.
   - Either migrate inline styles into `style.css` or remove unused split to avoid drift.

10. Define explicit acceptance benchmarks.
   - Example targets:
     - score distributions by controller pairing
     - tie frequency
     - neutral-zone dwell percentages
     - expected match pacing by phase

## Working Principle
- Prefer small, behavior-preserving changes.
- After each meaningful rules/control change, run a repeatable benchmark set before merging.
