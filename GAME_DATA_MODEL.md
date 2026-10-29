# QuRa — модель игровых данных v1

**Статус:** системная модель данных  
**Источники:** GAME_BIBLE_V1.md, ARENA_SPEC_V1.md, GAME_DEPENDENCY_GRAPH.md

## 0. Принципы

- сервер является источником истины;
- каждая игровая сущность имеет стабильный id;
- личное имя курочки хранится на instance, тип — на archetype;
- временное состояние боя не смешивается с permanent profile state;
- все GE/XP/reward изменения имеют audit/source;
- все state machines хранятся явно.

## 1. Account

Поля:
- account_id
- user_id
- locale
- timezone
- created_at
- main_chicken_id nullable
- coolness_total_cached
- glory_current
- league_id (FUTURE)
- settings_json
- feature_flags_snapshot optional

Связи:
- 1:N ChickenInstance
- 1:N InventoryItem
- 1:N BuffInventoryItem
- 1:N QuestProgress
- 1:N AchievementProgress
- 1:N RewardLedger
- 1:N ArenaParticipant

## 2. ChickenArchetype

Системный тип/титул.

Поля:
- archetype_id
- code
- title_ru
- title_en
- description
- base_hp
- base_attack
- base_defense
- base_speed
- gift_id
- maneuver_id
- special_id
- native_set_id nullable
- active
- version

Примеры code:
- ryaba
- fighter
- fool
- professor
- monk
- glamour

## 3. ChickenInstance

Конкретная принадлежащая игроку курочка.

Поля:
- chicken_id
- account_id
- archetype_id
- personal_name
- lifecycle_stage
- level
- xp
- xp_total
- is_main
- acquired_source
- acquired_at
- legacy_generation
- legacy_bonus_json
- embodied_3d_at nullable
- status
- created_at
- updated_at

Invariant:
- personal_name не меняет mechanics;
- archetype_id не меняется rename-flow;
- одна instance занимает одно место Coop независимо от lifecycle stage.

## 4. ChickenNamingHistory

Для moderation/audit:
- id
- chicken_id
- old_name
- new_name
- changed_at
- moderation_status
- actor

## 5. GiftDefinition

- gift_id
- code
- family
- effect_type
- effect_json
- stacking_group
- cap_json
- applicable_systems
- active

Gift по умолчанию не влияет на Arena без explicit hook.

## 6. ManeuverDefinition

- maneuver_id
- archetype_id
- name
- narrative_template
- base_effect_json
- engine_hook
- version

## 7. SpecialDefinition

- special_id
- archetype_id
- name
- charge_required
- effect_json
- defense_interaction_json
- rng_table nullable
- narrative_template
- version

## 8. GearDefinition

Каталог предметов.

Поля:
- gear_id
- code
- name
- category
- slot
- rarity
- min_level
- ignore_level_gate
- coolness_value
- native_archetype_id nullable
- set_id nullable
- stat_modifiers_json
- advanced_effects_json
- visual_asset_id
- active
- version

Каждый stat/effect обязан ссылаться на approved engine hook.

## 9. GearInstance

Если нужны индивидуальные экземпляры:
- gear_instance_id
- gear_id
- account_id
- acquired_source
- acquired_at
- equipped_chicken_id nullable
- locked
- metadata_json

Если item не имеет individual properties, можно оптимизировать stackable inventory, но data contract должен сохранять provenance.

## 10. EquipmentSlot

- chicken_id
- slot
- gear_instance_id
- equipped_at

Unique:
- chicken_id + slot

## 11. GearSetDefinition

- set_id
- name
- archetype_affinity nullable
- thresholds_json
- effects_json
- coolness_bonus_json

## 12. Inventory

Разделяется логически:

### Gear inventory
- unequipped gear

### Buff inventory
- consumables

### Reward overflow
- временная доставка при переполнении

Не объединять chicken capacity с item capacity.

## 13. BuffDefinition

- buff_id
- code
- name
- rarity
- class: preparation / tactical
- duration_type: instant / round / battle / timed / matches
- target_scope
- activation_window
- condition_json
- effect_json
- engine_hook
- stacking_group
- stack_cap
- visibility
- ranked_legality
- chronicle_template
- active
- version

## 14. BuffInventoryItem

- buff_inventory_id
- account_id
- buff_id
- quantity
- source_type
- source_id
- expires_at nullable

## 15. ArenaBuffLoadout

