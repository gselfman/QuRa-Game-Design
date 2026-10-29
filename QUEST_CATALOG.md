# QuRa — каталог заданий v1

**Статус:** системный каталог типов заданий, триггеров и шаблонов

## 0. Scope types

- ACCOUNT_ONCE
- CHICKEN_ONCE
- DAILY_ACCOUNT
- WEEKLY_ACCOUNT
- ACHIEVEMENT_ACCOUNT

## 1. Главный принцип

Задание существует только если:
- связанная функция включена feature flag;
- событие можно серверно подтвердить;
- reward budget разрешён.

Нельзя создавать quest на выключенную функцию.

## 2. ACCOUNT_ONCE — задания один раз на аккаунт

Вводные шаги обучения QuRa выполняются один раз: профиль, PWA, Telegram, первая подтверждённая полезная операция, первый сундук и Arena. **Обязательное задание стартовой Arena:** «Настрой защиту курочки» — сохраняется только после явного выбора/подтверждения `ArenaDefenseSetup`. Награда — небольшой XP/сувенир (**PROTOTYPE BALANCE**, точное значение OPEN), GE не требуются. При изменении защитной политики задание не повторяется. Проверять на сервере по `ACCOUNT_ONCE`.

---

## 3. CHICKEN_ONCE

Per instance.

Examples:
- дать личное имя;
- впервые экипировать;
- впервые собрать native threshold;
- впервые выиграть этой курочкой;
- впервые использовать Maneuver;
- впервые применить Special;
- впервые сработал Gift;
- reach level milestone;
- participate in 1×1;
- L15 embodiment eligibility.

## 4. DAILY_ACCOUNT

One daily pool per account.

Example templates:
- выполнить N полезных действий;
- сыграть 1 mini-game;
- закончить 1 quest;
- открыть/проверить Курятник;
- сыграть Arena if feature active;
- использовать buff if inventory available;
- экипировать/осмотреть item;
- collect passive output if enabled.

Avoid:
- forcing paid financial transaction;
- requiring unavailable resource;
- repetitive spam.

## 5. WEEKLY_ACCOUNT

Examples:
- complete N daily quests;
- win N Arena matches;
- play N distinct mini-games;
- earn XP across several days;
- use 3 different chicken archetypes;
- collect/open N chests;
- participate in social/Friendly once.

## 6. ACHIEVEMENT_ACCOUNT

Long-term:
- first 3 adult chickens;
- full founder collection;
- L20 chicken;
- L15 embodiment;
- N Arena wins;
- comeback 1×3;
- win with 1 HP;
- win using each archetype;
- collect set;
- max Coop tier;
- Hall of Fame;
- legendary item;
- seasonal medals.

## 7. Типы триггеров заданий

- PROFILE_UPDATED
- FEATURE_CONNECTED
- FINANCIAL_ACTION_CONFIRMED
- MINI_GAME_COMPLETED
- MINI_GAME_SCORE
- CHICKEN_LEVEL_REACHED
- GEAR_EQUIPPED
- SET_THRESHOLD_REACHED
- GIFT_TRIGGERED
- ARENA_MATCH_COMPLETED
- ARENA_MATCH_WON
- ARENA_ACTION_USED
- ARENA_SPECIAL_USED
- BUFF_USED
- CHEST_OPENED
- REFERRAL_QUALIFIED
- PASSIVE_COLLECTED
- EVENT_RESOLVED

## 8. Модели прогресса

- BOOLEAN
- COUNTER
- SUM
- UNIQUE_SET
- STREAK
- THRESHOLD

## 9. Типы наград

- XP
- GE
- ticket
- chest
- gear
- buff
- egg/chicken
- cosmetic
- achievement badge

## 10. XP targeting

Account quest XP goes to main chicken at actual completion time.

Claim button does not allow changing target after completion.

CHICKEN_ONCE XP can target that specific chicken if quest definition explicitly says so; otherwise follow main-chicken rule.

## 11. Daily generation

Server picks from eligible pool based on:
- feature flags;
- player progression;
- inventory/state;
- recent quest history;
- repetition cooldown.

Do not offer impossible task.

## 12. Weekly generation

Similar but broader.

Must avoid dependence on rare RNG:
bad:
> get Legendary chest item this week.

Good:
> open 5 chests.

## 13. Difficulty bands

- Easy: one action
- Medium: several actions
- Long: weekly/milestone

Reward scales by effort and budget.

## 14. Example daily set

For adult player with Arena enabled:
1. Play one mini-game.
2. Complete 2 useful actions in QuRa.
3. Play one Arena match.
4. Visit Coop and collect/inspect.
5. Optional bonus: use a different chicken than yesterday.

Exact reward numbers in Reward Tables/Economy.

## 15. Arena quests

Allowed:
- play;
- win;
- use Maneuver;
- use Special;
- comeback;
- Friendly social.

Do not incentivize:
- intentional losing;
- stalling;
- farming same friend;
- spending tactical service every match.

## 16. Friendly anti-farm

Quest "play with friend":
- reward once per period;
- same friend repeated does not farm reward.

## 17. Financial action quests

Only use confirmed backend events.

Never:
- reward pending payment;
- require harmful/excessive spending;
- hide fee/financial terms behind game reward.

## 18. Personal naming quest

CHICKEN_ONCE:
**«Дай имя новой курочке»**

Can reward small XP/cosmetic.

If user keeps default system name, quest may count as completed through explicit confirm.

## 19. Доступность функций

Quest definition has feature_gate.

If false:
- not generated;
- not shown;
- not counted.

## 20. Expiration

Daily:
period day.

Weekly:
period week.

Completed but unclaimed policy should be explicit:
recommended auto-deliver or grace period to avoid loss.

## 21. Claim philosophy

Prefer:
- completion immediately records reward entitlement;
- claim animation is UX, not economic source of truth.

Avoid losing earned reward because user forgot tap.

## 22. Quest analytics

Track:
- offered;
- started;
- completed;
- claimed;
- rerolled if feature exists;
- time to complete;
- abandoned;
- reward cost.

## 23. Quest authoring template

- code
- scope
- title
- description
- trigger
- progress model
- target
- eligibility
- feature gate
- period
- reward
- cooldown
- analytics tags

## 24. Content rules

- understandable without hidden docs;
- one primary verb;
- avoid ambiguous progress;
- show progress numerically;
- show reward before completion;
- localized.

## 25. Future

Possible:
- quest reroll;
- character quest chains;
- seasonal missions;
- co-op/social missions.

All require economy review.

## C. Новые задания

`FEED_TRIGGERED` — выполнить квалифицирующую полезную операцию QuRa (XP/GE и корм независимы), `NEW_SERVICE_DISCOVERED` — впервые воспользоваться включённым сервисом, `CLAN_GOAL_CONTRIBUTED` — вклад с caps, `COMMUNITY_GOAL_CONTRIBUTED` — общий прогресс, `DAILY_EVENT_CHOICE` — выбрать один из двух вариантов. Задания не должны принуждать к финансовому расходу. Корм не является отдельной валютой. Все triggers строго feature-gated и idempotent.
