# QuRa — план реализации v1

**Статус:** implementation sequence from documentation to production

## 0. Цель

Ship QuRa game systems incrementally without:
- breaking financial product;
- creating unbounded GE issuance;
- duplicating Battle Engine;
- hardcoding balance in UI;
- shipping dead stats.

## 1. Documentation baseline

Completed core docs:
- GAME_BIBLE_V1.md
- ARENA_SPEC_V1.md
- GAME_DEPENDENCY_GRAPH.md
- GAME_DATA_MODEL.md
- ECONOMY_MODEL.md
- CHICKEN_CATALOG.md
- GEAR_CATALOG.md
- BUFF_CATALOG.md
- EVENT_CATALOG.md
- QUEST_CATALOG.md
- REWARD_TABLES.md
- SCREENS.md
- ASSET_PRODUCTION.md
- IMPLEMENTATION_ROADMAP.md

## 2. Этап A — Configuration Foundation

Backend:
- feature flags
- config/version tables
- GE/XP/Ticket ledgers
- Reward Ledger
- content definitions
- audit/correlation ids

Admin:
- feature flag controls
- reward config
- quest config
- economy config

DoD:
- server can grant XP/GE/reward exactly once
- all changes auditable

## 3. Этап B — Chicken/Data Foundation

Implement:
- ChickenArchetype
- ChickenInstance
- lifecycle
- personal naming
- main chicken
- XP/level
- Coop capacity

UI:
- chicken card
- rename
- Coop
- main selection

DoD:
- multiple instances same archetype
- unique personal names supported
- rename does not affect mechanics

## 4. Этап C — Quests and progression

Implement:
- quest definitions
- scopes
- progress events
- daily/weekly periods
- achievements
- feature gates

UI:
- Path
- daily
- weekly
- achievements

DoD:
- no duplicate ACCOUNT_ONCE
- CHICKEN_ONCE per instance
- XP goes correct chicken at completion

## 5. Этап D — Reward/Chest system

Implement:
- RewardDefinition
- RewardLedger
- chest roll
- pity
- overflow

UI:
- reward claim
- chest open
- overflow resolution

DoD:
- exactly-once delivery
- no lost reward on capacity full

## 6. Этап E — Inventory and Gear

Implement:
- GearDefinition
- GearInstance/stack model
- equipment
- slots
- set/native effects
- Coolness

Before numeric production:
- freeze Speed rule
- simulate BP weights

UI:
- shop
- item detail
- wardrobe
- compare
- try-on

DoD:
- every combat stat has engine hook
- BP calculated server-side

## 7. Этап F — Mini-game integration

Integrate existing mini-games with:
- tickets
- GE paid attempts
- reward tables
- anti-fraud
- buff drops

DoD:
- reward result server-authoritative
- daily caps
- paid EV guardrail

## 8. Этап G — Daily Events

Implement:
- global event selection
- Lucky Flip
- hard counters
- mitigation
- temporary modifiers

UI:
- News/Today
- personal outcome

DoD:
- event same globally
- personalized result deterministic
- never changes Coolness

## 9. Этап H — Battle Engine extraction

Before production Arena UI:
- extract deterministic engine
- define immutable battle snapshot
- actions
- statuses
- charge
- damage/heal/shield
- Wall pairing
- JRPG targeting

Close OPEN:
1. Speed resolution
2. JRPG retarget
3. multi-collision semantics
4. charge exact rules

DoD:
- engine pure/deterministic given seed/state/actions
- unit tests
- simulation harness

## 10. Этап I — Arena 1×1

Implement:
- Duel
- bot/training
- base actions
- Maneuver/Special
- Chronicle
- Hint

DoD:
- complete match
- replayable engine log
- no client-authoritative result

## 11. Этап J — Arena 2×2 / 3×3

Implement:
- team selection
- crests
- Wall
- JRPG
- 1×N states
- target UI
- action descriptions
- Chronicle literary layer

DoD:
- all pairings
- focus fire
- deaths
- remapping
- same-name disambiguation

## 12. Этап K — Online transport

Production architecture:
- authenticated rooms
- server-authoritative lock
- hidden actions
- command idempotency
- reconnect
- heartbeat/state sync

DoD:
- two-browser E2E
- packet loss/retry tests
- hidden state security

## 13. Этап L — Arena buffs

Implement:
- BuffDefinition
- inventory
- loadout
- activation windows
- processing priority

Start with small approved set:
- Double Power
- Invulnerability
- Last Feather
- Battle Dome
- Charge
- Swap

DoD:
- consumable transaction safe
- Chronicle integration
- telemetry

## 14. Этап M — Tactical services

Implement:
- Hint
- All-Seeing
- Autobattle
- async Scout

Requirements:
- shared engine
- no hidden live action access
- GE charging only after successful service result

DoD:
- deterministic simulations
- fairness tests

## 15. Этап N — экономика аренды Arena

Реализовать серверное списание аренды 10 GE/игрока в live (PROTOTYPE BALANCE) или 10 GE с атакующего в async, выдачу одного трёхъячеечного Arena-сундука победителю, ограничение призов одной паре, возврат при отмене/сбое, двойной KO без приза и выкуп продаваемого трофея за 25%. **Не реализовывать прежний payout 15 GE.** DoD: точная идемпотентность ArenaRentalFee и ArenaPrizeGrant, reconciliation, никаких переводов между игроками.


## 16. Этап O — Timer / Gods Lightning

Implement:
- 3-minute standard timer
- warnings
- technical loss
- FX
- Chronicle

4-player:
- 1-minute timeout
- random legal action

DoD:
- timer server-authoritative
- reconnect policy tested

## 17. Этап P — Ranked / Glory / Seasons

