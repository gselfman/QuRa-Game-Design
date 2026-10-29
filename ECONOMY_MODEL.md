# QuRa — модель экономики v1

**Статус:** экономическая спецификация / значения без окончательного balance table помечены OPEN  
**Источники:** Game Bible, Dependency Graph, Arena Spec

## 0. Цель

Экономика должна одновременно:
- поддерживать retention;
- давать ощутимые награды;
- создавать GE sinks;
- не создавать бесконечный arbitrage;
- учитывать, что GE имеет реальную стоимость.

## 1. Ресурсы

### XP
Прогрессия курочки. Не покупается, не передаётся, не выводится.

### GE
Общий бонусный ресурс QuRa.

### Tickets
Ограничитель бесплатных награда-bearing mini-game attempts.

### Слава
Сезонный Arena rating, не валюта.

### Крутость
Коллекционно-прогрессионный score, не валюта.

## 2. Базовое правило GE

Каждый GE faucet должен иметь:
- owner budget bucket;
- expected value;
- hard/ежедневный/season лимит where applicable;
- anti-fraud rule;
- source_type.

Каждый GE sink должен иметь:
- price;
- refund policy;
- fulfillment condition;
- analytics event.

## 2.1. Product objective of GE economy

Экономика GE поддерживает основной финансовый продукт.

Желаемый выбор игрока:

**хочу игровой объект → не хватает GE →**
1. **заработать GE полезной активностью в QuRa**, или
2. **купить GE**, если хочу ускорить получение.

Игра служит удержанию и вовлечённости, но не превращается в безлимитный источник GE.

### Working источник-mix target

For a typical active non-paying user, the majority of repeatable earned GE should come from qualifying QuRa product activity.

Начальные целевые значения для моделирования:
- **50–65%** — операции QuRa;
- **30–45%** — мини-игры;
- остальное — quests/events/passive. Цели **PROTOTYPE BALANCE** по ECONOMY_CALIBRATION_2026-10.md §5, доли не являются гарантией выплат.

These ranges are hypotheses and can be recalibrated from real behavior, but the invariant is:

> repeatable game faucets must not make core QuRa activity economically irrelevant.

Rare jackpots, seasonal награды and one-time progression награды are excluded from источник-mix comparison.

If mini-game realized GE/hour materially exceeds normal product-earned GE without a hard лимит, reduce game emission or raise relevant sink prices.

## 2.2. Production GE accrual formula from QuRa code

Current QuRa backend implements operation GE in `app/services/eggs.py`.

For supported successful operations:

`GE = floor(RUB × eggs_rate_pct / 100) + fact_bonus`

Текущие значения по умолчанию:
- `eggs_rate_pct = 1` → **1% of RUB amount in GE**;
- `eggs_fact = 10` → **+10 GE** bonus for an eligible operation;
- `eggs_fact_min_rub = 100` → fact bonus only from **100 ₽**;
- `eggs_fact_daily_max = 10` → at most **10 fact bonuses per Moscow day**.

Бонус +10 GE за факт операции не начисляется, если:
- same payee already received a fact-bonus operation from this user in the previous 24 hours;
- ежедневный fact-bonus limit is exhausted.

После исчерпания лимита или повторного получателя:
- the 1% amount-based GE still applies.

В текущем backend поддерживаются следующие типы операций:
- QR payment;
- card payout;
- crypto withdrawal;
- service order;
- internal QuRa transfer.

Примеры при текущих параметрах:
- 100 ₽ eligible operation → 1 + 10 = **11 GE**;
- 200 ₽ → **12 GE**;
- 500 ₽ → **15 GE**;
- 1,000 ₽ → **20 GE**;
- 3,000 ₽ → **40 GE**;
- 5,000 ₽ → **60 GE**;
- 10,000 ₽ → **110 GE**.

Формула и лимиты управляются серверными настройками и могут изменяться через конфигурацию или админку.

## 2.3. Referral GE — production rule

Актуальные уровни партнёрской программы:
- Level 1: **10%**
- Level 2: **5%**
- Level 3: **2%**

Referral награда is calculated from the friend's **actual awarded operation GE**, not directly from RUB turnover.

Formula:
`partner_GE = floor(base_operation_GE × pct / 100)`

If base GE > 0 and pct > 0 but floor gives 0, backend awards **1 GE minimum**.

Антифрод может удержать вознаграждение при совпадении:
- same device;
- same payout card;
- same deposit sender wallet.

