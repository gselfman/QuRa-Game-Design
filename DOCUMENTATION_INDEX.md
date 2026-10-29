# QuRa — индекс игровой документации

**Статус:** navigation / documentation map

## 1. Порядок чтения

1. **GAME_BIBLE_V1.md** — overall product/game truth
2. **ARENA_SPEC_V1.md** — combat/Arena truth
3. **GAME_DEPENDENCY_GRAPH.md** — cross-system dependencies
4. **GAME_DATA_MODEL.md** — entities/state machines/audit
5. **ECONOMY_MODEL.md** — resources, GE sources/sinks, pricing architecture, EV and guardrails
6. **ECONOMY_CALIBRATION_2026-10.md** — real-user GE accrual calibration and time-to-goal
7. **CHICKEN_CATALOG.md** — archetypes, naming, Gifts, Maneuver, Special
8. **GEAR_CATALOG.md** — equipment rules and engine-linked stats
9. **BUFF_CATALOG.md** — preparation/tactical buff system
10. **EVENT_CATALOG.md** — Daily Event content framework
11. **QUEST_CATALOG.md** — scopes, triggers and quest templates
12. **REWARD_TABLES.md** — reward/chest/pity framework
13. **SCREENS.md** — complete screen/flow inventory
14. **ASSET_PRODUCTION.md** — visual asset production requirements
15. **IMPLEMENTATION_ROADMAP.md** — build sequence and rollout

### Дополнения аудита 29.10.2026

- **RETENTION_NOTIFICATIONS.md** — Telegram/PWA push, триггеры, частота, стрики, метрики.
- **ARENA_SIMULATION_RESULTS.md** — методика расчётов, статус тестов и незакрытые численные решения.
- **DOC_FIX_AUDIT_REPORT_2026-10-29.md** — сводный отчёт, статусы пунктов A–E и список OPEN.

## 2. Источники истины по темам

### Overall game
GAME_BIBLE_V1.md

### Arena mechanics
ARENA_SPEC_V1.md

### Cross-system relations
GAME_DEPENDENCY_GRAPH.md

### Database/entities/state
GAME_DATA_MODEL.md

### Economy
ECONOMY_MODEL.md

### Economy calibration / real observed earning pace
ECONOMY_CALIBRATION_2026-10.md

### Chicken definitions
CHICKEN_CATALOG.md

### Gear
GEAR_CATALOG.md

### Buffs
BUFF_CATALOG.md

### Daily events
EVENT_CATALOG.md

### Quests
QUEST_CATALOG.md

### Rewards/chests
REWARD_TABLES.md

### UX/screens
SCREENS.md

### Visual production
ASSET_PRODUCTION.md

### Engineering sequence
IMPLEMENTATION_ROADMAP.md

## 3. Текущий статус документации

Core documentation package: **complete v1**.

Some values intentionally remain OPEN because they require:
- simulation;
- financial/economy validation;
- visual QA;
- production technical decisions.

OPEN values are configuration/balance decisions, not missing architecture.

## 4. Приоритетные открытые решения

Arena:
- Speed resolution
- JRPG retarget
- multi-collision effect scope
- Special charge exact table
- BP weights
- draw/double-KO settlement

Economy:
- XP curve
- gear prices
- Coop prices
- tactical service prices
- passive laying cap
- chest pity
- 4-player payout

Content:
- seventh founder mechanics
- full 60–80 event authored batch
- numeric Gear Catalog
- full reward numeric tables

## 5. Протокол изменений

1. Сначала правится документ-источник истины.
2. Затем все зависимые документы и таблицы.
3. Изменения логики разделяются на блоки и отдельные ветки/PR.
4. Изменение конфигурации и данных фиксируется версией.
5. Прототип и production меняются отдельно, только после соответствующего решения и тестирования.
6. При миграции готовится сценарий перехода и обратного восстановления.

Нельзя допускать, чтобы поведение в коде незаметно отличалось от документов.


## 6. Новые утверждённые системы (29.10.2026)

- **MONETIZATION_LIVEOPS_SPEC.md** — Season Pass, chests/odds/pity, Golden Piggy Bank, starter bundle, personal offers, fintech earning paths and fairness.
- **SPRITE_PRODUCTION_BATCHES.md** — 12 ready-to-generate 5×5 sheets, 300 named assets, Figma slicing/QA contract.

Both are part of v1 documentation and should be read after ECONOMY_MODEL.md and ASSET_PRODUCTION.md respectively.

## 7. Аудит и дополнения 29.10.2026

| Блок | Документы | Статус |
|---|---|---|
| A | Bible, Arena, Economy, Rewards, Graph, Data, Gear, Screens | исправления правил представлены в отдельном PR |
| B | Retention, Simulation, Chicken, 3D, Data, Sprite | документация; код и массовая симуляция ещё не готовы |
| C | Feed, Clan, Community, 20 Daily Events | механики документированы |
| D | Economy calibration, Shop index, Arena sink | проверка и расчёт |
| E | согласование источников истины и русских разделов | редакционная вычитка |

Новые файлы: **RETENTION_NOTIFICATIONS.md**, **ARENA_SIMULATION_RESULTS.md**. Приоритеты: Chicken/Gear/Anchors P0, универсальные листы только после Figma-аудита.

## 8. Единая иерархия источников истины

1. Общая модель продукта — **GAME_BIBLE_V1.md**.
2. Бой и Arena — **ARENA_SPEC_V1.md**.
3. Межсистемные зависимости — **GAME_DEPENDENCY_GRAPH.md**.
4. Сущности и данные — **GAME_DATA_MODEL.md**.
5. Экономика и цены — **ECONOMY_MODEL.md** (production-пакеты всегда из backend runtime).
6. Содержимое игровых каталогов — соответствующие каталоги (CHICKEN/GEAR/BUFF/EVENT/QUEST/REWARD).
7. Этапы реализации — **IMPLEMENTATION_ROADMAP.md**, единственный Roadmap.
8. Визуальные ассеты — **ASSET_PRODUCTION.md** и **SPRITE_PRODUCTION_BATCHES.md**.
9. Удержание — **RETENTION_NOTIFICATIONS.md**; тестирование баланса — **ARENA_SIMULATION_RESULTS.md**.

**Открытые вопросы:** Speed, multi-collision, JRPG retarget, level→power (две модели), юрлицо/доставка/возврат 3D, общий сезон 28 дней vs два цикла, N для седьмой, сохранение/сброс тестовой Рябы, округление 25% выкупа.

## Второй проход P1–P8

Основной план исправлений: `QURA_GAME_DOCS_PASS2_INSTRUCTION.md` (предоставлен в задаче). Цепочка PR P1→P2→P3→P4→P5→P6→P8→P7 на базе `docs/fix-2026-10-29-E`; PR A–E ещё не объединены в main. Актуальная проверка: `DOC_FIX_AUDIT_REPORT_2026-10-29.md` раздел «Второй проход».

**OPEN:** стоимость/награда fallback-бота, награда защитника XP, фактические референсы шести героинь, полная стоимость/юнит-экономика 3D, рост уровня, BP weights, параметры сезонности, CommunityGoal N, продакшен-ready симуляции. **LOCKED:** D-19 random async opponent, D-20 CARD+FX.
