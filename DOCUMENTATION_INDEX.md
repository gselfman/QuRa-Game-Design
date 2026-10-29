# QuRa Game Documentation Index

**Статус:** navigation / documentation map

## 1. Read order

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

## 2. Source of truth by subject

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

## 3. Current documentation status

Core documentation package: **complete v1**.

Some values intentionally remain OPEN because they require:
- simulation;
- financial/economy validation;
- visual QA;
- production technical decisions.

OPEN values are configuration/balance decisions, not missing architecture.

## 4. Highest-priority OPEN decisions

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

## 5. Change protocol

When a rule changes:
1. update source-of-truth spec;
2. update dependent docs;
3. version config/data;
4. update prototype/production;
5. add migration if required.

Do not allow code to silently become the only documentation.

