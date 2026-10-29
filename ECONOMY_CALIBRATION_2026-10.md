# QuRa — калибровка экономики, октябрь 2026

**Статус:** calibration snapshot based on real GE accrual history + user-reported sustainable mini-game result  
**Purpose:** validate price bands and time-to-goal against actual product usage.

## 1. Период наблюдения

Core comparison window:
- 14 Oct 2026 through 29 Oct 2026
- 16 calendar days

Excluded from normal earned GE:
- 300 GE welcome bonus
- 300 GE purchased in GE Shop

## 2. Наблюдаемые начисления

| Source | Events | GE | Calendar GE/day |
|---|---:|---:|---:|
| QR payments | 26 | 823 | 51.4 |
| Crypto withdraw | 1 | 22 | 1.4 |
| Own fintech operations total | 27 | 845 | **52.8** |
| Partner rewards | 30 | 73 | 4.6 |
| Daily egg | 16 | 16 | 1.0 |
| Wolf rewards in raw history | 7 | 610 | 38.1 over calendar window |

Important:
- Wolf raw history includes unusually large test/game rewards and is not used as sustainable daily baseline.
- Sustainable user estimate for "Wolf catches eggs": **+40 GE net/day** after paid attempts/costs.

## 3. Калибровка финтех-активности

Own operations:
- 845 GE / 16 calendar days = **52.8 GE/day**
- 12 days with at least one own operation
- average on active operation day = **70.4 GE**
- median active operation day = **53 GE**
- 26 QR payment rewards = 823 GE
- average QR reward = **31.7 GE**
- median QR reward = **21.5 GE**

Interpretation:
- a normal actively-paying user already earns roughly 50–55 GE/day from core QuRa usage;
- this gives a strong foundation for a game economy that encourages core fintech activity.

## 4. Сценарии дневного заработка

| Scenario | GE/day |
|---|---:|
| Only normal QuRa operations | **52.8** |
| Only Wolf, sustainable net | **40.0** |
| Operations + daily egg | **53.8** |
| Operations + Wolf + daily egg | **93.8** |
| Operations + Wolf + daily + observed partner | **98.4** |

Conclusion:
- modeling unit **D ≈ 100 GE/day** is supported by the observed active-user scenario;
- core fintech operations alone remain a larger repeatable source than one light mini-game session.

## 5. Целевые доли источников

For a user who both actively pays with QuRa and plays Wolf daily:

- core operations: ~56%
- Wolf: ~43%
- daily egg: ~1%

This suggests a more realistic target than the earlier 15–30% mini-game hypothesis:

**Working target for a highly active player:**
- 50–65% repeatable earned GE from core QuRa operations;
- 30–45% from mini-games;
- 5–15% from quests/events/passive/other small sources.

Partner income is treated separately because it is not representative for every user.

Invariant:
> No single repeatable mini-game should sustainably outperform normal core QuRa usage for the target active payer unless it is strongly capped.

## 6. Рабочая лестница цен

### Gear

| Item | Price GE |
|---|---:|
| Common | 50–100 |
| Rare | 150–300 |
| Epic | 400–800 |
| Legendary | 1,200–2,500 |
| Artifact | 3,000–6,000 |

Midpoints for time-to-goal:
- Common 75
- Rare 225
- Epic 600
- Legendary 1,850
- Artifact 4,500

### Chickens

| Chicken | Price GE |
|---|---:|
| First | 0 / progression |
| Second early acceleration | 400–500 |
| Third early acceleration | 600–800 |
| Standard founder after core progression | 1,000 |
| Rare / seasonal | 2,500 |
| Epic — working proposal | 5,000 |
| Legendary — working proposal | 10,000 |

Purchased chicken arrives as L1 egg.

### Coop upgrades

| Upgrade | Price GE |
|---|---:|
| 2→4 | 0 progression gift |
| 4→6 | 500 |
| 6→10 | 1,500 |
| 10→16 | 4,000 |
| 16→24 | 9,000 |

