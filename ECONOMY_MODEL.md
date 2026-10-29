# QuRa Economy Model v1

**Статус:** экономическая спецификация / значения без окончательного balance table помечены OPEN  
**Источники:** Game Bible, Dependency Graph, Arena Spec

## 0. Цель

Экономика должна одновременно:
- поддерживать retention;
- давать ощутимые награды;
- создавать GE sinks;
- не создавать бесконечный arbitrage;
- учитывать, что GE имеет потенциальную реальную стоимость.

## 1. Ресурсы

### XP
Прогрессия курочки. Не покупается, не передаётся, не выводится.

### GE
Общий бонусный ресурс QuRa.

### Tickets
Ограничитель бесплатных reward-bearing mini-game attempts.

### Glory
Сезонный Arena rating, не валюта.

### Coolness
Коллекционно-прогрессионный score, не валюта.

## 2. Базовое правило GE

Каждый GE faucet должен иметь:
- owner budget bucket;
- expected value;
- hard/daily/season cap where applicable;
- anti-fraud rule;
- source_type.

Каждый GE sink должен иметь:
- price;
- refund policy;
- fulfillment condition;
- analytics event.

## 3. GE Faucets

### Mini-games
- free ticket attempts;
- score/milestone rewards;
- daily caps.

### Quests
- fixed GE rewards;
- daily/weekly caps.

### Chests
- random GE;
- EV included in chest EV.

### Partner program
Current Bible ratio:
- 20% / 10% / 4% by levels for qualifying real actions.

Exact eligible base and caps require financial-product configuration.

### Passive laying
Allowed only with daily/account/coop cap.

### Arena
2-player paid Arena winner payout.

### Events/Achievements
Limited, configured rewards.

## 4. GE Sinks

- gear purchase;
- Coop upgrades;
- paid mini-game retry;
- paid chests;
- Arena entry;
- Preparation Buffs;
- Tactical Consumables;
- Hint;
- All-Seeing;
- Autobattle;
- async Scout;
- cosmetics;
- future services.

## 5. Tickets

LOCKED:
- +2/day;
- cap 8;
- 1 reward-bearing mini-game attempt = 1 ticket;
- Arena does not consume ticket.

Ticket accrual should use server date/time policy.

## 6. Mini-game paid attempt rule

For any repeatable GE-paid attempt:

`EV(GE reward + convertible reward value) < GE entry cost`

unless:
- hard non-repeatable cap;
- marketing budget explicitly subsidizes difference.

No guaranteed profitable loop.

## 7. Mini-game emission budget

Per game configure:
- daily account cap;
- global daily budget;
- max single reward;
- expected rewards per active user;
- anomaly threshold.

For "Wolf catches eggs" current reward matrices live in game-specific docs, not duplicated here.

## 8. Arena 2-player entry

LOCKED:
- Player A: -10 GE
- Player B: -10 GE
- Pool: 20 GE
- Winner: +15 GE
- Arena/system sink: 5 GE

Net:
- winner: +5 relative to own entry;
- loser: -10;
- system: +5 sink.

## 9. Arena draw / cancellation settlement

OPEN decisions, but production must choose explicit rules.

Recommended baseline for simulation:
- server/platform failure before meaningful battle → full refund;
- lobby cancellation before match lock → full refund;
- player disconnect/timeout after match lock → no refund, opponent gets result according to rules;
- double KO → either split/refund or defined winner/tiebreak; do not ship without explicit rule.

## 10. Arena 4-player

LOCKED entry:
- 20 GE/player
- Pool 80 GE

OPEN payout.

Candidate models to simulate:
- FFA winner-takes-majority + fee;
- top-2 payout;
- 2×2 winning team split;
- fixed platform fee.

Do not finalize until expected sink and incentives are modeled.

## 11. Tactical services pricing

Pricing not final.

Need separate price ladder for:
- Hint;
- All-Seeing;
- Autobattle;
- async Scout.

Principles:
- must be optional;
- cannot reveal hidden live move;
- frequent use should create sink;
- price cannot make skill irrelevant;
- ranked may cap use per match.

## 12. Buff economy

Buff sources:
- mini-games;
- chests;
- quests;
- seasons;
- events;
- direct GE shop if allowed.

Buff value depends on:
- rarity;
- activation condition;
- win-rate uplift;
- flexibility;
- ranked legality.

