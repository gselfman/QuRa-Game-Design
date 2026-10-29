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
- награда budget разрешён.

Нельзя создавать quest на выключенную функцию.

## 2. ACCOUNT_ONCE — задания один раз на аккаунт

Вводные шаги обучения QuRa выполняются один раз: профиль, PWA, Telegram, первая подтверждённая полезная операция, первый сундук и Arena. **Обязательное задание стартовой Arena:** «Настрой защиту курочки» — сохраняется только после явного выбора/подтверждения `ArenaDefenseSetup`. Награда — небольшой XP/сувенир (**PROTOTYPE BALANCE**, точное значение OPEN), GE не требуются. При изменении защитной политики задание не повторяется. Проверять на сервере по `ACCOUNT_ONCE`.

---

## 3. CHICKEN_ONCE

Per instance.

Примеры:
- дать личное имя;
- впервые экипировать;
- впервые собрать native threshold;
- впервые выиграть этой курочкой;
- впервые использовать Манёвр;
- впервые применить Особый приём;
- впервые сработал Gift;
- reach уровень milestone;
- participate in 1×1;
- L15 embodiment eligibility.

## 4. DAILY_ACCOUNT

Один набор ежедневных заданий на аккаунт.

Примеры шаблонов:
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

Примеры:
- complete N ежедневный quests;
- win N Arena matches;
- play N distinct mini-games;
- earn XP across several days;
- use 3 different chicken archetypes;
- collect/open N сундуки;
- participate in social/Friendly once.

## 6. ACHIEVEMENT_ACCOUNT

Long-term:
- first 3 adult chickens;
- full founder collection;
- L20 chicken;
- L15 embodiment;
- N Arena wins;
- возвращение в бой 1×3;
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
- сундук
- экипировка
- buff
- egg/chicken
- cosmetic
- achievement badge

## 10. XP targeting

XP за задание аккаунта получает главная курочка в момент фактического завершения.

Нажатие «Забрать» не меняет получателя XP задним числом.

CHICKEN_ONCE XP can target that specific chicken if quest definition explicitly says so; otherwise follow main-chicken rule.

## 11. Daily generation

Сервер выбирает из доступного пула, учитывая:
- feature flags;
- player progression;
- inventory/state;
- recent quest history;
- repetition задержка повторного применения.

Нельзя предлагать невыполнимое задание.

## 12. Weekly generation

Аналогичные правила, но более широкая цель.

Нельзя ставить цель в зависимость от крайне редкой случайной награды:
bad:
> get Legendary сундук item this week.

Good:
> open 5 сундуки.

## 13. Difficulty bands

- Easy: one action
- Medium: several actions
- Long: недельный/milestone

Награда зависит от усилия и допустимого бюджета.

## 14. Example ежедневный set

Для игрока со взрослой курочкой и открытой Arena:
1. Play one mini-game.
2. Complete 2 useful actions in QuRa.
3. Play one Arena match.
4. Visit Coop and collect/inspect.
5. Optional bonus: use a different chicken than yesterday.

Exact награда numbers in Reward Tables/Economy.

## 15. Arena quests

Allowed:
- play;
- win;
- use Манёвр;
- use Особый приём;
- возвращение в бой;
- Friendly social.

Не следует поощрять:
- intentional losing;
- stalling;
- farming same friend;
- spending tactical service every match.

## 16. Friendly anti-farm

Quest "play with friend":
- награда once per period;
- same friend repeated does not farm награда.

## 17. Financial action quests

Учитывать только подтверждённые сервером события.

Never:
- награда pending payment;
- require harmful/excessive spending;
- hide fee/financial terms behind game награда.

## 18. Personal naming quest

CHICKEN_ONCE:
**«Дай имя новой курочке»**

Can награда small XP/cosmetic.

Если игрок сохраняет имя по умолчанию, подтверждение тоже засчитывает задание.

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

Правило получения выполненных, но не забранных наград должно быть явным:
рекомендуется автоматическая доставка или резервный срок, чтобы награда не терялась.

## 21. Claim philosophy

Prefer:
- completion immediately records награда entitlement;
- claim animation is UX, not economic источник of truth.

Уже заработанная награда не должна исчезать, если пользователь не нажал кнопку.

## 22. Quest analytics

Track:
- offered;
- started;
- completed;
- claimed;
- rerolled if feature exists;
- time to complete;
- abandoned;
- награда cost.

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
- награда
- задержка повторного применения
- analytics tags

## 24. Content rules

- understandable without hidden docs;
- one primary verb;
- avoid ambiguous progress;
- show progress numerically;
- show награда before completion;
- localized.

## 25. Future

Possible:
- quest reroll;
- character quest chains;
- seasonal missions;
- co-op/social missions.

Каждая из этих функций требует проверки экономики.

## C. Новые задания

`FEED_TRIGGERED` — выполнить квалифицирующую полезную операцию QuRa (XP/GE и корм независимы), `NEW_SERVICE_DISCOVERED` — впервые воспользоваться включённым сервисом, `CLAN_GOAL_CONTRIBUTED` — вклад с caps, `COMMUNITY_GOAL_CONTRIBUTED` — общий прогресс, `DAILY_EVENT_CHOICE` — выбрать один из двух вариантов. Задания не должны принуждать к финансовому расходу. Корм не является отдельной валютой. Все triggers строго feature-gated и idempotent.
