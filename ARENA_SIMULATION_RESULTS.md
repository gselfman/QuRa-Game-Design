# QuRa — Arena Simulation Results

**T2: baseline simulation completed, 30.10.2026.** T3–T5 calibration NOT performed. These numbers are **CURRENT PROTOTYPE BASELINE**, not `LOCKED по симуляции` and not validated optimized-game balance. Economic M1–M4 remain frozen.

## Reproducibility
- CI: https://github.com/gselfman/QuRa-Game-Design/actions/runs/41061092160 — `success`.
- Seed: `20261030`; `equilibrium` against `equilibrium`; 10,000 fights for each ordered 6×6 pair = **360,000 1×1 matches**.
- Additional 3×3 team sample: 10,000 matches, teams `r,b,f` vs `p,m,g`.
- Model at commit `607fbf97e07f5cbfc5419751ca44326ff377affa` (pure engine baseline); full workflow artifact `arena-t2-matrix` contains `matrix.json`, `matrix.csv`, `round-histograms.json`.
- Retained repository copy of matrix: `results/arena-t2-matrix-20261030.csv`.
- Win rates **assign 0.5 win to a draw**. Thus not conditional win rate among decided fights. Pairs are ordered: row heroine is side A, column is side B.
- `equilibrium` approximates mixed zero-sum play with 24 iterations of multiplicative weights. It is not proven Nash equilibrium and exploitability is not established; do not label statistically optimal before further validation.

## Actual 6×6 win rate (% side A, draw counted as 0.5)

| A \ B | Ряба | Боевик | Дурочка | Профессор | Монах | Гламурочка |
|---|---:|---:|---:|---:|---:|---:|
| **Ряба** | 50.39 | 43.14 | 60.00 | 55.58 | 61.63 | 57.57 |
| **Боевик** | 58.35 | 51.21 | 59.21 | 59.41 | 54.42 | 59.63 |
| **Дурочка** | 42.82 | 41.64 | 51.45 | 48.74 | 49.63 | 51.29 |
| **Профессор** | 46.39 | 40.09 | 50.63 | 51.07 | 50.12 | 50.88 |
| **Монах** | 49.40 | 49.20 | 55.35 | 51.76 | 61.53 | 55.67 |
| **Гламурочка** | 45.07 | 40.68 | 48.54 | 49.12 | 50.13 | 50.63 |

The fact that same-hero mirror battles can produce 61.53% (Монах vs Монах) is **a correctness/red-flag for first-side bias or resolution ordering**, not evidence of a skill advantage. T3 must diagnose before adopting the matrix as balanced. Some reverse-pair win rates do not sum to 100% (separate independently seeded ordered simulations); this is an additional bias/estimation check.

## T2 target versus observed baseline

| Metric | Target | Observed | Status |
|---|---|---|---|
| Every founder 1×1 vs others | 45–55% | Mean of row across 5 different opponents: Ряба 55.58%, Боевик 58.20%, Дурочка 46.82%, Профессор 47.62%, Монах 52.28%, Гламурочка 46.71% | FAIL for some |
| Worst ordered 1×1 pairing | at least 40/60 | Min 40.09% (Профессор vs Боевик); max 61.63% | Barely passes lower bound, exceeds 60 upper side |
| Median 1×1 rounds | 5–6 (4–8 overall) | Across 36 cells medians 7–9 (8 cells at 7, 21 at 8, 6 at 9, 1 at 7.5) | FAIL |
| 3×3 rounds | 6–12 | Median 10; mean 10.236 in one team pairing | Pass in that scenario only |
| All actions 10–40% | each 10–40% | Attack 25.25%, Defend 54.27%, Maneuver 16.00%, Special 4.49% | FAIL |
| Special uses per 1×1 fight | 1–2 | Mean across 36 cells 0.733 uses total for both fighters; range 0.567–1.018 | FAIL |
| Draw / double KO | measure; tie-break if >2% | Mean draw outcome 21.92% across 36 cells; max 32.44%. **Double KO not separately counted** | Requires T3 |
| 3×3 draw outcomes | monitor | 576/10,000 (5.76%), includes unresolved at round cap | Investigate |
| Comeback 1×2 / 1×3, level advantage, BP, gear, async defense | specified in task | **NOT MEASURED IN T2 DATASET** | OPEN for T3–T5 |

## Interpretation / hand-off to T3
1. Severe defense dominance (54.27%) indicates potential action-payoff imbalance, not proof that `equilibrium` is optimal.
2. Side bias in mirrors, high draw frequency, and untested JRPG multi-collision rules need diagnostics before tuning stats.
3. Fight duration is too long; Special availability/charge and skill effects underused.
4. Do **not** silently change LOCKED decisions or L4 stats at T2. T3 selects rules with comparative data, T4 calibrates numbers against goals.
5. Numeric findings do not imply any user behavior, retention or production promise.

## T2 acceptance notes
- Common engine `tools/arena-engine.mjs` is used in both browser prototype entrypoints; network UI integration has static contract tests, but **no real multiplayer browser E2E test was executed**.
- Unit tests verify 576 deterministic Wall clashes and 12 JRPG single-target cases against frozen original code.
- 360,000-fight batch and artifacts succeeded. Browser visual QA and deeper JRPG parity remain residual engineering risks.