Strong comeback buffs should not be unlimited direct-purchase spam.

## 13. Buff loadout economics

Working hypothesis:
- up to 3 consumables per match.

Economic levers:
- inventory acquisition;
- scarcity;
- loadout capacity;
- per-match use cap;
- ranked allowlist.

## 14. Gear economy

Gear price determined by:
- level;
- rarity;
- Coolness;
- combat marginal value;
- native synergy;
- set membership;
- visual desirability.

Never price only by rarity label.

## 15. Gear combat value

Before price table:
- derive marginal win-rate value of +HP/+ATK/+DEF/+SPD;
- derive advanced effect value;
- map to BP;
- then map to price bands.

Speed values remain OPEN until Arena Speed rule fixed.

## 15.1. Pricing architecture — effort first, GE second

Ценообразование строится от **целевого усилия пользователя**, а не от произвольной цифры GE.

Вводится калибровочная величина:

`D = median daily earned GE`

где D — медианное количество GE, которое активный пользователь получает за день из разрешённых **earned**-источников:
- квалифицирующие операции/действия QuRa;
- quests;
- бесплатные mini-game attempts;
- обычные daily rewards;

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

Первая курочка — progression/start reward.

Первые три взрослые курочки нужны для раскрытия основной 3×3 Arena, поэтому **нельзя превращать их получение в жёсткий paywall**.

Рекомендуемая модель:
- 1-я курочка: бесплатно через стартовую progression;
- 2-я: guaranteed progression reward / egg; ускоренная покупка допустима;
- 3-я: guaranteed progression path / milestone; ускоренная покупка допустима;
- 4-я и далее: полноценный collection sink.

Working v0.1 store prices при D=100:
- standard founder egg / выбранный базовый archetype: **1,000 GE**;
- discounted early acceleration offer для 2-й курочки: **400–500 GE**;
- discounted early acceleration offer для 3-й: **600–800 GE**;
- mystery founder egg: **700–800 GE**, если random purchase разрешён юридически/продуктово;
- rare/seasonal chicken: от **2,500 GE**;
- Epic/Legendary: price/drop policy отдельно, не “+50% stats”.

Купленная дополнительная курочка всегда приходит как **L1 egg**, а не взрослой.

## 15.3. Chicken pricing logic

Цена конкретной курочки зависит от:
- guaranteed vs mystery;
- availability window;
- rarity;
- visual exclusivity;
- Gift uniqueness;
- Arena strategic uniqueness;
- collection scarcity.

Цена **не должна** напрямую продавать линейное боевое превосходство.

## 15.4. GE Store conversion role

GE Store существует как shortcut, а не как единственный реалистичный путь.

Пользователь должен всегда видеть два пути:

1. **Заработать GE** — через полезное использование QuRa, quests, mini-games, rewards.
2. **Купить GE** — если хочет получить цель быстрее.

UI у дорогой покупки может прямо показывать:
- баланс;
- сколько GE не хватает;
- «Заработать GE»;
- «Купить GE».

Это соединяет игровой спрос с основной fintech-активностью без принуждения.

## 15.5. Suggested GE Store bundle ladder

Размеры bundle могут быть:
- 100 GE;
- 500 GE;
- 1,200 GE;
- 3,000 GE;
- 7,500 GE;
- 15,000 GE.

Fiat price/currency and bonus percentage определяются финансовым продуктом и **не фиксируются игровой документацией**.

Bundle ladder должен позволять:
- micro purchase;
- one useful gear purchase;
- chicken acceleration;
- large Coop/collection purchase.

Не использовать dark patterns “не хватает ровно 1 GE”; остаток после покупки должен оставаться полезным.

## 16. Coop upgrades

Known capacities:
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

Дополнительно tier может требовать Coolness/collection milestone, чтобы пользователь не мог полностью пропустить progression одной покупкой GE.

Цель escalation:
- раннее расширение достижимо;
- midgame требует осознанного накопления;
- endgame является крупной долгосрочной целью и сильным GE sink.

Все GE числа пересчитываются после измерения фактического D.

## 17. Chest economy

Each chest has:
- price/source;
- reward table;
- EV;
- pity;
- progression pool;
- disclosure if paid.

Paid chest expected value must account for:
- GE;
- gear replacement value;
- buff value;
- ticket value;
- rare chicken value.

