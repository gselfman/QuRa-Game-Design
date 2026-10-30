# T2 — Battle Engine: architecture, runbook and verification

**Status:** Core T2 engine, baseline 10,000×36 and exported artifact VERIFIED. Numeric target satisfaction is explicitly not yet achieved; the remaining baseline experiments for level/BP/gear/async and balance tuning are OPEN for T3–T5. No character stats have been calibrated. **Branch:** `arena/t2-engine-2026-10-30` · **PR:** #16.

## Shared engine
- `tools/arena-engine.mjs`: pure deterministic calculations from the current prototype, unchanged L4 starting stats of six heroines, four actions, legal Special at 100 charge, shields/HP/negative status/healing, counter-matrix, Wall pairing, JRPG retarget, seeded PRNG.
- `arena/index.html`: classic one-screen prototype calls the shared module for round resolution.
- `arena-live-3x3/team-core.js`: host routes Wall and JRPG through the shared module; existing network, room selection, chat and UI remain separate. These files are prototypes, not production.
- `tools/arena-sim-cli.mjs`: 6×6 side-ordered pair matrix, fixed seed, default `--per-pair 10000`, rows and action histogram CSV/JSON; a 3×3 team sample.
- `tests/arena-engine.test.mjs`: invariant tests, seeded outcomes, active/dead behavior, source wiring, smoke CLI, 576 legacy Wall clashes (6×6 × 4×4), JRPG target switching.

## Running locally
Node 20+:
```bash
node --test tests/
node tools/arena-sim-cli.mjs --per-pair 10000 --seed 20261030 --out arena-results
```
Artifacts:
- `arena-results/matrix.json`
- `arena-results/matrix.csv`
- `arena-results/round-histograms.json`

The GitHub workflow `.github/workflows/arena-t2.yml` starts an exhaustive run when the engine or CLI changes in its development branch and uploads an `arena-t2-matrix` artifact.

## Equilibrium baseline
Simultaneous hidden choice: `attack/defend/maneuver/special` if charge allows, otherwise first 3. Per clash, the engine estimates a 3×3 or 4×4 payoff matrix by simulating each legal action pair once, then uses 24 iterations of multiplicative weights to approximate a mixed minimax response. **Approximation only, not a numerical proof of Nash optimality:** exploitability bound has not been computed; T3/T4 should measure this before using results as optimal-play guarantees.

## Open T2 risks / integration QA
- Browser visual smoke with real players/network is not yet covered by CI; static import and side-by-side pure engine parity are tested.
- Same fighter can meet several opponents in one Wall round; a spent Special cannot be applied again. Current fallback action on subsequent clash is defensive — **PROVISIONAL**, subject to T3 §54.
- Exact JRPG behavior comparison needs scenario fixtures; current tests check retarget and dead fighters but do not validate every legacy branch.
- The 1×1 battle duration cap of 30 rounds and HP-ratio tie-break at cap are research-only; T3 must choose tie/KO resolution.
- The console matrix only reports mechanical baseline: win matrix, round histograms, action shares, Special counts, 3×3 sample; +level, BP, gear, comeback, async and broader goal matrix belong to upcoming T3–T5 and require extensions before final target/actual report.
- No numeric results should be recorded as facts unless retrieved from a completed run artifact.

## T2 acceptance gates
1. All CI tests green on PR head.
2. Exhaustive run completed and artifact contains 36 rows and 360,000 matches with fixed seed.
3. Shared engine used in both browser prototype entrypoints and JRPG/Wall.
4. Actual parity tests green; any differences documented.
5. PR #16 merged only after above, and green CI verified in `main`.

## Verified evidence after full run

- Full batch: https://github.com/gselfman/QuRa-Game-Design/actions/runs/41061092160 — 360,000 1×1 + 10,000 3×3, artifact `arena-t2-matrix`.
- Tests after integration: https://github.com/gselfman/QuRa-Game-Design/actions/runs/41061832982 — success.
- Detailed target-vs-actual: `ARENA_SIMULATION_RESULTS.md`.
- Raw 6×6 data: `results/arena-t2-matrix-20261030.csv`.
- **Not complete by literal scope of original T2:** simulator has not emitted meaningful L+1/L+4, BP±5/+20, 1×2/1×3 comeback, full-gear or async-defense figures. These require T3–T5 rule/model work; do not label absent figures as passing.
