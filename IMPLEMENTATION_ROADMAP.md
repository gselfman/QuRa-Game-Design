# QuRa Game Implementation Roadmap v1

**Статус:** implementation sequence from documentation to production

## 0. Goal

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

## 2. Phase A — Configuration Foundation

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

## 3. Phase B — Chicken/Data Foundation

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

## 4. Phase C — Quests and progression

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

## 5. Phase D — Reward/Chest system

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

## 6. Phase E — Inventory and Gear

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

## 7. Phase F — Mini-game integration

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

## 8. Phase G — Daily Events

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

## 9. Phase H — Battle Engine extraction

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

## 10. Phase I — Arena 1×1

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

## 11. Phase J — Arena 2×2 / 3×3

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

## 12. Phase K — Online transport

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

## 13. Phase L — Arena buffs

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

## 14. Phase M — Tactical services

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

## 15. Phase N — Arena economy

Implement:
- 10 GE entry
- 15 GE winner payout
- 5 GE sink
- refunds
- cancellation
- double KO rule
- timeout settlement

DoD:
- ledger reconciliation
- no partial debit
- server incident refunds

## 16. Phase O — Timer / Gods Lightning

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

## 17. Phase P — Ranked / Glory / Seasons

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

## 18. Phase Q — Async defense

Implement:
- defense team
- defensive strategy
- AI action source
- limited defense Glory
- async Scout

DoD:
- same Battle Engine
- no offline farming dominance

## 19. Phase R — Social

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

## 20. Phase S — 4-player Arena

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

## 21. Phase T — Passive laying

Implement only after Economy Model numbers approved.

- production formula
- caps
- Ryaba Gift
- Daily Event
- collection

DoD:
- emission dashboard
- anti-bot

## 22. Phase U — Legacy / 3D

Implement:
- L15 eligibility
- embodiment
- physical passport
- one-time heir claim
- heir generation
- capacity handling

## 23. Phase V — Content expansion

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