## 18. Rarity starting hypothesis

From Bible:
- Common ~60%
- Rare ~28%
- Epic ~9%
- Legendary ~2.5%
- Artifact ~0.5%

These are modeling hypotheses, not final production rates.

## 19. Pity

Pity counter needed for expensive paid chest families.

Define per chest family:
- threshold;
- guaranteed minimum rarity;
- reset rule;
- cross-chest sharing or isolation.

OPEN until Reward Tables.

## 20. Duplicate gear

Bible direction:
- duplicates remain inventory-limited;
- future sell/trade-in value can exist.

If duplicate conversion is enabled:
- must be a sink/partial refund;
- never restore full purchase EV repeatedly.

## 21. Passive laying

Output depends on:
- adult residents;
- level/progression;
- Ryaba Gift;
- Daily Event;
- allowed sets;
- Coop cap.

Must have:
- account/day cap;
- Coop/tier cap;
- global budget;
- anti-bot collection behavior.

Exact formula OPEN.

## 22. XP economy

XP is non-monetary progression.

Requirements:
- L3/L4 early;
- first 3 adult chickens achievable much faster than later collection;
- L15 long-term;
- L20 not reached in weeks of normal use;
- no infinite cheap-action farm.

Exact curve belongs future balance table inside this model.

## 23. XP Boost cap

Sources can include:
- Professor Gift;
- gear/event effects;
- special campaigns.

Total XP multiplier must have server cap.

## 24. Quest economy

Daily/weekly rewards should target:
- engagement;
- feature education;
- diversified use.

No task should force a financially harmful action.

GE rewards from quests have per-period budget.

## 25. Referral economy

Current ratio 20/10/4.

Qualifying action must be real and anti-fraud checked.

Registration alone gives no reward.

Need:
- self-referral defense;
- device/payment correlation;
- velocity limits;
- reversal handling.

## 26. Glory economy

Glory is not GE.

Sources:
- ranked attack;
- limited defense bonus.

Modifiers:
- opponent rating;
- anti-farm;
- season config.

No direct GE purchase of Glory.

## 27. Coolness economy

Coolness is status/progression.

No direct exchange to GE.

It can gate:
- Coop upgrade;
- cosmetics;
- collection milestones.

## 28. Morale economy

Morale is temporary Arena state.

Cannot be directly bought with GE in v1.

Working range:
-15%…+15%.

## 29. GE budget buckets

Recommended accounting buckets:
- MINI_GAME
- QUEST
- CHEST
- REFERRAL
- PASSIVE
- ARENA_PAYOUT
- EVENT
- PROMO
- COMPENSATION

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

## 31. Economy telemetry

Daily dashboard:
- GE minted by source;
- GE burned by sink;
- net issuance;
- active users;
- issuance/user;
- sink/user;
- Arena sink;
- mini-game EV;
- chest EV realized;
- referral issuance;
- passive issuance;
- anomalous accounts.

## 32. Economy guardrails

Alert if:
- net issuance exceeds budget;
- paid retry realized EV ≥ cost;
- chest realized EV deviates materially;
- referral spikes;
- passive claiming spikes;
- Arena payout mismatch;
- negative balance;
- duplicate reward correlation id.

## 33. Refund policy framework

Every paid action declares:
- lock point;
- fulfillment point;
- cancellation window;
- server-failure behavior;
- user-failure behavior.

No paid feature ships without refund matrix.

## 34. Price configuration

All prices server-configurable.

Do not hardcode in client:
- GE prices;
- Arena fees;
- buff cost;
- tactical service cost;
- chest price;
- retry price;
- Coop upgrade price.

## 35. Scenario modeling required

Before production run:
1. low-engagement user;
2. daily active;
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

## 36. Open balance tables

Need numeric tables later for:
- XP curve L1–20;
- gear prices;
- Coop prices;
- buff prices;
- service prices;
- chest EV;
- passive laying;
- Arena 4-player payout;
- pity;
- season rewards.

## 37. Invariants

1. No guaranteed repeatable positive GE arbitrage.
2. GE source always audited.
3. Paid action always has settlement.
4. Glory cannot be bought.
5. Temporary combat power not silently baked into matchmaking.
6. Real-value GE emissions always capped/budgeted.
7. Server owns reward roll.

