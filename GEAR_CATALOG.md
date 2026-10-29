# QuRa — каталог экипировки v1

**Статус:** каталог правил экипировки и шаблонов предметов  
**Источники:** Game Bible, Arena Spec, Dependency Graph

## 0. Принцип

Каждый combat property предмета обязан:
- иметь engine hook;
- иметь реальный эффект;
- иметь лимит/stacking;
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
- предмет на крыле или сумочка;
- shoes;
- skin/feathers;
- tail;
- badge/medal;
- aura.

Не все одновременно обязаны быть gameplay slots.

Final active slot set фиксируется после визуальный QA.

## 2. Level gates

- стандартный экипировка: min_level >= 4;
- можно носить предмет своего уровня и ниже;
- higher уровень blocked;
- особый предмет может игнорировать проверку уровня через `ignore_level_gate=true`, но взрослая форма L4+ обязательна.

## 3. Редкость

- Common
- Rare
- Epic
- Legendary
- Artifact

Rarity влияет на:
- scarcity;
- визуальный prestige;
- effect budget;
- drop rate;
- price band.

Rarity не является автоматическим combat multiplier.

## 4. Core combat stats

Разрешены:
- HP
- Атака
- Защита
- Скорость

## 5. Advanced effects

Разрешены только существующие hooks:
- Щит bonus
- Лечение bonus
- Манёвр урон modifier
- Особый приём урон modifier
- Особый приём щит modifier
- Особый приём лечение modifier
- Особый приём debuff modifier
- Особый приём получение заряда
- enemy уменьшение заряда
- next Атака boost
- next Атака weaken
- триггер выживания при явном описании механики

## 6. Запрещённые абстрактные stats

Без отдельной механики нельзя вводить:
- Intelligence
- Charisma
- Magic
- Accuracy
- Evasion
- Crit
- Особый приём Атака
- Особый приём Защита
- abstract Особый приём +X

## 7. Item schema

Каждая запись:
- id/code
- name
- уровень
- редкость
- category/slot
- визуальный description
- Крутость
- core stats
- advanced effects
- native archetype nullable
- set id nullable
- источник
- цена в GE при продаже
- drop availability
- asset id
- engine hooks
- BP contribution
- stacking/лимит notes

## 8. Native synergy

Если предмет родной для archetype:
- даёт explicit native effect;
- эффект действует постоянно, пока предмет экипирован;
- учитывается в BP;
- не должен делать предмет бесполезным другим archetypes.

## 9. Set thresholds

Комплект может задавать:
- 2-piece
- 4-piece
- 6-piece
- custom thresholds

Каждый threshold:
- named;
- explicit effect;
- лимит;
- engine hook.

## 10. Build diversity

Цель:
один archetype должен поддерживать >1 разумного build.

Примеры:

### Ryaba
- HP/Щит выживаемость
- Особый приём щит
- Атака hybrid

### Fighter
- Атака pressure
- Защита/counter
- next-hit setup

### Fool
- Скорость
- Манёвр/Атака
- controlled risk

### Professor
- charge control
- точность урон

### Monk
- HP/Защита
- лечение amplification

### Glamour
- Скорость/debuff
- Особый приём weaken

## 11. BP contribution

Permanent stats/effects → BP.

Временное срабатывание эффекта предмета:
- если эффект гарантированно действует, его вклад учитывается в BP;
- если эффект условный, BP использует ожидаемый вклад по симуляциям.

Точные веса рассчитываются после симуляций.

## 12. Скорость warning

Нельзя утверждать крупные бонусы Скорости до определения порядка действий в Arena.

## 13. Example Common items

### Соломенная шляпа
- L4
- Common
- Head
- +HP small
- Крутость small

### Простые ботинки
- L4
- Common
- Shoes
- +Скорость small

### Рабочий жилет
- L5
- Common
- Body
- +Защита small

### Кожаный ремешок
- L5
- Common
- Body/Accessory
- +Атака small

Точные значения ещё открыты.

## 14. Example Rare items

### Золотая брошь
- Rare
- +HP
- небольшой бонус Щита при наличии утверждённого механизма

### Боевые перчатки
- Fighter native
- +Атака
- native next-Атака boost modifier

### Очки аналитика
- Professor native
- +Скорость or control effect
- уменьшение заряда enhancement

### Чётки тишины
- Monk native
- +Защита
- лечение modifier

### Звёздные очки
- Glamour native
- +Скорость
- weaken modifier

### Башмачки «Авось»
- Fool native
- +Скорость
- Манёвр modifier

## 15. Legendary/Artifact design

Легендарный предмет должен:
- alter build;
- create trade-off or synergy;
- not simply stack huge raw stats.

Artifact may:
- ignore normal уровень gate;
- have unique визуальный;
- иметь один утверждённый уникальный эффект движка.

## 16. Крутость vs combat

Каждый предмет может иметь отдельно Крутость и боевые характеристики.

Крутость:
- collection/status.

Combat:
- Arena.

Это отдельные показатели.

## 17. Факторы цены

Ценовой диапазон зависит от:
- уровень;
- редкость;
- визуальный desirability;
- Крутость;
- simulated combat value;
- native synergy;
- set value.

## 18. Дубликаты и Arena-эксклюзивы

**LOCKED:** дубль продаваемого gear можно продать за **25% текущей магазинной GE-цены** (`duplicate_sellback_pct=25`), с серверным ledger; округление неделимых GE — OPEN. `arena_exclusive=true` имеет `sellback_pct=0`, не передаётся и не продаётся. Из Arena-сундука не выпадают магазинные предметы дороже 5×аренды.


## 19. Источники экипировки

- магазин
- сундук
- quest
- achievement
- season
- event
- promo
- legacy special

## 20. Visibility

Сопернику должны быть доступны для осмотра:
- visible equipped экипировка;
- relevant active постоянный effects.

Hidden combat stats from visible экипировка are discouraged.

## 21. Content production template

Для каждого предмета указать:
1. визуальный;
2. slot;
3. уровень;
4. редкость;
5. Крутость;
6. core stat;
7. advanced effect;
8. native/set relation;
9. engine hook;
10. BP;
11. источник;
12. price/drop;
13. asset.

## 22. Критерии приёмки

Предмет не проходит проверку, если:
- stat has no engine hook;
- effect duplicates another without purpose;
- creates dominant mandatory build;
- introduces hidden pay-to-win;
- breaks визуальный readability;
- has no clear источник/sink role.

## 23. Initial catalog production plan

Числовой каталог создаётся только после:
1. Скорость rule locked;
2. BP weights simulated;
3. active equipment slots visually validated;
4. economy price bands modeled.

