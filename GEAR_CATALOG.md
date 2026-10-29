# QuRa Gear Catalog v1

**Статус:** каталог правил экипировки и шаблонов предметов  
**Источники:** Game Bible, Arena Spec, Dependency Graph

## 0. Принцип

Каждый combat property предмета обязан:
- иметь engine hook;
- иметь реальный эффект;
- иметь cap/stacking;
- входить в BP, если постоянный;
- быть понятным игроку.

## 1. Базовые слоты

Визуальные категории:
- head;
- eyes;
- ears;
- neck;
- scarf;
- body/armor;
- wing-item/bag;
- shoes;
- skin/feathers;
- tail;
- badge/medal;
- aura.

Не все одновременно обязаны быть gameplay slots.

Final active slot set фиксируется после visual QA.

## 2. Level gates

- стандартный gear: min_level >= 4;
- можно носить предмет своего уровня и ниже;
- higher level blocked;
- special item может иметь ignore_level_gate=true, но adult form L4+ обязательна.

## 3. Rarity

- Common
- Rare
- Epic
- Legendary
- Artifact

Rarity влияет на:
- scarcity;
- visual prestige;
- effect budget;
- drop rate;
- price band.

Rarity не является автоматическим combat multiplier.

## 4. Core combat stats

Разрешены:
- HP
- Attack
- Defense
- Speed

## 5. Advanced effects

Разрешены только существующие hooks:
- Shield bonus
- Heal bonus
- Maneuver damage modifier
- Special damage modifier
- Special shield modifier
- Special heal modifier
- Special debuff modifier
- Special charge gain
- enemy charge reduction
- next Attack boost
- next Attack weaken
- survival trigger if explicitly defined

## 6. Запрещённые абстрактные stats

Без отдельной механики нельзя вводить:
- Intelligence
- Charisma
- Magic
- Accuracy
- Evasion
- Crit
- Special Attack
- Special Defense
- abstract Special +X

## 7. Item schema

Каждая запись:
- id/code
- name
- level
- rarity
- category/slot
- visual description
- Coolness
- core stats
- advanced effects
- native archetype nullable
- set id nullable
- source
- GE price if sold
- drop availability
- asset id
- engine hooks
- BP contribution
- stacking/cap notes

## 8. Native synergy

Если предмет родной для archetype:
- даёт explicit native effect;
- effect permanent while equipped;
- учитывается в BP;
- не должен делать предмет бесполезным другим archetypes.

## 9. Set thresholds

Set can define:
- 2-piece
- 4-piece
- 6-piece
- custom thresholds

Каждый threshold:
- named;
- explicit effect;
- cap;
- engine hook.

## 10. Build diversity

Цель:
один archetype должен поддерживать >1 разумного build.

Examples:

### Ryaba
- HP/Shield sustain
- Special shield
- Attack hybrid

### Fighter
- Attack pressure
- Defense/counter
- next-hit setup

### Fool
- Speed
- Maneuver/Attack
- controlled risk

### Professor
- charge control
- precision damage

### Monk
- HP/Defense
- heal amplification

### Glamour
- Speed/debuff
- Special weaken

## 11. BP contribution

Permanent stats/effects → BP.

Temporary proc from item:
- if deterministic/always available, expected permanent value enters BP;
- if conditional, BP uses simulated expected marginal value.

Exact weights after simulation.

## 12. Speed warning

Do not finalize high Speed values before Arena Speed resolution is frozen.

## 13. Example Common items

### Соломенная шляпа
- L4
- Common
- Head
- +HP small
- Coolness small

### Простые ботинки
- L4
- Common
- Shoes
- +Speed small

### Рабочий жилет
- L5
- Common
- Body
- +Defense small

### Кожаный ремешок
- L5
- Common
- Body/Accessory
- +Attack small

Exact numbers TBD.

## 14. Example Rare items

### Золотая брошь
- Rare
- +HP
- small Shield bonus if hook approved

### Боевые перчатки
- Fighter native
- +Attack
- native next-Attack boost modifier

### Очки аналитика
- Professor native
- +Speed or control effect
- charge reduction enhancement

### Чётки тишины
- Monk native
- +Defense
- heal modifier

### Звёздные очки
- Glamour native
- +Speed
- weaken modifier

### Башмачки «Авось»
- Fool native
- +Speed
- Maneuver modifier

## 15. Legendary/Artifact design

Legendary should:
- alter build;
- create trade-off or synergy;
- not simply stack huge raw stats.

Artifact may:
- ignore normal level gate;
- have unique visual;
- have one unique approved engine effect.

## 16. Coolness vs combat

Every item can have Coolness and combat values.

Coolness:
- collection/status.

Combat:
- Arena.

They are separate columns.

## 17. Pricing inputs

Price band from:
- level;
- rarity;
- visual desirability;
- Coolness;
- simulated combat value;
- native synergy;
- set value.

## 18. Duplicate policy

Duplicates occupy inventory unless equipped.

Future options:
- sell back;
- trade-in;
- conversion.

If sell-back enabled, value < original purchase expected value.

## 19. Gear source types

- shop
- chest
- quest
- achievement
- season
- event
- promo
- legacy special

## 20. Visibility

Opponent should be able to inspect:
- visible equipped gear;
- relevant active permanent effects.

Hidden combat stats from visible gear are discouraged.

## 21. Content production template

For every item define:
1. visual;
2. slot;
3. level;
4. rarity;
5. Coolness;
6. core stat;
7. advanced effect;
8. native/set relation;
9. engine hook;
10. BP;
11. source;
12. price/drop;
13. asset.

## 22. Acceptance test

An item fails if:
- stat has no engine hook;
- effect duplicates another without purpose;
- creates dominant mandatory build;
- introduces hidden pay-to-win;
- breaks visual readability;
- has no clear source/sink role.

## 23. Initial catalog production plan

Create numeric catalog only after:
1. Speed rule locked;
2. BP weights simulated;
3. active equipment slots visually validated;
4. economy price bands modeled.

