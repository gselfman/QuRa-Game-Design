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

**Новый обязательный первый шаг:** игрок выбирает один из двух вариантов (`options[2]`), каждый вариант определяет свой исход, Lucky Flip и доступные Дары. Затем Lucky Flip → hard counter → mitigation → final temporary effect. Выбор до конца московских суток; A — явно обозначенный default.

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

Каждый event содержит ровно `options[2]` с `code`, `title`, `narrative`, `outcome`, `gift_hooks`, `lucky_flip`, `mitigation`.

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


## C4. Первая авторская партия из 20 событий с двумя выборами

Все численные шансы, GE и силу эффектов — **OPEN / PROTOTYPE BALANCE**. Для каждого события единая цепочка: `choice → Lucky Flip → hard counter → mitigation → final temporary effect`. Выбор до 23:59:59 МСК; без решения используется A как default, дополнительного штрафа нет. У каждого варианта свой narrative и свой набор eligible effects; поля `options[2]`: `code,title,narrative,outcome_family,lucky_flip_variant,gift_hooks,mitigation_hooks`.

### EV01 — Лиса у забора (УГРОЗА)

- **Вариант A (default):** Спрятать яйца — сохранить яйца, потерять возможность небольшой награды.
- **Вариант B:** Выставить охрану — шанс отпугнуть лису и найти забытый мешок зерна.
- **Дар/контрмеры:** Охрана Боевика снижает угрозу. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV02 — Гроза над Курятником (ПОГОДА)

- **Вариант A (default):** Закрыть ставни — временная защита насестов.
- **Вариант B:** Собрать дождевую воду — полезная вода, но риск промокнуть.
- **Дар/контрмеры:** защита/смягчение. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV03 — Подарок от ветра (ПОГОДА)

- **Вариант A (default):** Поймать свёрток — шанс на маленький buff.
- **Вариант B:** Укрепить крышу — временная устойчивость Курятника.
- **Дар/контрмеры:** случайная находка. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV04 — Знойный полдень (ПОГОДА)

- **Вариант A (default):** Устроить тень — поддержать яйценоскость.
- **Вариант B:** Искать прохладу у ручья — шанс особой награды и задержка.
- **Дар/контрмеры:** временный эффект. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV05 — Первый снег (ПОГОДА)

- **Вариант A (default):** Утеплить гнёзда — уменьшить штраф холода.
- **Вариант B:** Прокатиться по снегу — развлечение / случайный сувенир.
- **Дар/контрмеры:** смягчение. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV06 — Мыши в кладовой (УГРОЗА)

- **Вариант A (default):** Защитить запасы — снизить риск потерь.
- **Вариант B:** Оставить приманку — шанс найти тайник.
- **Дар/контрмеры:** Боевик. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV07 — Сорока украла блёстки (УГРОЗА)

- **Вариант A (default):** Прогнать сороку — избежать косметического ущерба.
- **Вариант B:** Пойти по следу — шанс добыть украшение.
- **Дар/контрмеры:** Lucky Flip. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV08 — Ночные шорохи (УГРОЗА)

- **Вариант A (default):** Поставить караул — противодействие угрозе.
- **Вариант B:** Проверить норы — шанс получить редкую подсказку.
- **Дар/контрмеры:** Боевик. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV09 — Волшебное зерно (КОРМ)

- **Вариант A (default):** Посеять семечко — бонус к будущему урожаю.
- **Вариант B:** Скормить сразу — малый немедленный временный бонус.
- **Дар/контрмеры:** Ряба. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV10 — Приехал мельник (КОРМ)

- **Вариант A (default):** Обменять зерно — получить обычный корм.
- **Вариант B:** Устроить дегустацию — шанс вдохновить курочек.
- **Дар/контрмеры:** корм и синергии. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV11 — Кукурузная находка (КОРМ)

- **Вариант A (default):** Поделиться всей фермой — командный временный позитивный эффект.
- **Вариант B:** Спрятать для завтра — бонус к следующему событию.
- **Дар/контрмеры:** Монах. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV12 — Сломанная телега (ВНЕШНИЙ МИР)

- **Вариант A (default):** Починить колесо — полезная помощь и XP-прогресс.
- **Вариант B:** Проверить под телегой — шанс сундука.
- **Дар/контрмеры:** Lucky Flip. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV13 — Осенняя ярмарка (ВНЕШНИЙ МИР)

- **Вариант A (default):** Купить нужные вещи — ограниченная скидка.
- **Вариант B:** Посетить шоу — косметическая коллекционная награда.
- **Дар/контрмеры:** Гламурочка. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV14 — Гость с картой (ВНЕШНИЙ МИР)

- **Вариант A (default):** Узнать маршрут — открыть полезную подсказку.
- **Вариант B:** Проводить гостя — временная благодарность.
- **Дар/контрмеры:** познакомить с сервисом. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV15 — Спор у кормушки (КУРЯТНИК)

- **Вариант A (default):** Примирить курочек — синергии сохраняются.
- **Вариант B:** Дать высказаться — шанс найти неожиданную тактику.
- **Дар/контрмеры:** Монах. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV16 — Потерянное перо (КУРЯТНИК)

- **Вариант A (default):** Вернуть хозяйке — малый XP.
- **Вариант B:** Устроить конкурс красоты — косметический сюрприз.
- **Дар/контрмеры:** Гламурочка. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV17 — День рождения Рябы (КУРЯТНИК)

- **Вариант A (default):** Испечь зерновой пирог — позитивный временный дух.
- **Вариант B:** Подготовить подарок — малый reward chest.
- **Дар/контрмеры:** Ряба. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV18 — Золотая луна (МАГИЯ)

- **Вариант A (default):** Загадать желание — шанс символического reward.
- **Вариант B:** Защитить гнёзда — бонус устойчивости.
- **Дар/контрмеры:** Luck/защита. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV19 — Падающая звезда (МАГИЯ)

- **Вариант A (default):** Искать место падения — редкий косметический шанс.
- **Вариант B:** Наблюдать издалека — малый гарантированный прогресс.
- **Дар/контрмеры:** порог наград. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

### EV20 — Туман над двором (МАГИЯ)

- **Вариант A (default):** Зажечь фонари — прозрачный безопасный исход.
- **Вариант B:** Отправиться исследовать — шанс странной награды.
- **Дар/контрмеры:** Lucky Flip. Lucky Flip Дурочки может развернуть негативный исход выбранного варианта в заранее описанный положительный; Боевик блокирует соответствующую угрозу, Монах смягчает положительные/отрицательные эффекты только в допустимом cap.