Исторические 20/10/4 — устаревшие значения первичной конфигурации, а не текущие параметры.

## 2.4. GE Shop — production packs and pricing

Актуальные наборы GE в серверном коде:

| Pack | GE | Base price, Oct 2026 |
|---|---:|---:|
| Горсть | 300 | 99 ₽ |
| Корзинка | 1,575 | 499 ₽ |
| Лукошко | 3,300 | 999 ₽ |
| Сундук | 18,000 | 4,999 ₽ |

Бонусы к пакетам:
- 300 GE: no bonus;
- 1,575 GE: +5% / +75 GE;
- 3,300 GE: +10% / +300 GE;
- 18,000 GE: +20% / +3,000 GE.

Индексация цены:
- baseline `ge_price_index_bps = 10000`;
- monthly bump default **+10%**;
- first scheduled bump **1 Dec 2026**;
- admin can pause or override shelf prices.

Public tariff explicitly treats this as **магазин purchase price**, not investment yield.

## 2.5. Lukoil GE integration

Топливный сервис поддерживает два режима.

### Earn
- user pays full fuel amount in USDT;
- **10% of actual fuel cost in RUB** is converted to GE at current GE магазин price.

### Spend
- **5% of fuel cost** is paid with GE;
- rest is paid in USDT;
- if GE balance is insufficient, shortfall returns to USDT charge.

Таким образом, GE одновременно можно:
- earnable through a real product action;
- spendable as a real discount mechanism.

## 3. GE Faucets

### Мини-играs
- free ticket attempts;
- score/milestone награды;
- ежедневный caps.

### Quests
- fixed GE награды;
- ежедневный/недельный caps.

### Chests
- random GE;
- EV included in сундук EV.

### Partner program
Актуальные доли в production:
- 10% / 5% / 2% by levels for qualifying operation GE.

Exact eligible base and caps require financial-product configuration.

### Passive laying
Allowed only with ежедневный/account/coop лимит.

### Arena
2-player paid Arena победитель payout.

### Events/Achievements
Limited, configured награды.

## 4. GE Расходы

- экипировка purchase;
- Coop upgrades;
- paid mini-game retry;
- paid сундуки;
- Arena entry;
- Preparation Buffs;
- Tactical Consumables;
- Hint;
- All-Seeing;
- Autobattle;
- асинхронный Scout;
- cosmetics;
- будущий services.

## 5. Tickets

LOCKED:
- +2/day;
- лимит 8;
- 1 награда-bearing mini-game attempt = 1 ticket;
- Arena does not consume ticket.

Ticket accrual should use server date/time policy.

## 6. Мини-игра paid attempt rule

For any repeatable GE-paid attempt:

`EV(GE reward + convertible reward value) < GE entry cost`

unless:
- hard non-repeatable лимит;
- marketing budget explicitly subsidizes difference.

Гарантированный прибыльный цикл недопустим.

## 7. Мини-игра emission budget

Per game configure:
- ежедневный account лимит;
- global ежедневный budget;
- max single награда;
- expected награды per active user;
- anomaly threshold.

For "Wolf catches eggs" current награда matrices живой in game-specific docs, not duplicated here.

## 8. Экономика аренды Arena — D-02 / D-02a

Два игрока платят по 10 GE аренды (PROTOTYPE BALANCE), не ставки и не передача GE. Победителю выдаётся Arena-сундук. В асинхронной атаке 10 GE платит атакующий; тренировочный бой бесплатен. Ячейка 1 сундука — продаваемый трофей из ограниченного пула; средняя ценность при выкупе **7,5 GE**, верхний предел **12,5 GE**. Ячейка 2 — XP/Боевой дух/сезон, выкуп 0; ячейка 3 — эксклюзивная непродаваемая косметика, выкуп 0.

**Ожидаемый сток:** для пары суммарный расход 20 GE, средний выкуп 7,5 GE → **12,5 GE/бой**; асинхронная атака при 50% побед: расход 10 GE и средний выкуп 3,75 GE → **6,25 GE/попытку**. Не включены другие sinks / стоимость сервера. Лимит призовых боёв одной пары — пример три в сутки (PROTOTYPE BALANCE). Отмена до начала/платформенный сбой — возврат. Двойной KO — без сундука/возврата. Поражение по таймеру — обычный результат.

## 9. Защита от договорного фарма

Сундук не содержит GE, дорогую продаваемую экипировку и передаваемые активы. Трофеи дороже пяти аренд не входят в пул. Отслеживать пары, капы, повторные бои, выкуп. Платёж за аренду и возврат проводить по ledger.

