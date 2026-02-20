# FRC Rebuilt Redux - Project Context

## Snapshot
- Date captured: 2026-02-20
- Repo root: `/Users/paulwickstrom/Documents/Codex Projects/frc-rebuilt-redux`
- Current branch: `main` (clean working tree when captured)
- App type: static single-page web sim
- Runtime stack: Phaser 3.80.1 + Matter.js (via CDN)

## File Layout
- Core gameplay + UI + controllers: `index.html` (monolithic implementation)
- Minimal stylesheet: `style.css`
- Assets:
  - `assets/RebuiltReduxLogo.jpeg`
  - `assets/audio/match/*.wav`
- Replit run config: `.replit`

## Core Game Model
- Field: 54x27 ft scaled to pixels, split into zones:
  - `RED`
  - `NEUTRAL`
  - `BLUE`
- Two robots (`Red`, `Blue`) with:
  - XY drive + spin
  - Intake sensor
  - Turret aiming
  - Fuel storage (max 25)
- Fuel lifecycle:
  - World fuel (physics body)
  - Robot-stored fuel (no body)
  - Hub-captured queue (no body, ejected later)

## Match + Scoring Rules (Current Implementation)
- Total match length: 150s
- Timeframes:
  - `AUTO` 20s
  - `TRANSITION` 10s
  - `SHIFT1` 25s
  - `SHIFT2` 25s
  - `SHIFT3` 25s
  - `SHIFT4` 25s
  - `ENDGAME` 30s
- Shot fuel:
  - Airborne for ~700ms
  - Only airborne fuel can score on hub sensors
- Hub capture/eject:
  - Fuel that enters a hub sensor is captured
  - If hub is active at impact, alliance score increments by 1
  - Captured fuel ejects into neutral after ~1000ms delay

## Controllers
- `human`: keyboard/gamepad
- `cursor`: mouse-drive + click/hold shoot
- `fuelSeeker`: autonomous collection/scoring
- `adaptiveHub`: score when own hub active, raid opponent fuel when inactive

## Inputs
- Red:
  - Move: `W/A/S/D`
  - Spin: `Q/E`
  - Shoot: `Space`
- Blue:
  - Move: `I/J/K/L`
  - Spin: `U/O`
  - Shoot: `Enter`
- Global:
  - Reset match: `R`

## Known Constraints
- Most logic in one large HTML file; limited modularity/testability.
- No explicit automated tests or CI in this repo snapshot.
- No in-repo design doc/roadmap beyond code and commit history.