- loadout_id
- account_id
- format
- buff_slots_json
- updated_at

## 16. QuestDefinition

- quest_id
- code
- scope_type:
  - ACCOUNT_ONCE
  - CHICKEN_ONCE
  - DAILY_ACCOUNT
  - WEEKLY_ACCOUNT
  - ACHIEVEMENT_ACCOUNT
- trigger_type
- condition_json
- reward_id
- feature_gate
- active
- version

## 17. QuestProgress

- progress_id
- account_id
- chicken_id nullable
- quest_id
- period_key nullable
- progress_value
- status
- completed_at
- claimed_at

Unique key depends on scope.

## 18. RewardDefinition

- reward_id
- reward_type
- payload_json
- random_table_id nullable
- claim_policy
- overflow_policy

## 19. RewardLedger

Обязательный audit trail:
- reward_ledger_id
- account_id
- source_type
- source_id
- reward_id
- granted_payload_json
- status
- created_at
- correlation_id

## 20. GE Ledger

Никогда не хранить только balance без ledger.

- ge_tx_id
- account_id
- direction: credit/debit
- amount
- source_type
- source_id
- balance_before
- balance_after
- budget_bucket nullable
- correlation_id
- created_at

## 21. XP Ledger

- xp_tx_id
- account_id
- chicken_id
- amount
- source_type
- source_id
- xp_before
- xp_after
- level_before
- level_after
- created_at

## 22. TicketLedger

- ticket_tx_id
- account_id
- direction
- amount
- source_type
- source_id
- before
- after
- created_at

## 23. MiniGameAttempt

- attempt_id
- account_id
- game_code
- entry_type: ticket/ge/free
- entry_amount
- started_at
- finished_at
- score
- verified_result_json
- reward_ledger_id nullable
- anti_fraud_status

## 24. ChestDefinition

- chest_id
- name
- rarity_table_id
- progression_pool_rule
- pity_rule_id nullable
- paid
- price_ge nullable
- active

## 25. ChestOpen

- chest_open_id
- account_id
- chest_id
- source
- rng_seed_server
- result_json
- pity_before
- pity_after
- created_at

## 26. DailyEventDefinition

- event_id
- code
- category
- rarity
- base_outcome_json
- negative
- lucky_flip_outcome_json nullable
- hard_counter_family nullable
- cooldown_rule
- narrative_variants_json

## 27. DailyEventRun

- date_key
- event_id
- global_seed
- published_at

## 28. AccountDailyEventResult

- account_id
- date_key
- event_id
- resolved_outcome
- applied_modifiers_json
- source_gifts_json

## 29. Coop

Единственная изменяемая запись tier/capacity хранится в Coop; Account не содержит независимых полей tier/capacity:
- coop_id
- account_id
- tier
- capacity
- upgrade_history_json

## 29.1. ArenaDefenseSetup — сохранённая защита (MVP)

- `defense_setup_id` — первичный ключ;
- `account_id`, `chicken_id` (взрослая L4+);
- `equipment_snapshot_json` для просмотра, но в бою формируется отдельный immutable `ArenaFighterSnapshot`;
- `policy_code`: AGGRESSIVE | CAUTIOUS | CUNNING;
- `policy_parameters_json`, `policy_version`, `updated_at`;
- `active` — только после явного сохранения игроком.

Одна активная защита на аккаунт для стартового 1×1; изменение настроек влияет лишь на последующие бои. Политика по умолчанию CAUTIOUS.

## 29.2. ArenaDefensePool — индекс доступности

- `account_id`, `defense_setup_id`, `chicken_id`, `level`, `battle_power`;
- `active`, `last_defended_at`, `daily_defenses_count`;
- `antifraud_relation_hashes` / refs для исключения связанных аккаунтов (без раскрытия сырых персональных данных).

Поиск: случайный среди level ±2 (PROTOTYPE BALANCE) и близкого BP (OPEN), расширение окна, при отсутствии — `opponent_kind=BOT` с явной пометкой и уменьшенным призом. Нельзя выбрать определённого защитника. После подбора обе стороны фиксируются в `ArenaFighterSnapshot`.

## 29.3. FUTURE — ArenaSeasonEnrollment

`ArenaSeasonEnrollment`: account_id, season_id, defense_setup_id, joined_at, status. Не применяется для MVP async и не нужен для участия без рейтинга.

## 30. ArenaMatch