## 10. Четыре игрока — FUTURE

Никаких тарифов и «пула 80 GE» в правилах запуска. Цена/награда будущего режима — OPEN.


## 11. Tactical services pricing

Цены ещё не утверждены.

Need separate price ladder for:
- Hint;
- All-Seeing;
- Autobattle;
- асинхронный Scout.

Principles:
- must be optional;
- cannot reveal hidden живой move;
- frequent use should create sink;
- price cannot make skill irrelevant;
- ranked may лимит use per match.

## 12. баф economy

баф sources:
- mini-games;
- сундуки;
- quests;
- seasons;
- events;
- direct GE магазин if allowed.

баф value depends on:
- редкость;
- activation condition;
- win-rate uplift;
- flexibility;
- ranked legality.

Strong возвращение в бой бафы should not be unlimited direct-purchase spam.

## 13. баф loadout economics

Рабочая гипотеза:
- up to 3 расходники per match.

Economic levers:
- inventory acquisition;
- scarcity;
- loadout capacity;
- per-match use лимит;
- ranked allowlist.

## 14. Экипировка economy

Экипировка price determined by:
- уровень;
- редкость;
- Крутость;
- combat marginal value;
- native synergy;
- set membership;
- визуальный desirability.

Never price only by редкость label.

## 15. Экипировка combat value

Перед утверждением цен необходимо:
- derive marginal win-rate value of +HP/+ATK/+DEF/+SPD;
- derive advanced effect value;
- map to BP;
- then map to price bands.

Скорость values remain OPEN until Arena Скорость rule fixed.

## 15.1. Pricing architecture — effort first, GE second

Ценообразование строится от **целевого усилия пользователя**, а не от произвольной цифры GE.

Вводится калибровочная величина:

`D = median daily earned GE`

где D — медианное количество GE, которое активный пользователь получает за день из разрешённых **earned**-источников:
- квалифицирующие операции/действия QuRa;
- quests;
- бесплатные mini-game attempts;
- обычные ежедневный награды;

но **без**:
- покупки GE;
- компенсаций;
- разовых promo;
- крупных jackpot/редких выбросов.

Все цены сначала задаются как доля/множитель D, затем переводятся в GE.

Это позволяет менять GE emission за реальные операции без полного ручного пересчёта магазина.

### Целевые effort bands

| Категория | Целевое усилие |
|---|---:|
| micro-action / сервис | 0.02–0.15 D |
| Common consumable | 0.1–0.3 D |
| Common gear | 0.5–1 D |
| Rare gear | 1.5–3 D |
| Epic gear | 4–8 D |
| Legendary gear | 12–25 D |
| Artifact | 30–60 D |
| стандартная дополнительная курочка | 7–12 D |
| крупный Coop upgrade | 5–90 D в зависимости от tier |

### Рабочая GE-калибровка v0.1

Для тестирования принимаем **D = 100 GE**. Это не финальный курс, а единица моделирования.

Тогда стартовые price bands:

| Объект | Рабочая цена |
|---|---:|
| mini-game paid retry | 5 GE |
| Arena 2-player entry | 10 GE |
| Hint | 2–3 GE |
| All-Seeing | 5 GE |
| Autobattle | 7–10 GE |
| Common tactical buff | 10–30 GE |
| Rare tactical buff | 30–70 GE |
| Epic tactical buff | 80–180 GE |
| Legendary tactical buff | 200–500 GE |
| Common gear | 50–100 GE |
| Rare gear | 150–300 GE |
| Epic gear | 400–800 GE |
| Legendary gear | 1,200–2,500 GE |
| Artifact gear | 3,000–6,000 GE |

Эти значения должны пройти проверку против фактического D и win-rate value.

## 15.2. Additional chicken pricing

Первая курочка — progression/start награда.

Первые три взрослые курочки нужны для раскрытия основной 3×3 Arena, поэтому **нельзя превращать их получение в жёсткий paywall**.

Рекомендуемая модель:
- 1-я курочка: бесплатно через стартовую progression;
- 2-я: guaranteed progression награда / egg; ускоренная покупка допустима;
- 3-я: guaranteed progression path / milestone; ускоренная покупка допустима;
- 4-я и далее: полноценный collection sink.