## 7. Срок накопления — days

| Goal | GE | Only operations | Only Wolf | Operations + Wolf + daily |
|---|---:|---:|---:|---:|
| Common gear | 75 | 1.4 | 1.9 | 0.8 |
| Rare gear | 225 | 4.3 | 5.6 | 2.4 |
| Epic gear | 600 | 11.4 | 15.0 | 6.4 |
| Legendary gear | 1,850 | 35.0 | 46.3 | 19.7 |
| Artifact gear | 4,500 | 85.2 | 112.5 | 48.0 |
| Second chicken acceleration | 450 | 8.5 | 11.3 | 4.8 |
| Third chicken acceleration | 700 | 13.3 | 17.5 | 7.5 |
| Standard founder chicken | 1,000 | 18.9 | 25.0 | 10.7 |
| Rare/seasonal chicken | 2,500 | 47.3 | 62.5 | 26.6 |
| Epic chicken | 5,000 | 94.7 | 125.0 | 53.3 |
| Legendary chicken | 10,000 | 189.3 | 250.0 | 106.6 |
| Coop 4→6 | 500 | 9.5 | 12.5 | 5.3 |
| Coop 6→10 | 1,500 | 28.4 | 37.5 | 16.0 |
| Coop 10→16 | 4,000 | 75.7 | 100.0 | 42.6 |
| Coop 16→24 | 9,000 | 170.4 | 225.0 | 95.9 |

## 8. Интерпретация

The current ladder creates four useful horizons:

### Immediate: < 3 days
- Common gear
- Rare gear for combined active user
- small buffs/services

### Short goal: ~1 week
- Epic gear for active combined user
- second/third chicken acceleration
- first paid Coop upgrade

### Medium goal: 2–4 weeks
- standard founder chicken
- Rare/seasonal chicken for highly active user
- 6→10 Coop

### Long / monetization pressure
- Legendary/Artifact gear
- Epic/Legendary chicken
- large Coop tiers

This is where "earn more through QuRa" or "buy GE" becomes naturally relevant.

## 9. Store UX principle

For any expensive item show:
- current balance;
- missing GE;
- estimated earned path;
- **Earn GE** CTA;
- **Buy GE** CTA.

Earn GE should route to:
- useful QuRa actions;
- quests;
- available mini-games;
- other legitimate sources.

## 10. Следующая калибровка

Need broader cohort data:
- low activity payer
- median payer
- high activity payer
- non-payer gamer
- payer + gamer
- partner-heavy user

Recalculate:
- P25 / P50 / P75 GE/day
- conversion to GE purchase
- time-to-goal
- retention vs frustration

The current snapshot is a valid first calibration, not a population-wide final price model.

## 11. Сверка экономики — 29.10.2026 (D)

История по одному тестовому аккаунту не репрезентативна для всех клиентов; исходные 52,8 GE/день операций и чистые ~40 GE/день «Волка» — сценарий, не population forecast. Рабочая доля мини-игр **30–45%** earned GE, операции **50–65%**, оставшееся — другие источники (**PROTOTYPE BALANCE**). Инвариант: устойчивый мини-игровой заработок не должен вытеснять полезное пользование кошельком.

Действующий GE Shop: 300/1575/3300/18000 GE за базовые 99/499/999/4999 ₽; +10% к цене покупки с 01.12.2026 при включённой индексации. Это **не рост инвестиционной стоимости GE**. В Arena теперь аренда (10 GE участник, PROTOTYPE BALANCE), победителю сундук без гарантированного GE. Средний sellback 7,5 GE, max 12,5 GE; sink пары 12,5 GE, async при 50% win — 6,25 GE. GE discount в Лукойле — реальное списание бонусной стоимости. Корм и клановые сундуки требуют emission budget/caps. Фигурка 17 000 ₽ / ориентировочная себестоимость 15 000 ₽. Season Pass price OPEN.