- match_id
- format
- mode
- status
- ranked
- friendly
- async
- created_at
- started_at
- ended_at
- server_version
- engine_version
- round_current
- winner_participant_id nullable
- result_reason
- ge_settlement_status
- glory_settlement_status

## 31. ArenaParticipant

- participant_id
- match_id
- account_id
- side/team_id
- crest
- battle_power_snapshot
- morale_snapshot
- preparation_buff_snapshot
- team_snapshot_json
- buff_loadout_snapshot_json
- ready
- result

Для 4-player side/team_id поддерживает FFA и 2×2.

## 32. ArenaFighterSnapshot

На старт боя:
- fighter_id
- match_id
- participant_id
- chicken_id
- archetype_id
- personal_name_snapshot
- position
- max_hp
- attack
- defense
- speed
- gear_snapshot_json
- permanent_effects_json

После старта permanent snapshot не мутирует.

## 33. ArenaFighterState

Текущее battle-state:
- fighter_id
- hp
- shield
- special_charge
- alive
- statuses_json
- temporary_modifiers_json
- current_position

## 34. ArenaRound

- round_id
- match_id
- round_number
- phase
- started_at
- decision_deadline
- resolved_at
- result_json
- team_score_json

## 35. ArenaAction

- action_id
- round_id
- participant_id
- fighter_id
- command_id
- action_type
- target_fighter_id nullable
- buff_activation_id nullable
- submitted_at
- locked_at
- hidden_until_resolve
- validation_status

Unique:
- round_id + fighter_id

Duplicate command_id idempotent.

## 36. ArenaBuffActivation

- activation_id
- match_id
- round_id nullable
- participant_id
- buff_inventory_id
- buff_id
- target_json
- activation_window
- status
- effect_snapshot_json

States:
PENDING → ACCEPTED → APPLIED → CONSUMED
or REJECTED/ROLLED_BACK.

## 37. ArenaCollisionResult

- collision_id
- round_id
- fighter_a
- fighter_b
- action_a
- action_b
- before_json
- effect_log_json
- after_json
- winner_side nullable

## 38. ArenaStatusEffect

Normalized option if statuses need queryability:
- status_id
- match_id
- fighter_id
- effect_type
- source_id
- stack_group
- value_json
- applied_round
- expires_round nullable
- consumed_at nullable

## 39. ArenaChronicle

- chronicle_id
- match_id
- round_id nullable
- narrative_text
- technical_json
- template_version
- created_at

Narrative is derived from engine facts, never source of truth.

## 40. ArenaChatMessage

- message_id
- match_id
- sender_participant_id
- channel_type: all/team/private
- recipient_participant_id nullable
- text/emote
- created_at
- moderation_status

Server controls visibility.

## 41. ArenaRentalFee и ArenaPrizeGrant

### ArenaRentalFee
- rental_fee_id
- match_id, participant_id, account_id
- amount_ge
- debit_ledger_tx_id, refund_ledger_tx_id nullable
- state: PENDING | DEBITED | REFUNDED | SETTLED
- correlation_id

### ArenaPrizeGrant
- prize_grant_id, match_id, winner_participant_id
- chest_definition_id, chest_open_id nullable
- reward_ledger_id nullable
- correlation_id (unique)
- status: PENDING | GRANTED | FAILED_RETRY

Прямой GE payout другому участнику не создаётся. Повторный callback не должен выдавать второй сундук.


## 42. GloryLedger

- glory_tx_id
- account_id
- match_id
- amount
- reason
- rating_before
- rating_after
- season_id

## 43. Season

- season_id
- starts_at
- ends_at
- rules_version
- ranked_format
- league_thresholds_json
- reward_table_id
- status

## 44. League

- league_id
- code
- name
- min_rating
- max_rating nullable

## 45. HallOfFame

- season_id
- rank
- account_id
- team_snapshot_json
- medal

## 46. ReferralReward

- reward_id
- inviter_account_id
- referred_account_id
- level
- qualifying_event_id
- ge_amount
- status

## 47. FeatureFlag

- flag
- enabled
- rollout_rule_json
- valid_from
- valid_to

Quest/reward generation references flags.

## 48. OverflowPackage

- package_id
- account_id
- payload_type
- payload_json
- reason
- expires_at
- status

## 49. 3D Legacy

### Embodiment
- embodiment_id
- chicken_id
- account_id
- physical_passport_id
- one_time_claim_hash
- embodied_at

### Heir
- heir_id
- parent_chicken_id
- child_chicken_id
- generation
- legacy_bonus_json