Рабочие цены магазина v0.1 при D=100:
- standard founder egg / выбранный базовый archetype: **1,000 GE**;
- discounted early acceleration offer для 2-й курочки: **400–500 GE**;
- discounted early acceleration offer для 3-й: **600–800 GE**;
- mystery founder egg: **700–800 GE**, если random purchase разрешён юридически/продуктово;
- rare/seasonal chicken: от **2,500 GE**;
- Epic/Legendary: price/drop policy отдельно, не “+50% stats”.

Купленная дополнительная курочка всегда приходит как **L1 egg**, а не взрослой.

### Гарантированные вехи второй и третьей курочки

**PROTOTYPE BALANCE:** второе яйцо выдаётся за достижение L6 главной курочки, третье — за главу «Хозяйство» Пути QuRa при второй курочке L4. Альтернатива — ускоренная покупка в магазине по §15.2. Никакого обязательного доната для 3×3. Каждое яйцо попадает в коллекцию L1; при полной вместимости используется «В гостях».

## 15.3. Chicken pricing logic

Цена конкретной курочки зависит от:
- guaranteed vs mystery;
- availability window;
- редкость;
- визуальный exclusivity;
- Gift uniqueness;
- Arena strategic uniqueness;
- collection scarcity.

Цена **не должна** напрямую продавать линейное боевое превосходство.

## 15.4. GE Store conversion role

GE Store существует как shortcut, а не как единственный реалистичный путь.

Пользователь должен всегда видеть два пути:

1. **Заработать GE** — через полезное использование QuRa, quests, mini-games, награды.
2. **Купить GE** — если хочет получить цель быстрее.

UI у дорогой покупки может прямо показывать:
- баланс;
- сколько GE не хватает;
- «Заработать GE»;
- «Купить GE».

Это соединяет игровой спрос с основной fintech-активностью без принуждения.

## 15.5. Актуальная витрина покупки GE

Только реальные backend-пакеты: **300/1575/3300/18000 GE за базовые 99/499/999/4999 ₽** (см. §2.4). Прежние предложения 100/500/1200/3000/7500/15000 не являются тарифами и сняты.


## 16. Coop upgrades

Установленные значения вместимости:
- 2
- 4
- 6
- 10
- 16
- 24

2→4 first upgrade is progression gift.

Working v0.1 prices при D=100:

| Upgrade | Capacity | GE | Target effort |
|---|---:|---:|---:|
| Гнёздышко → Курятник | 2→4 | **0** | progression gift |
| Курятник → Птичий двор | 4→6 | **500 GE** | ~5 D |
| Птичий двор → Усадьба | 6→10 | **1,500 GE** | ~15 D |
| Усадьба → Золотой двор | 10→16 | **4,000 GE** | ~40 D |
| Золотой двор → Дворец Рябы | 16→24 | **9,000 GE** | ~90 D |

Дополнительно tier может требовать Крутость/collection milestone, чтобы пользователь не мог полностью пропустить progression одной покупкой GE.

Цель escalation:
- раннее расширение достижимо;
- midgame требует осознанного накопления;
- endgame является крупной долгосрочной целью и сильным GE sink.

Все GE числа пересчитываются после измерения фактического D.

## 17. Экономика сундуков

Для каждого сундука задано:
- price/источник;
- награда table;
- EV;
- pity;
- progression pool;
- disclosure if paid.

Paid сундук expected value must account for:
- GE;
- экипировка replacement value;
- buff value;
- ticket value;
- rare chicken value.

## 18. Редкость starting hypothesis

From Bible:
- Common ~60%
- Rare ~28%
- Epic ~9%
- Legendary ~2.5%
- Artifact ~0.5%

These are modeling hypotheses, not final production rates.

## 19. Pity

Pity counter needed for expensive paid сундук families.

Для каждого семейства сундуков указать:
- threshold;
- guaranteed minimum редкость;
- reset rule;
- cross-сундук sharing or isolation.

OPEN until Reward Tables.

## 20. Дубли — выкуп за GE (LOCKED D-09)

Любой допустимый к продаже дубль выкупается за **25%** актуальной магазинной цены в GE (`duplicate_sellback_pct=25`). Точная дробная цена может требовать учёта долей GE или фиксированного округления — OPEN; при неделимых GE нужен согласованный rounding policy. Arena-эксклюзивы непродаваемы (`sellback_pct=0`). Выкуп фиксируется ledger, нельзя выкупить экипированный предмет без снятия.


## 21. Passive laying

Output depends on:
- adult residents;
- уровень/progression;
- Ryaba Gift;
- Daily Event;
- allowed sets;
- Coop лимит.

