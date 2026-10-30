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

## T3 — фактические экспериментальные результаты, версия v0.1 (НЕ LOCKED)

**Критическое исправление:** в T2 `equilibrium.evaluate()` знак HP-payoff был инвертирован (ИИ предпочитал получать урон). Матрица 360 000 боёв T2 — только исторический baseline старого невалидного для оптимальной игры алгоритма, а не основание утверждать balance. Исправлен в ветке T3; все дальнейшие сравнения должны использовать исправленную оценку.

- Mirror A/B: https://github.com/gselfman/QuRa-Game-Design/actions/runs/41119729709 — 24 000 боёв, 2 политики equal Speed × 6 основательниц × 2000, fixed seed. Данные `results/arena-t3-mirror-payoff-corrected-20261030.csv`. При simultaneous equal-speed 6/6 зеркальных матчей 45–55%, однако Ряба 54.15% первой стороны; это не доказательство полной нейтральности.
- Five-rule variants + double-KO tiebreak: https://github.com/gselfman/QuRa-Game-Design/actions/runs/41120387647 (green); `results/arena-t3-five-rule-variants-20261030.csv`. В выборке 1500 боёв на вариант + 500 3×3 на вариант; 5 различных упорядоченных пар (включая зеркала). Это focused experiment, не все 36 пар и не 10 000 на пару.

| Эксперимент | 1×1 медиана | Special/бой | Доля Защиты | Двойной KO | Ничейный исход | 3×3 медиана |
|---|---:|---:|---:|---:|---:|---:|
| Simultaneous baseline, fixed payoff | 6 | 1.434 | 37.00% | 11.8% | 11.8% | 8 |
| Sequential attack ordering | 6 | 1.426 | 37.28% | 5.13% | 5.13% | 8 |
| Accelerated charge 40/20/25 | 7 | 2.009 | 35.75% | 10.27% | 10.27% | 8 |
| Double-KO tie-break: pre-round HP, seeded coin if equal | 6 | 1.434 | 37.00% | 11.8% | 0% | 8 |
| Multi-collision once-per-action policy | 6 | 1.434 | 37.00% | 11.8% | 11.8% | 8 |

Оставлены отдельно **физическая частота двойных KO** и **частота незавершённого ничейного результата**: tie-break делает 0% незавершённых ничьих в этом эксперименте, но не уменьшает сами 11.8% двойных KO.

### Предварительные решения для проверки следующей матрицей

- **Скорость:** simultaneous предпочтительна из-за более последовательного скрытого выбора; последовательная уменьшает двойной KO, но это не отменяет нужду в tie-break. Проверка JRPG полного simultaneous ещё отсутствует.
- **Multi-collision:** once-per-action выглядит логичнее; 3×3 нерешённые исходы 6.0% → 4.8% в данной выборке, но защита/заряд и 1×N требуют более широкого теста.
- **JRPG auto-retarget vs lost:** в 1000 принудительных сценариях погибшей цели автоцель позволила 1000 переназначений и 33 000 суммарного урона; lost-action — 1000 потерянных действий и 0 урона. Это диагностический крайний случай, НЕ оценка частоты в реальной игре.
- **Charge 35/15/20:** исходная таблица в данном сценарии достигает 1.434 Special/бой и медиану 6, быстрее 40/20/25 выходит за условный максимум 2.0 Special и замедляет бой; исходная предпочтительна.
- **Double-KO:** событие 11.8% превышает порог 2%; экспериментальный честный тай-брейк по доле HP перед последним раундом, затем seeded 50/50, даёт 0% неразрешённых ничьих без изменения числа фактических двойных KO. Перед LOCK нужен тест side bias, распределения побед, BP и противников.

**Статус:** ни одно из пяти правил НЕ переведено в LOCKED по симуляции до полного покрытия T3. Т3 всё ещё WIP, PR #17 draft. Цели T4 по параметрам курочек и экипировке не затрагивались.

## T3 — полная матрица после исправления equilibrium payoff

**Доказательство:** https://github.com/gselfman/QuRa-Game-Design/actions/runs/41120368747, CI `success`; 36 упорядоченных пар × 10 000 боёв = 360 000; `equilibrium` vs `equilibrium`, fixed seed 20261030, равная Скорость в двух Манёврах разрешается одновременно. Ещё 10 000 3×3. Файл: `results/arena-t3-corrected-matrix-360k-20261030.csv`. Режим **не является новым утверждённым default** (пока переключается через `--equal-speed simultaneous`).

### Матрица побед A (ничья засчитывается как 0,5)

| A / B | Ряба | Боевик | Дурочка | Профессор | Монах | Гламурочка |
|---|---:|---:|---:|---:|---:|---:|
| Ряба | 51.86 | 47.21 | 54.15 | 51.38 | 57.58 | 52.45 |
| Боевик | 52.35 | 49.87 | 59.07 | 57.67 | 52.14 | 59.36 |
| Дурочка | 47.01 | 41.51 | 50.19 | 51.40 | 46.89 | 53.51 |
| Профессор | 49.79 | 42.20 | 49.35 | 49.93 | 49.07 | 48.69 |
| Монах | 44.15 | 50.44 | 55.59 | 51.64 | 51.80 | 54.33 |
| Гламурочка | 48.41 | 40.85 | 46.78 | 51.93 | 47.93 | 49.65 |

Средние по остальным пяти (без зеркала): Ряба 52.55%, Боевик **56.12%** (выше 55%), Дурочка 48.06%, Профессор 47.82%, Монах 51.23%, Гламурочка 47.18%. Худшая упорядоченная пара: Гламурочка против Боевика 40.85% (граница 40/60 не нарушена, а Боевик против Гламурочки 59.36%). Зеркала: 49.65–51.86% в полном прогоне.

| Цель | T3 corrected baseline | Вердикт |
|---|---:|---|
| Все основательницы 45–55% vs остальные | 47.18–56.12% | FAIL Боевик |
| Худшая пара ≥40/60 | 40.85% min, 59.36% max | PASS с небольшим запасом |
| Медиана 1×1 5–6 | 30/36 пар 5–6; у Рябы и Монаха есть 7–8 | PARTIAL |
| 3×3 6–12 раундов | медиана 8; среднее ~8.10 для одной композиции | PASS в проверенном составе |
| Доли четырёх действий 10–40% | Attack 33.58%, Defend 39.50%, Maneuver 16.96%, Special **9.97%** | MARGINAL FAIL Special |
| Special 1–2 применения/бой 1×1 | среднее по 36 парам 1.257 | PASS в среднем |
| Доля ничейного результата | среднее 13.16% | FAIL, нужен tie-break |
| 1×2/1×3 comeback, эластичность Speed, уровни, BP, стартовая экипировка, async exploit | ещё не проверены | OPEN T3/T4/T5 |

### Данные, необходимые для завершения T3

1. Проверить симметрию side-swap / paired seeds, особенно R mirror 51.86%, и приближённый Nash exploitability. Отсутствие сильного зеркального перекоса само по себе не доказывает равновесие.
2. Дополнить варианты для **полного JRPG simultaneous** и живых сценариев фокус-атаки. Forced dead-target тест не заменяет игровую выборку.
3. Окончательно проверить действие/столкновение на многократное лечение, щит, заряд, debuff, не только на повторный Special.
4. Для double KO сравнить tie-break по HP до последнего раунда и fairness на всех героях, не только на пяти парах.
5. Только после выполнения критериев фиксировать `LOCKED по симуляции vX` в ARENA_SPEC и менять default. Ни один числовой коэффициент героинь пока не утверждён.

**T3 на текущем этапе остаётся draft/OPEN; T4 пока не начинается.**
