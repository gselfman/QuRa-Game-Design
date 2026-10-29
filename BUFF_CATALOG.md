# QuRa Buff Catalog v1

**Статус:** catalog framework + approved tactical archetypes  
**Sources:** Game Bible §26, Arena Spec

## 0. Two classes

### Preparation Buff
Activated before battle; duration time/N matches.

### Tactical Consumable
Activated inside match; finite one-use item.

## 1. Required fields

- id
- name
- rarity
- class
- source
- target_scope
- activation_window
- duration
- condition
- effect
- engine_hook
- stacking_group
- stack_cap
- visibility
- ranked_legality
- consumable
- chronicle_template

## 2. Target scopes

- SELF_CHICKEN
- ALLY_CHICKEN
- ENEMY_CHICKEN
- MY_TEAM
- ENEMY_TEAM
- BATTLEFIELD

## 3. Duration

- INSTANT
- ROUND
- BATTLE
- TIMED
- N_MATCHES
- CONDITIONAL

## 4. Sources

- mini-games
- chests
- quests
- events
- season rewards
- achievements
- GE shop

## 5. Loadout

Working hypothesis:
- 3 tactical consumables per match;
- one instance one use;
- usually max one activation per round.

## 6. Catalog: comeback

### DOUBLE_POWER
Name: Двойная сила
Rarity: Epic/Legendary candidate
Scope: SELF_CHICKEN
Condition: living mine =1 and living enemy >=2
Duration: ROUND
Effect: primary selected action effect ~×2 with per-action caps
Chronicle: «печать Двойной силы вспыхнула...»

### LAST_FEATHER
Последнее перо
Scope: SELF_CHICKEN
Trigger: lethal damage
Effect: survive at 1 HP once
Duration: trigger
Rule for repeated same-round lethal collision: OPEN

### PHOENIX
Феникс
Rarity: Legendary/Artifact
Trigger: death
Effect: revive once with limited HP
Ranked legality: requires simulation

## 7. Catalog: defense

### INVULNERABILITY
Неуязвимость
Scope: SELF_CHICKEN
Duration: ROUND
Effect: incoming damage=0; harmful secondary effects baseline blocked
Does not block Gods Lightning

### BATTLE_DOME
Боевой купол
Scope: MY_TEAM
Duration: ROUND
Effect: temporary Shield all living allies

### STONE_SKIN
Каменная кожа
Scope: SELF_CHICKEN
Duration: ROUND/BATTLE depending item
Effect: Defense boost

### TURTLE_FORMATION
Черепаший строй
Scope: MY_TEAM
Duration: ROUND
Effect: Defense up, possible Speed down

### MIRROR
Зеркало
Scope: SELF_CHICKEN
Duration: ROUND
Effect: first harmful debuff reflected or canceled
Final variant TBD

## 8. Catalog: offense

### ADRENALINE
Адреналин
Scope: ALLY_CHICKEN
Duration: ROUND
Effect: Attack and/or Speed up

### BATTLE_CRY
Боевой клич
Scope: MY_TEAM
Duration: ROUND
Effect: Attack up

### SHIELD_BREAKER
Щитолом
Scope: SELF_CHICKEN
Duration: next Attack
Effect: partially ignores Shield

### ANTI_SHIELD
Антищит
Scope: ENEMY_CHICKEN
Effect: remove part of active Shield

### HUNTER_MARK
Метка охотника
Scope: ENEMY_CHICKEN
Duration: ROUND
Effect: target receives increased team damage

### RETRIBUTION
Возмездие
Scope: SELF_CHICKEN
Duration: ROUND
Effect: source of incoming damage receives response damage

## 9. Catalog: sustain

### SECOND_WIND
Второе дыхание
Scope: ALLY_CHICKEN
Effect: instant HP heal

### TEAM_MEDIC
Общий медик
Scope: MY_TEAM
Effect: small heal all living allies

### CLEAR_MIND
Чистая голова
Scope: ALLY_CHICKEN
Effect: remove weaken/debuff

## 10. Catalog: Special control

### CHARGE
Заряд
Scope: ALLY_CHICKEN
Effect: +Special charge

### OVERLOAD
Перегрузка
Condition: Special ready
Effect: Special direct effect up, optional post-penalty

### SPECIAL_ECHO
Эхо Special
Effect: repeat portion of Special at reduced coefficient
No recursive echo

### SILENCE
Тишина
Scope: ENEMY_CHICKEN
Duration: ROUND
Effect: Special unavailable
Rare hard-control

### BREAK_CONCENTRATION
Сбить концентрацию
Scope: ENEMY_CHICKEN
Effect: reduce charge

## 11. Catalog: positional

### SMOKE
Дымовая завеса
JRPG:
- target cannot be manually selected if alternative legal targets exist
Wall:
- not active until explicit positional rule

### INTERCEPT
Перехват
Scope: ALLY relation
Effect: one fighter receives action intended for ally
JRPG-focused

### SWAP
Обмен местами
Scope: own two fighters
Window: before action lock
Effect: swap positions
Strong in Wall

### REFORM
Перестройка
Scope: MY_TEAM
Effect: reorder living fighters before next round

## 12. Catalog: randomness

### JOKER
Джокер
Effect from transparent controlled table
Must be simulation-safe
No hidden impossible jackpot

## 13. Preparation Buffs

### BATTLE_BREAKFAST
Боевой завтрак
+HP temporary across duration

### COOP_CHARM
Оберег Курятника
+Defense

### STRONG_COFFEE
Крепкий кофе
+Speed

### BLESSING
Благословение
character-specific Special modifier

## 14. Stacking

Each buff defines stack_group.

Default:
- same group not infinite;
- strongest or capped sum;
- absolute effects usually non-stackable.

## 15. Visibility

When activated:
- effect shown to both players unless specifically secret by design;
- Chronicle records it.

Secret live hidden buffs require explicit fairness review.

## 16. Ranked legality

Possible values:
- ALLOWED
- LIMITED
- FRIENDLY_ONLY
- ASYNC_ONLY
- BANNED

Strong control/revive buffs require balance validation.

## 17. Economy

Value depends on:
- win-rate uplift;
- activation flexibility;
- rarity;
- condition strictness;
- ranked legality.

Comeback buffs can be strong because condition restricts use.

## 18. Anti-pay-to-win

- strong buffs obtainable via gameplay;
- per-match limit;
- ranked allowlist;
- no unlimited direct purchase advantage;
- telemetry by buff win-rate uplift.

## 19. Processing order

1. eligibility
2. reserve item
3. pre-position
4. pre-round
5. action lock
6. action modifiers
7. resolve
8. on-hit
9. survival
10. end-round
11. consume
12. chronicle

## 20. Acceptance test

Buff must answer:
- when can use?
- who targeted?
- duration?
- exact engine hook?
- stacking?
- cap?
- visible?
- ranked?
- consumed when?
- Chronicle text?

