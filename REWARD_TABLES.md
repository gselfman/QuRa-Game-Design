# QuRa Reward Tables v1

**Статус:** reward framework + initial hypotheses  
**Важно:** все числовые вероятности/amounts, если не помечены LOCKED, требуют Economy validation.

## 0. Reward principles

- server-authoritative;
- auditable;
- no silent loss;
- feature-gated;
- progression-aware;
- anti-arbitrage.

## 1. Reward types

- XP
- GE
- Tickets
- Gear
- Buff
- Chest
- Egg/Chicken
- Cosmetic
- Achievement/Medal

## 2. Level-up reward

Every level is reward moment.

Possible payload:
- chest;
- GE;
- ticket;
- gear;
- buff;
- special egg;
- cosmetic.

Exact per-level table OPEN until XP curve is locked.

## 3. Chest rarity hypothesis

Starting model:
- Common ~60%
- Rare ~28%
- Epic ~9%
- Legendary ~2.5%
- Artifact ~0.5%

For paid chest probabilities shown before purchase.

## 4. Chest tiers

### Basic Chest
Sources:
- daily/quest/early progression

Focus:
- Common/Rare gear
- common buffs
- small GE
- tickets

### Advanced Chest
Sources:
- weekly/mid progression
- paid option possible

Focus:
- Rare/Epic
- stronger buffs
- meaningful GE chance

### Arena Chest
Sources:
- season/Arena milestones

Focus:
- Arena gear
- tactical buffs
- cosmetics
- limited GE

### Legendary Chest
Rare source / expensive
Requires pity.

## 5. Progression pools

Player reward pool filtered by:
- chicken/gear level access;
- owned features;
- inventory;
- content availability.

Avoid stream of unusable L20 gear to L4 player.

Small aspirational preview allowed if overflow/equip rules clear.

## 6. Pity

Paid/high-value chest families need:
- pity counter;
- threshold;
- guaranteed minimum rarity;
- reset rule;
- visible or documented behavior.

Exact thresholds OPEN.

## 7. Duplicate handling

Gear duplicate:
- stored if capacity;
- overflow if full;
- future partial sell/trade-in.

No automatic deletion.

## 8. Overflow

If capacity full:
- reward entitlement recorded;
- OverflowPackage created;
- user can resolve;
- expiry policy shown.

Chicken/egg overflow uses «В гостях» flow.

## 9. Mini-game rewards

Each game has separate table.

Table fields:
- score/milestone
- reward
- probability if random
- daily cap
- global budget
- source_type

GE paid retry:
expected convertible reward value < price unless subsidized/capped.

## 10. Wolf game

Specific current reward matrix remains in mini-game-specific documentation/prototype.

Reward Tables references it rather than inventing new values.

## 11. Arena rewards

### Paid 2-player match
LOCKED:
- 10 GE entry each
- winner +15 GE
- system sink 5 GE

### Glory
Separate non-GE reward.

### Season
Can include:
- GE
- chest
- gear
- buffs
- cosmetics
- tickets
- medal/status

Exact season table OPEN.

## 12. Friendly rewards

No standard repeatable Arena payout/Glory.

Quest can grant one limited social reward.

## 13. Training rewards

No standard Glory.

Can give capped tutorial/quest reward.

## 14. Quest reward bands

No exact amounts yet.

### Easy daily
- small XP
- optional small GE/ticket

### Medium daily
- medium XP
- buff/basic chest

### Weekly
- larger XP
- chest
- GE under budget
- higher-tier buff

### Achievement
- milestone-specific
- cosmetic/item/chest/GE depending rarity

## 15. Buff reward pools

Common pool:
- Second Wind
- Stone Skin
- Adrenaline
- Charge

Rare:
- Battle Dome
- Battle Cry
- Shield Breaker
- Clear Mind

Epic:
- Double Power
- Silence
- Swap/Reform
- Mirror

Legendary candidate:
- Phoenix
- Special Echo
- powerful conditional effects

Final rarity by simulation.

## 16. Gear reward pool rules

Weight by:
- level;
- rarity;
- native archetype opportunities;
- duplicate rate;
- owned set completion.

Optional smart-drop:
slightly improve chance of useful item without guaranteeing set completion.

## 17. Egg/Chicken rewards

Can be:
- known archetype egg;
- mystery egg;
- special/seasonal egg.

Always enters as L1.

Never spawn adult directly unless special documented reward.

## 18. Ticket rewards

Ticket grant must respect stock cap or define overflow conversion/pending claim.

Default:
do not silently discard earned ticket; use reward pending if cap full or explicitly documented cap behavior.

## 19. GE rewards

Every GE reward:
- amount
- source_type
- budget bucket
- ledger record
- cap context

## 20. Reward correlation

Use correlation_id to enforce exactly-once reward delivery.

## 21. Random roll

Server:
- chooses table version;
- RNG;
- stores result;
- updates pity;
- grants.

Client only animates.

## 22. Paid chest disclosure

Show:
- price;
- probability by relevant rarity/reward class;
- pity if user-facing policy;
- duplicate possibility.

## 23. Reward table versioning

Any probability/amount change:
- new version;
- effective time;
- preserve historical audit.

## 24. Compensation

Operational compensation uses separate source:
COMPENSATION

Must not disguise compensation as random reward.

## 25. Reward analytics

Track:
- table/version
- expected value
- realized value
- rarity
- duplicates
- pity state
- source
- claim/overflow
- GE cost vs value

## 26. Production tables still to calibrate

- XP per quest
- XP level-up
- GE daily/weekly
- chest rates by tier
- pity thresholds
- season rewards
- passive laying
- item/buff drop weights

These are configuration tables, not missing mechanics.