Обязательно:
- account/day лимит;
- Coop/tier лимит;
- global budget;
- anti-bot collection behavior.

Точная формула пока открыта.

## 22. XP economy

XP is non-monetary progression.

Требования:
- L3/L4 early;
- first 3 adult chickens achievable much faster than later collection;
- L15 long-term;
- L20 not reached in weeks of normal use;
- no infinite cheap-action farm.

Exact curve belongs будущий balance table inside this model.

## 23. XP Boost лимит

Sources can include:
- Professor Gift;
- экипировка/event effects;
- special campaigns.

Total XP multiplier must have server лимит.

## 24. Quest economy

Daily/недельный награды should target:
- engagement;
- feature education;
- diversified use.

No task should force a financially harmful action.

GE награды from quests have per-period budget.

## 25. Referral economy

Current production ratio 10/5/2.

Qualifying action must be real and anti-fraud checked.

Registration alone gives no награда.

Необходимо:
- self-referral защита;
- device/payment correlation;
- velocity limits;
- reversal handling.

## 26. Слава economy

Слава is not GE.

Источники:
- ranked атака;
- limited защита bonus.

Modifiers:
- opponent rating;
- anti-farm;
- season config.

No direct GE purchase of Слава.

## 27. Крутость economy

Крутость is status/progression.

No direct exchange to GE.

It can gate:
- Coop upgrade;
- cosmetics;
- collection milestones.

## 28. Morale economy

Morale is временный Arena state.

Cannot be directly bought with GE in v1.

Working range:
-15%…+15%.

### Источники будущей эмиссии: корм и кланы

Корм — временный effect от квалифицирующей операции, **не отдельная валюта и не GE faucet сам по себе**. Прямое начисление XP/GE за операции не меняется; если FeedEffect улучшает яйценоскость или награды, дополнительная GE-эмиссия учитывается в бюджетах `FEED_BONUS` и `CLAN_REWARD`. Дневные caps и максимальный uplift — OPEN / PROTOTYPE BALANCE. Для оценки §35 добавить сценарии: один плательщик с кормом, группа с недельной целью клана, большой реферальный клан и злоупотребления повторными операциями. Скидки на сервисы (включая Лукойл) учитывать отдельной строкой как **использованное GE-обязательство**, а не только источник/sink.

## 29. GE budget buckets

Recommended accounting buckets:
- MINI_GAME
- QUEST
- CHEST
- REFERRAL
- PASSIVE
- ARENA_PRIZE (нет прямого начисления GE)
- EVENT
- PROMO
- COMPENSATION
- FEED_BONUS
- CLAN_REWARD

Every credit uses one bucket.

## 30. Sink buckets

- ARENA_ENTRY_FEE
- GEAR_PURCHASE
- COOP_UPGRADE
- MINI_GAME_RETRY
- CHEST_PURCHASE
- BUFF_PURCHASE
- TACTICAL_SERVICE
- COSMETIC

## 31. Аналитика экономики

Daily dashboard:
- GE minted by источник;
- GE burned by sink;
- net issuance;
- active users;
- issuance/user;
- sink/user;
- Arena sink;
- mini-game EV;
- сундук EV realized;
- referral issuance;
- passive issuance;
- anomalous accounts.

## 32. Ограничители экономики

Alert if:
- net issuance exceeds budget;
- paid retry realized EV ≥ cost;
- сундук realized EV deviates materially;
- referral spikes;
- passive claiming spikes;
- Arena payout mismatch;
- negative balance;
- duplicate награда correlation id.

## 33. Принципы возвратов

Every paid action declares:
- lock point;
- fulfillment point;
- cancellation window;
- server-failure behavior;
- user-failure behavior.

No paid feature ships without refund matrix.

## 34. Настройка цен

All prices server-configurable.

Do not hardcode in client:
- GE prices;
- Arena fees;
- buff cost;
- tactical service cost;
- сундук price;
- retry price;
- Coop upgrade price.

## 35. Обязательные экономические сценарии

Before production run:
1. low-engagement user;
2. ежедневный active;
3. power user;
4. mini-game optimizer;
5. Arena-heavy user;
6. referral-heavy user;
7. full Coop endgame.

For each:
- GE in;
- GE out;
- net;
- inventory growth;
- expected real-world bonus liability.

## 36. Открытые таблицы баланса

