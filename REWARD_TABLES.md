# QuRa — таблицы наград v1

**Статус:** награда framework + initial hypotheses  
**Важно:** все числовые вероятности/amounts, если не помечены LOCKED, требуют Economy validation.

## 0. Reward principles

- server-authoritative;
- auditable;
- no silent loss;
- feature-gated;
- progression-aware;
- anti-arbitrage.

## 1. Типы наград

- XP
- GE
- Tickets
- Экипировка
- баф
- Chest
- Egg/Chicken
- Cosmetic
- Achievement/Medal

## 2. Level-up награда

Каждый уровень сопровождается наградой.

Возможный состав награды:
- сундук;
- GE;
- ticket;
- экипировка;
- buff;
- special egg;
- cosmetic.

Таблица наград по уровням открыта до утверждения кривой XP.

## 3. Chest редкость hypothesis

Starting model:
- Common ~60%
- Rare ~28%
- Epic ~9%
- Legendary ~2.5%
- Artifact ~0.5%

Шансы платного сундука показываются до покупки.

## 4. Chest tiers

### Basic Chest
Источники:
- ежедневный/quest/early progression

Focus:
- Common/Rare экипировка
- common бафы
- small GE
- tickets

### Advanced Chest
Источники:
- недельный/mid progression
- paid option possible

Focus:
- Rare/Epic
- stronger бафы
- meaningful GE chance

### Arena Chest
Источники:
- season/Arena milestones

Focus:
- Arena экипировка
- tactical бафы
- cosmetics
- limited GE

### Legendary Chest
Редкий источник получения / высокая цена
Requires pity.

## 5. Progression pools

Player награда pool filtered by:
- chicken/экипировка уровень access;
- owned features;
- inventory;
- content availability.

Avoid stream of unusable L20 экипировка to L4 player.

Можно показывать желаемый предмет выше текущего уровня, если понятны правила хранения и экипировки.

## 6. Pity

Paid/high-value сундук families need:
- pity counter;
- threshold;
- guaranteed minimum редкость;
- reset rule;
- visible or documented behavior.

Точные пороги OPEN.

## 7. Дубли — утверждённая механика

Продаваемый дубль выкупается за **25% магазинной цены GE** (`duplicate_sellback_pct=25`), с серверным ledger и решением округления (OPEN). Arena-эксклюзивы: непродаваемы, дубль заменяется усиленной ячейкой прогресса. Награда никогда не удаляется молча.


## 8. Overflow

Если вместимость заполнена:
- награда entitlement recorded;
- OverflowPackage created;
- user can resolve;
- expiry policy shown.

Chicken/egg overflow uses «В гостях» flow.

## 9. Мини-игра награды

Для каждой игры предусмотрена отдельная таблица.

Table fields:
- score/milestone
- награда
- probability if random
- ежедневный лимит
- global budget
- source_type

GE paid retry:
expected convertible награда value < price unless subsidized/capped.

## 10. Wolf game

Specific current награда matrix remains in mini-game-specific documentation/prototype.

Таблицы наград отсылают к отдельной матрице мини-игры, не создавая новые значения.

## 11. Arena-сундук победителя — D-02a

В платном бою с другом и асинхронной атаке победитель получает **один Arena-сундук** без гарантированного GE. Бой с ботом и тренировочный бой с другом — без сундука.

| Ячейка | Награда | Продажа | GE-ценность |
|---|---|---|---|
| 1. Трофей — всегда | расходник/малый предмет из Arena-пула, цена магазина 20–50 GE | 25% | средняя 7,5; максимум 12,5 |
| 2. Опыт — всегда | XP главной курочке (`arena_chest_xp_daily_cap`, OPEN: серверный дневной cap), Боевой дух, сезон/achievement | нет | 0 |
| 3. Редкость — очень редко | эксклюзивные рамка, баннер, герб, скин, эмоция, FX | нет | 0 |