Implement:
- enrollment
- BP matchmaking
- Glory
- leagues
- anti-farm
- season
- top 3 medals
- Hall of Fame

DoD:
- repeat opponent guard
- rating rules
- season close snapshot

## 18. Этап Q — Async defense

Implement:
- defense team
- defensive strategy
- AI action source
- limited defense Glory
- async Scout

DoD:
- same Battle Engine
- no offline farming dominance

## 19. Этап R — Social

Implement:
- friends
- Friendly invite
- chat
- quick messages/emotes
- rematch
- report/mute
- Chronicle share

4-player later:
- All/Team/Private channels

## 20. Этап S — 4-player Arena

Only after 2-player stable.

Implement:
- FFA
- 2×2
- Wall/target variants
- 20 GE entry
- reward split after economy simulation

DoD:
- concurrency
- timeout random action
- private team chat
- settlement

## 21. Этап T — Passive laying

Implement only after Economy Model numbers approved.

- production formula
- caps
- Ryaba Gift
- Daily Event
- collection

DoD:
- emission dashboard
- anti-bot

## 22. Этап U — Legacy / 3D

Implement:
- L15 eligibility
- embodiment
- physical passport
- one-time heir claim
- heir generation
- capacity handling

## 23. Этап V — Content expansion

- seventh founder
- rare/seasonal chickens
- more gear
- more buffs
- 60–80 events
- character quest chains
- new mini-games

All through catalogs/config.

## 24. Admin tooling

Must support:
- archetypes
- gear
- buffs
- quests
- rewards
- chests
- events
- prices
- feature flags
- Arena balance
- season rules
- moderation

Avoid direct DB editing for live content.

## 25. Testing strategy

### Unit
- formulas
- ledgers
- state machines
- eligibility
- stacking

### Simulation
- Arena win rates
- BP weights
- gear value
- buff value
- GE EV

### Integration
- reward delivery
- feature flags
- mini-game
- Arena settlement

### E2E
- lifecycle
- naming
- gear
- quest
- Arena online
- reconnect
- paid flows

## 26. Arena simulation gates

Before production:
- no archetype gross dominance
- action distribution healthy
- Speed elasticity acceptable
- 1×3 comeback uncommon but real
- focus fire not automatic round-1 solve
- buff uplift bounded
- gear marginal values sane

## 27. Economy gates

Before launch:
- no positive arbitrage
- daily issuance budget
- paid chest EV checked
- Arena ledger balanced
- referral anti-fraud
- passive cap

## 28. Security/abuse

- authoritative server
- hidden moves
- input validation
- rate limit
- chat moderation
- name moderation
- reward idempotency
- anti-bot mini-games
- referral anti-fraud

## 29. Observability

Dashboards:
- GE source/sink
- Arena match health
- reconnect
- timeouts
- crash/error
- reward delivery
- quest completion
- item/buff usage
- win-rate balance

## 30. Rollout

Use feature flags.

Suggested:
1. internal
2. closed testers
3. training Arena
4. Friendly
5. limited paid Arena
6. ranked
7. async
8. expanded buffs/services
9. 4-player

## 31. Migration principle

Prototype is experiment.

Production:
- recreate logic in shared server engine;
- do not copy MQTT prototype architecture as backend.

## 32. Definition of Done for documentation-to-build transition

Ready to build when:
- core documents created;
- all LOCKED rules represented;
- OPEN decisions have owner/test;
- entities defined;
- engine hooks defined;
- economy unresolved numbers isolated as config;
- screens inventoried;
- assets specified.

## 33. Immediate next engineering decisions

Highest priority:
1. Speed model
2. multi-collision once-per-action semantics
3. JRPG retarget
4. Special charge table
5. BP weights
6. Arena draw/refund

These are not missing documentation; they are balance/implementation decisions requiring simulation.

## 34. Monetization + sprite production track

Sources: MONETIZATION_LIVEOPS_SPEC.md and SPRITE_PRODUCTION_BATCHES.md.

1. Confirm economy EV, GE real-world bonus liability, compliance for paid randomized rewards.
2. Implement Season Pass free track → premium entitlement.
3. Implement chest odds, pity, duplicate protection and exact-once reward claim.
4. Starter Bundle and non-intrusive contextual offers.
5. Golden Piggy Bank with clearly defined guaranteed reward and no blocking of earned GE.
6. Progressively produce 12 sheets (25 sprites each), upload to Figma, slice, QA and map by asset ID.
7. Add release gates for client/server consistency, pricing versions, refund logic and no pay-to-win.

**DoD:** every monetized item has a clear price, entitlement, source/sink, audit, cancellation/refund policy, and approved images; every asset has a stable Figma/component mapping.

## Обязательная корректировка MVP — B/A4

**Этот Roadmap — единственный источник порядка разработки.** Все шесть основательниц и Дары доступны и работают при запуске. Вместе с фундаментом должны работать: daily egg/яйценоскость Рябы, GE-магазин/скидка Гламурочки, ежедневные события и Lucky Flip Дурочки, Охрана Боевика, синергия Монаха, XP bonus Профессора, корм за полезные операции. Arena стартует с 1×1 live friend, bot training и async defense; 2×2 и 3×3 — видимые заблокированные карточки; 4-player — Future. Кланы — после запуска live friend. Полный производственный порядок и DoD пересматриваются по этим зависимостям, а не по старым номерам фаз.

## C. Обязательные этапы старта

В ранний MVP включить: корм (из успешных операций), все стартовые Дары и соответствующие системы, события с выбором, глобальную цель седьмой. Кланы — отдельный слой после рабочего боя с другом, с анти-фарм и moderation. Живой бой 1×1/бот/async — первыми форматами, 2×2/3×3 только витрина прогресса до следующей фазы, 4-player Future.
