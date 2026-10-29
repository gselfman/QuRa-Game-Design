# QuRa Game Screens v1

**Статус:** полный inventory основных игровых экранов и flows

## 0. UX principles

- mobile-first;
- financial actions remain serious/clear;
- game surfaces do not obscure money status;
- state/reward always explicit;
- no hidden irreversible loss;
- feature flags remove unavailable flows.

## 1. Game Home / Coop entry

Shows:
- main chicken Type+Name;
- level/XP;
- quick Coolness;
- GE;
- tickets;
- active event;
- quests summary;
- Coop entry;
- Arena entry;
- mini-games.

## 2. Chicken Card

Shows:
- type/title;
- personal name;
- rename;
- lifecycle/level;
- XP;
- Gift;
- Coolness;
- gear;
- Arena stats;
- Maneuver/Special;
- native set progress;
- legacy info.

## 3. Rename Chicken

Fields:
- current full identity;
- personal name input;
- validation/moderation;
- preview Type + Name;
- confirm.

## 4. Coop

Shows residents:
- eggs/chicks/adults;
- main indicator;
- capacity;
- Coolness;
- passive production;
- Daily Event;
- upgrade.

## 5. Coop Upgrade

- current tier/capacity
- next tier
- requirements
- GE price
- benefits
- confirm
- insufficient state

## 6. Overflow / Guest Chicken

When reward exceeds capacity:
- reward preview
- countdown if applicable
- expand Coop
- free place
- resolve later
- decline with double confirmation if allowed

## 7. Path / QuRa Journey

Account-level onboarding chapters.

- steps
- progress
- feature-gated tasks
- rewards

## 8. Chicken Journey

Per chicken:
- level milestones
- CHICKEN_ONCE
- gear/Arena/Gift tasks
- legacy milestone

## 9. Daily Quests

- quest cards
- progress
- reward
- expiration
- completion state

## 10. Weekly Quests

Similar with weekly summary.

## 11. Achievements

- categories
- locked/unlocked
- progress
- badges
- rewards

## 12. Reward Claim

- animation
- reward payload
- source
- inventory/overflow result

Economic entitlement exists server-side before animation.

## 13. Chest Inventory

- chest types
- count
- source
- open button

## 14. Chest Open

- probabilities for paid chest
- opening animation
- result
- pity state if shown
- duplicate/overflow resolution

## 15. Gear Shop

- filters level/category/rarity
- usable/locked
- dim future items
- GE price
- Coolness/combat stats
- native tag
- set tag

## 16. Gear Item Detail

- visual
- level
- rarity
- Coolness
- HP/ATK/DEF/SPD
- advanced effects
- exact engine meaning
- native synergy
- set bonuses
- buy/equip

## 17. Wardrobe

- selected chicken
- slots
- equipped
- inventory
- compare
- resulting stats/BP/Coolness

## 18. Try-on

Visual preview of item/combination.

## 19. Treasure Chest Inventory Capacity

- used/capacity
- upgrade/trade-in if implemented
- overflow packages

## 20. Mini-game Hub

- games
- ticket stock
- reward eligibility
- daily limits
- paid retry info

## 21. Mini-game Result

- score
- reward
- milestone
- daily cap
- retry ticket/GE

## 22. Daily Event / News

- global story
- personal outcome
- Gift/counter explanation
- modifier duration

## 23. Friends

- referral friends
- public cards
- visit
- challenge

## 24. Friend Chicken/Coop View

Privacy-limited:
- public identity
- Coolness
- allowed collection
- challenge

## 25. Главная Arena (старт)

Доступны: **1×1 с другом**, **бот-тренировка**, **асинхронный вызов защитной тактики**. Заблокированные превью 2×2 и 3×3: показывают прогресс (например 2/3 взрослых, 2/4 места), требования и кнопки «Получить курочку» / «Расширить Курятник». 4-player — Future, в стартовом UI не предлагать.


## 26. Arena Enrollment

- season rules
- ranked format
- defense team
- defensive strategy
- confirm

## 27. Arena Matchmaking

- format
- BP range
- searching
- cancel before lock
- bot vs human indication

## 28. Вызов друга и аренда

Перед оплатой показывать **10 GE аренды/игрок (PROTOTYPE BALANCE)**, приз победителю — сундук без гарантированного GE, лимит призовых матчей пары и возможность **бесплатной тренировки без награды**. Скрытых ставок и переводов GE нет.


## 29. Arena Mode Selection

- Wall
- JRPG
- future formats
- descriptions

## 30. Arena Crest Selection

- available crests
- opponent occupied crest disabled
- selected preview

## 31. Arena Team Selection

- roster
- 3 slots
- stats
- personal names
- lock team
- opponent hidden until both ready

## 32. Arena Buff Loadout

- owned consumables
- selected max slots
- rarity
- activation condition
- ranked legality
- buy/source shortcuts if allowed

## 33. Arena Battle

Per own fighter:
- crest + Type + Name
- HP
- Shield
- charge
- statuses
- four actions
- target picker in JRPG
- collapsible action description

Opponent:
- same visible public combat state
- no hidden current action.

Controls:
- Hint
- All-Seeing
- Autobattle when enabled
- tactical buff activation
- chat
- timer
- surrender if implemented

## 34. Arena Action Explanation