**PROTOTYPE BALANCE** распределения ячейки 1: цена магазина 20 GE — 40%; 30 GE — 30%; 40 GE — 20%; 50 GE — 10%. **Средний выкуп:** 0,4×5 + 0,3×7,5 + 0,2×10 + 0,1×12,5 = **7,5 GE**. Эксклюзивная косметика: шанс **1–2% PROTOTYPE BALANCE**, при дубле даётся усиленный сезонный прогресс, не GE. Только предметы ценой ≤5×аренды; дорогие магазинные предметы исключены. В продаже Arena-сундук как способ покупки дорогой экипировки не используется.

Для прозрачности: редкая косметика может иметь высокую коллекционную ценность, но её нельзя продать, передать или обменять на GE. XP из арендного сундука ограничен конфигурацией `arena_chest_xp_daily_cap` (величина OPEN) и имеет дневной кап, чтобы не обходить запрет прямой покупки XP.


## 12. Friendly награды

No standard repeatable Arena payout/Слава.

Quest can grant one limited social награда.

## 13. Training награды

No standard Слава.

Can give capped tutorial/quest награда.

## 14. Quest награда bands

Точные значения ещё не утверждены.

### Easy ежедневный
- small XP
- optional small GE/ticket

### Medium ежедневный
- medium XP
- buff/basic сундук

### Weekly
- larger XP
- сундук
- GE under budget
- higher-tier buff

### Achievement
- milestone-specific
- cosmetic/item/сундук/GE depending редкость

## 15. баф награда pools

Common pool:
- Second Wind
- Stone Skin
- Adrenaline
- Charge

Rare:
- Battle Dome
- Battle Cry
- Щит Breaker
- Clear Mind

Epic:
- Double Power
- Silence
- Swap/Reform
- Mirror

Кандидаты в Legendary:
- Phoenix
- Особый приём Echo
- powerful conditional effects

Final редкость by simulation.

## 16. Экипировка награда pool rules

Weight by:
- уровень;
- редкость;
- native archetype opportunities;
- duplicate rate;
- owned set completion.

Дополнительный «полезный» дроп:
немного повышать шанс подходящего предмета, не гарантируя готовый комплект.

## 17. Egg/Chicken награды

Can be:
- known archetype egg;
- mystery egg;
- special/seasonal egg.

Всегда поступает как яйцо L1.

Never spawn adult directly unless special documented награда.

## 18. Ticket награды

Ticket grant must respect stock лимит or define overflow conversion/pending claim.

Default:
do not silently discard earned ticket; use награда pending if лимит full or explicitly documented лимит behavior.

## 19. GE награды

Every GE награда:
- amount
- source_type
- budget bucket
- ledger record
- лимит context

## 20. Идентификатор награды

Use correlation_id to enforce exactly-once награда delivery.

## 21. Случайный выбор награды

Server:
- chooses table version;
- RNG;
- stores result;
- updates pity;
- grants.

Клиент только воспроизводит анимацию.

## 22. Раскрытие шансов платного сундука

Show:
- price;
- probability by relevant редкость/награда class;
- pity if user-facing policy;
- duplicate possibility.

## 23. Reward table versioning

Изменение любой вероятности или размера награды:
- new version;
- effective time;
- preserve historical audit.

## 24. Compensation

Operational compensation uses separate источник:
COMPENSATION

Must not disguise compensation as random награда.

## 25. Reward analytics

Track:
- table/version
- expected value
- realized value
- редкость
- duplicates
- pity state
- источник
- claim/overflow
- GE cost vs value

## 26. Production tables still to calibrate

- XP per quest
- XP уровень-up
- GE ежедневный/недельный
- сундук rates by tier
- pity thresholds
- season награды
- passive laying
- item/buff drop weights

Это таблицы конфигурации, а не недостающие механики.

## 27. Season Pass / monetization награды

Approved direction: Season Pass has free and premium tracks; late premium purchase claims previously unlocked milestones. Every награда is a versioned entitlement. Paid сундук must display odds pre-purchase; pity per сундук family, disclosed threshold, duplicate compensation and server-side roll. Golden Piggy Bank offers a clearly stated **guaranteed** award at purchase (not a deposit or already earned GE). Exact numerical награда tables, frequency, price and EV remain OPEN pending economy review; see **MONETIZATION_LIVEOPS_SPEC.md**.