## 50. Машины состояний

### Chicken lifecycle
EGG_L1 → EGG_L2 → CHICK_L3 → ADULT_L4 → PROGRESSION → L15_ELIGIBLE → L20_MAX

### Reward
CREATED → GRANTED → DELIVERED
or OVERFLOW → CLAIMED/EXPIRED

### Arena match
CREATED → LOBBY → TEAM_LOCK → FIGHT → DONE
Exceptional:
CANCELED / ABORTED / TECHNICAL_RESULT

### Arena round
START → DECISION → LOCKED → RESOLVE → REVEAL → END

### Quest
AVAILABLE → IN_PROGRESS → COMPLETED → CLAIMED

### Buff activation
PENDING → VALIDATED → APPLIED → CONSUMED

## 51. Обязательные идентификаторы

Use immutable ids for:
- account
- chicken
- archetype
- gear
- buff
- quest
- reward
- match
- participant
- round
- action
- ledger tx

Display names are never keys.

## 52. Версионирование

Version independently:
- Battle Engine
- archetype definitions
- gear definitions
- buff definitions
- quest definitions
- reward tables
- economy config
- season rules

Match stores versions used at start.

## 53. Инварианты аудита

1. GE balance reconciles to GE Ledger.
2. XP reconciles to XP Ledger.
3. Reward delivered once per correlation id.
4. Battle result generated only server-side.
5. Action command id idempotent.
6. Match snapshots immutable after start.
7. Hidden action not exposed before resolve.
8. Personal rename cannot alter archetype.
9. Temporary modifier never persists into permanent stat row.
10. Any paid canceled activity must have settlement record.

## 53.1. Недостающие сущности и связи

### 55. EggOffer

id, archetype_id nullable, mystery_pool_id nullable, price_ge, version, active.

### 56. ChickenPurchase

id, account_id, offer_id, chicken_id, ge_ledger_tx_id, correlation_id, state.

### 57. ChickenInstance.acquired_source

START | PATH_QUEST | SHOP_SPECIFIC | SHOP_MYSTERY | CHEST | EVENT | LEGACY.

### 58. ArenaDefenseSetup

id, account_id, roster, positions, policy_code, policy_params, version.

### 59. ArenaSeasonEnrollment

account_id, season_id, defense_setup_id, joined_at, state. Вместо одного `arena_enrolled`.

### 60. AchievementDefinition

id, condition_json, reward_id, feature_gate, version.

### 61. AchievementProgress

account_id, achievement_id, progress, completed_at, claimed_at.

### 62. FriendRelation

account_a, account_b, status, created_at.

### 63. MiniGameDefinition

code, ticket_cost, retry_price_ge, reward_table_id, caps, version.

### 64. FigurineOrder

order_id, account_id, chicken_id, price_rub=17000, status, payment_id, logistics, passport_id, qr_claim_id, refund_status.

### 65. FeedEvent

id, account_id, operation_source_type, operation_source_id, feed_type, effect_family, effect_json, applied_at, expires_at, correlation_id(unique).

### 66. FeedState

account_id/chicken_id, status: NEUTRAL | FED | HAPPY, active_effects, expires_at. Не ресурс/валюта.

### 67. Clan

id, name, crest, banner, partner_token_project_id nullable, visibility, max_members, owner_id, created_at, moderation_status.

### 68. ClanMember

clan_id, account_id, role: OWNER | ELDER | MEMBER, joined_at, contribution_window, state.

### 69. ClanGoal

id, clan_id, week_key, goal_type, target, progress, reward_id, cap_per_member, version.

### 70. ClanContribution

clan_goal_id, account_id, confirmed_source_id, amount, idempotency_key.

### 71. CommunityGoal

id, code, target_n, progress, milestone_json, status, starts_at, achieved_at, version.

### 72. CommunityContribution

goal_id, account_id, feed_event_id, amount, unique correlation_id.

### 73. DailyEventChoice

id, account_id, msk_day, event_id, choice_code, chosen_at nullable, applied_default, outcome_json, unique(account_id,msk_day).

**Только тестовые аккаунты:** миграция игровой прогрессии идемпотентна, не затрагивает GE Ledger. Сохранить или сбросить Рябу — OPEN.

## 54. Следующий документ dependency

ECONOMY_MODEL.md consumes:
- ledgers;
- reward sources;
- Arena settlement;
- mini-game attempt;
- passive emission;
- chest EV.