Spoiler:
- narrative
- exact effect
- strong matchup
- weak matchup

## 35. All-Seeing Panel

For selected action:
- opponent legal response
- predicted winner
- HP after
- death/double KO
- effects

Clearly says prediction, not revealed move.

## 36. Hint Panel

Contextual advice based on actual board state.

## 37. Buff Activation Modal

- buff
- eligible target
- condition
- duration
- consume confirm

## 38. Arena Chat

2-player:
- quick replies
- emoji
- text

4-player:
tabs/recipient:
- All
- Team
- Private

## 39. Arena Round Result

- team score
- collisions
- visuals
- compact explanation
- next round state

## 40. Battle Chronicle

- literary story
- round accordion
- Technical calculation spoiler
- copy/share

## 41. Итоги боя

Победа: выдача **Arena-сундука**, предпросмотр трёх ячеек (трофей, опыт, шанс эксклюзивной косметики). Проигрыш: без сундука. Отмена до начала/ошибка платформы — возврат аренды; двойной KO — без сундука/возврата. Отдельно показать XP, Боевой дух и прогресс сезона; не показывать старый GE payout 15.


## 42. Rematch Prompt

- proposal
- Yes
- No
- same mode/team explanation

## 43. Timeout / Gods Lightning

- countdown
- warning thresholds
- lightning animation
- technical loss reason
- Chronicle entry

## 44. Reconnect

- connection state
- reconnect countdown/grace
- action status
- no duplicate submit
- server incident handling

## 45. Async Arena Defense

- defensive team
- strategy
- allowed Scout context
- defense result log

## 46. Training

- bot difficulty
- free
- no Glory
- teaching tips

## 47. Glory / League

- current Glory
- league
- movement
- season remaining
- reward preview

## 48. Leaderboard

- season ranking
- top 3 medals
- own position

## 49. Hall of Fame

- seasons
- champions
- team snapshot
- medals

## 50. Buff Inventory

- Preparation
- Tactical
- quantity
- rarity
- sources
- effect
- legal modes

## 51. Preparation Buff

- select
- duration
- active status
- visibility rules

## 52. Legacy / L15

- eligibility
- 3D preview
- consequences
- original leaves digital Coop
- heir concept
- explicit confirmation

## 53. Physical Passport / Heir Claim

- scan/claim
- one-time status
- account destination
- capacity handling

## 54. Settings

Game:
- sound
- music
- vibration
- chat mute
- accessibility

## 55. Moderation/report

- report player/chat/name
- block/mute where supported

## 56. Empty/error states

Required:
- no chicken
- no gear
- no buff
- no tickets
- full inventory
- full Coop
- network error
- feature unavailable
- reward delivery pending
- Arena settlement pending

## 57. Admin screens future

- content catalog
- quests
- reward tables
- economy config
- feature flags
- Arena balance
- moderation
- analytics

## 58. Screen state contract

Every screen defines:
- loading
- success
- empty
- disabled
- error
- offline
- permission/feature gated

## 59. Navigation

Primary game navigation should not exceed a small stable set:
- Home
- Coop
- Quests
- Games
- Arena
- Inventory/Profile via secondary navigation

Final IA after UX prototype.

## 60. New monetization screens

Source: **MONETIZATION_LIVEOPS_SPEC.md**.

- GE shortfall decision: earn through QuRa / purchase GE / keep saving.
- Season Pass hub, free/premium tracks, pass purchase, retrospective claim, season completion.
- Paid chest detail: full odds, pity progress, duplicate policy, confirmed purchase and result.
- Golden Piggy Bank progress, guaranteed offer contents, purchase and claim.
- Starter Bundle one-time offer.
- Contextual offers strip (max 3–5, hide option), collection preview, season cosmetics.
- Purchase history, refunds and recovery/entitlement pending states.

Use **SPRITE_PRODUCTION_BATCHES.md** for referenced icons and objects; no price text burned into images.

## B1. Покупка дополнительного яйца

Тип: известная основательница либо загадочное яйцо с раскрытием шансов. Цена GE, нехватка и варианты **«Заработать GE / Купить GE / Продолжить копить»**. При переполнении — «В гостях»; экземпляр всегда начинается L1.

## B3. Защита Arena

Выбор roster, позиций, Агрессивной/Осторожной/Хитрой тактики и объяснения вероятностного выбора; отдельный журнал защитных боёв, летопись, награды.

## B6. 3D-заказ

17 000 ₽; понятный путь заказа, паспорт и QR, статус доставки, условия отмены/возврата, судьба цифровой курочки.

## C. Новые экраны

**Платежи как корм:** после подтверждённой операции — ненавязчивая анимация «Корм доставлен», тип корма, эффект и срок; на курочке FED/HAPPY, без красного голода. **Кланы-фермы:** создать/найти/вступить, приветствие для реферала без авто-вступления, список участников и ролей, общие цели/наградная вкладка/рейтинг, клан токен-проекта. **Community:** прогресс-бар N кормлений, силуэт седьмой, вехи, вклад. **Событие дня:** два понятных выбора, кнопка «Решить», анимированная развязка до 10 секунд и Lucky Flip; по окончании московских суток default без дополнительного штрафа. **Arena Home:** locked 2×2/3×3; four-player Future.