Need numeric tables later for:
- XP curve L1–20;
- экипировка prices;
- Coop prices;
- buff prices;
- service prices;
- сундук EV;
- passive laying;
- Arena 4-player payout;
- pity;
- season награды.

## 37. Инварианты

1. No guaranteed repeatable positive GE arbitrage.
2. GE источник always audited.
3. Paid action always has settlement.
4. Слава cannot be bought.
5. Temporary combat power not silently baked into подбор соперника.
6. Real-value GE emissions always capped/budgeted.
7. Server owns награда roll.

## 38.1. Полная себестоимость 3D-фигурки: сценарный расчёт (P8)

Цена фигурки — **17 000 ₽** (утверждено); изготовление — **около 15 000 ₽** (ориентир владельца).

| Статья | Рабочий пример |
|---|---:|
| Производство | 15 000 ₽, ориентир |
| Доставка | 800 ₽ — PROTOTYPE BALANCE |
| Упаковка | 250 ₽ — PROTOTYPE BALANCE |
| Эквайринг, условно 2,5% от 17 000 | 425 ₽ — PROTOTYPE BALANCE |
| Сервис и резерв возвратов | 350 ₽ — PROTOTYPE BALANCE |
| Налоги, условная упрощённая модель 6% выручки | 1 020 ₽ — PROTOTYPE BALANCE, режим налогообложения не установлен |
| **Итого затрат в таком сценарии** | **17 845 ₽** |
| **Результат на заказ в таком сценарии** | **−845 ₽** |

Без гипотетического налога 1 020 ₽ условная маржа была бы **+175 ₽**, до прочих издержек. Это **не бухгалтерская калькуляция и не прогноз**, так как неизвестны продавец, ставка и база налога, тариф доставки, фактическая комиссия, доля возвратов, расходы поддержки и производство брака. Доставка может быть оплачена покупателем отдельно — это тоже OPEN.

**Вопрос владельцу:** фигурка намеренно продаётся около себестоимости/с убытком как marketing/retention или нужно увеличить цену/выставить доставку отдельно? До ответа не менять установленную цену 17 000 ₽.

## 38. Approved LiveOps monetization expansion

See **MONETIZATION_LIVEOPS_SPEC.md**. New optional sinks: premium Season Pass, paid сундук tiers, Golden Piggy Bank, starter bundles, seasonal cosmetic collections and contextual offers. Prices, pity thresholds and награда EV are OPEN until forecast and compliance review; do not present design ranges as actual магазин tariffs. Every mechanism must be measured for conversion, GE emission liability, net sink, retention of core fintech actions, refunds and potential arbitrage. Real GE packs/price index remain controlled by the QuRa backend.

## 38. Сверка экономики 29.10.2026

| Проверка | Установленный вывод |
|---|---|
| Пакеты GE | реальные 300/1575/3300/18000 за базовые 99/499/999/4999 ₽, не старые гипотезы |
| Индексация | цена **покупки** GE растёт +10%/месяц начиная с 01.12.2026, если администратор не поставил на паузу; это **не доходность GE** |
| Arena live | аренда 10+10=20 GE, ожидание выкупа трофея победителя 7,5 GE, средний sink **12,5 GE на пару** |
| Arena async | аренда 10 GE атакующего, p(win)=0,5 **PROTOTYPE BALANCE** → 0,5×7,5 = 3,75 GE ожидаемого выкупа, sink **6,25 GE** |
| Дубли | 25% текущей магазинной GE-цены, кроме `arena_exclusive` (0) |
| Корм | непосредственно не выпускает GE; усиление пассивных наград, если есть, требует отдельного emission cap и source `FEED_BONUS` |
| Кланы | косметика/сундуки за вклад; вся GE-часть учитывается как `CLAN_REWARD`, недельный cap OPEN |
| GE discount | учитывать потреблённые GE как реальное бонусное обязательство в Лукойле и будущих сервисах |
| 3D | цена 17 000 ₽, себестоимость ~15 000 ₽; валовая разница ~2 000 ₽ до доставки, налогов, поддержки и возвратов |
| Season Pass | цена OPEN и хранится в серверной настройке, не прошивается в клиент |

### Важная оговорка
Расчёты Arena основаны на возможности продать выпавший трофей за 25%, **не включают** стоимость серверного боя и LLM, убытки от ошибочных наград, overhead, географический/платёжный риск. Продавать сундук отдельно по цене без EV-проверки нельзя. Для Лукойла платёж GE как частичная оплата реально имеет стоимость: dashboard должен показывать объём погашенных GE отдельно.
