# QuRa Event Catalog v1

**Статус:** content framework for Daily Events  
**Target volume:** 60–80 base events + variants

## 0. Global rule

One global event per day for all users.

Individual result differs due:
- Gifts;
- counters;
- mitigation;
- collection state.

Daily Event never changes Coolness.

## 1. Resolution order for negative event

1. global event selected
2. Lucky Flip
3. hard counter
4. mitigation
5. final temporary modifier

## 2. Categories

- weather
- threats
- food/harvest
- outside world
- internal Coop
- rare/magical

## 3. Event fields

- code
- title
- category
- rarity
- cooldown
- negative/positive
- base narrative
- narrative variants
- base effect
- Lucky Flip alternative
- hard counters
- mitigation hooks
- duration
- affected systems
- feature gates

## 4. Allowed affected systems

- passive laying
- game shop/discount
- XP bonus
- drop chance
- Arena temporary stats
- tickets/rewards
- future explicit systems

Not:
- permanent Coolness
- permanent gear stat
- financial transaction status

## 5. Weather examples

### HEAVY_RAIN
Base:
Курятник подтопило.
Effect:
passive laying -10% hypothesis.

Lucky Flip:
после дождя вылезли черви → positive laying +5%.

Mitigation:
future shelter/gear/building.

### FROST
Base:
холод slows production.
Possible:
laying down / temporary event.

Counter:
warm Coop upgrade/future effect.

### HEAT
Base:
жара снижает активность.
Possible effect:
temporary production penalty.

### PERFECT_SUN
Positive:
production/XP minor bonus.

## 6. Threat examples

### FOX_AT_NIGHT
Negative threat.
Boevik Gift may hard-counter.

Possible result:
reward loss prevention / temporary penalty avoided.

### RAT_RAID
Threat to storage/reward.
Counter:
Boevik protection.

### STRAY_DOG
Threat event.
Could yield branch:
fight off / lost supplies / found friend future.

## 7. Food/harvest

### GRAIN_DELIVERY
Positive:
temporary laying boost.

### BAD_FEED
Negative:
production down.

### GOLDEN_CORN
Rare:
small buff/chest chance.

## 8. Outside world

### FAIR_DAY
Shop discount/category bonus.

### TRAVELLING_MERCHANT
Temporary catalog/price modifier.

### NEWS_FROM_CITY
XP/quest thematic modifier.

## 9. Internal Coop

### CLEAN_COOP
Positive synergy.

### ARGUMENT
Temporary synergy penalty, Monk mitigation possible.

### BIRTHDAY
Reward/social event.

### LOST_ITEM
Can trigger mini quest/reward.

## 10. Rare/magical

### GOLDEN_MOON
Rare laying/drop bonus.

### FALLING_STAR
Chance special chest/buff.

### STRANGE_FOG
Mystery temporary modifier.

### BLESSING_DAY
Monk synergy interaction.

## 11. Lucky Flip examples

Negative → separate positive story, not merely zero.

### Rain
Flood → worms feast.

### Broken cart
Supplies delayed → rare item found under cart.

### Fox tracks
Threat → chickens discover hidden stash while hiding.

### Wind
Roof damaged → old hidden chest exposed.

Each flip is authored, not generic.

## 12. Hard counters

Gift families can hard-counter category.

Boevik:
- threat protection.

Future archetypes/buildings may counter:
- weather;
- food;
- magic.

Do not create counter if no system hook.

## 13. Mitigation

Mitigation reduces final penalty.

Possible sources:
- Monk Grace if approved for event family;
- building;
- set;
- temporary event item.

Must have cap.

## 14. Rarity

Suggested:
- Common
- Uncommon
- Rare
- Epic

No exact percentages yet.

Need cooldown preventing repetition.

## 15. Content target

Target library:
- 20 weather/food
- 15 threat
- 15 internal
- 15 outside world
- 10 rare/magical

Can overlap to total 60–80.

## 16. Narrative variants

Each base event:
- 2–3 wording variants;
- character reaction hooks.

Variation should not change mechanics unless explicitly variant-coded.

## 17. Reward integration

Events can grant:
- GE small capped
- chest
- buff
- ticket
- XP
- item
- temporary modifier

All server-authoritative.

## 18. Arena interaction

If Daily Event affects Arena:
- temporary;
- visible;
- not in BP;
- snapshot at match start.

Avoid large daily modifier that invalidates matchmaking.

## 19. Event analytics

Track:
- event shown;
- base vs flip;
- counter source;
- mitigation;
- final effect;
- reward;
- engagement reaction.

## 20. Feature gates

Event referencing disabled product feature must not be selected.

## 21. Authoring template

For every event:
1. code
2. title
3. category
4. rarity
5. story
6. base effect
7. negative?
8. Lucky Flip
9. counter
10. mitigation
11. duration
12. reward
13. variants
14. analytics tags

## 22. Production rule

This document defines framework and examples.

Full 60–80 authored rows should be generated as content production batch after Data Model/admin tooling, not hardcoded in client.


## 23. Pass 2 — 20 authored event cards (P5)

The rows below are **design-ready event definitions**, not approved numeric payouts. Server config owns amount, duration, frequency, eligibility and caps. Each negative event must specify Lucky Flip and explicit counter/mitigation hooks before activation. No event creates GE merely for logging in.

| ID | Player-facing event (RU) | Category | Resolution and eligible hooks |
|---|---|---|---|
| HEAVY_RAIN | Проливной дождь | Weather | Temporary production loss; Lucky Flip: worms after rain; weather protection |
| FROST | Первый заморозок | Weather | Temporary output penalty; warm-coop mitigation |
| HEAT | Жаркий полдень | Weather | Temporary activity loss; shade/water mitigation |
| PERFECT_SUN | Солнечное утро | Weather | Capped temporary production boost |
| FOX_AT_NIGHT | Лиса у курятника | Threat | Potential supply loss; Боевик counters; flip: hidden cache |
| RAT_RAID | Крысы в амбаре | Threat | Storage pressure; protection counter; flip: recovered grain |
| STRAY_DOG | Незваный пёс | Threat | Short defense task/penalty; protection counter; flip: found supplies |
| GRAIN_DELIVERY | Привезли зерно | Harvest | Capped temporary production boost |
| BAD_FEED | Неудачный корм | Harvest | Temporary production loss; feed-quality mitigation; flip: ingredient for quest |
| GOLDEN_CORN | Золотая кукуруза | Harvest | Rare chance at predefined non-GE reward |
| FAIR_DAY | Ярмарочный день | Outside | Configured category discount with purchase limit |
| TRAVELLING_MERCHANT | Странствующий торговец | Outside | Rotating shop offer, normal entitlement checks |
| NEWS_FROM_CITY | Вести из города | Outside | Specific quest progress or capped XP modifier |
| CLEAN_COOP | Большая уборка | Coop | Capped temporary synergy boost |
| ARGUMENT | Ссора на насесте | Coop | Temporary synergy reduction; Монах mitigation; flip: reconciliation bonus |
| BIRTHDAY | День рождения курочки | Coop | One-per-instance celebration quest/reward |
| LOST_ITEM | Потерянная вещица | Coop | Limited mini-quest; idempotent item reward; flip: rare find |
| GOLDEN_MOON | Золотая луна | Magical | Rare bounded laying/drop modifier |
| FALLING_STAR | Падающая звезда | Magical | Server-rolled chest/buff from bounded reward table |
| STRANGE_FOG | Таинственный туман | Magical | Temporary mystery modifier; flip: discover cache |

**Production checklist per row:** stable event ID; RU and EN copy; common daily event seed; variant; audience; exact affected stat; formula and cap; duration; counter; mitigation; Lucky Flip if negative; reward table and budget; version; audit tags; moderation and accessibility review. `BLESSING_DAY` remains an additional example outside this 20-card starter set. Approval of these rows does **not** mean the broader 60–80 event content target is complete.
