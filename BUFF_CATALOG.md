# QuRa — каталог бафов v1

**Статус:** catalog framework + approved tactical archetypes  
**Источники:** Game Bible §26, Arena Spec

## 0. Два класса

### Preparation баф
Активируется до боя, действует ограниченное время или число матчей.

### Тактический расходник
Активируется во время боя; предмет расходуется при применении.

## 1. Обязательные поля

- id
- name
- редкость
- class
- источник
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

## 2. Области применения

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

## 4. Источники

- mini-games
- сундуки
- quests
- events
- season награды
- achievements
- GE магазин

## 5. Loadout

Рабочая гипотеза:
- до трёх тактических расходников на матч;
- один экземпляр — одно применение;
- обычно не более одной активации за раунд.

## 6. Catalog: возвращение в бой

### DOUBLE_POWER
Name: Двойная сила
Редкость: возможные варианты Epic/Legendary
Scope: SELF_CHICKEN
Условие: один живой союзник и не менее двух живых противников
Duration: ROUND
Эффект: основное действие усиливается примерно вдвое с ограничениями для каждого типа
Chronicle: «печать Двойной силы вспыхнула...»

### LAST_FEATHER
Последнее перо
Scope: SELF_CHICKEN
Trigger: lethal урон
Эффект: один раз пережить смертельный урон и остаться с 1 HP
Длительность: одно срабатывание
Повторный смертельный урон в том же раунде: решение OPEN

### PHOENIX
Феникс
Редкость: Legendary/Artifact
Trigger: death
Эффект: однократное возвращение с ограниченным HP
Допуск в рейтинг требует симуляции

## 7. Catalog: защита

### INVULNERABILITY
Неуязвимость
Scope: SELF_CHICKEN
Duration: ROUND
Effect: incoming урон=0; harmful secondary effects baseline blocked
Не защищает от Молнии богов

### BATTLE_DOME
Боевой купол
Scope: MY_TEAM
Duration: ROUND
Effect: временный Щит all living allies

### STONE_SKIN
Каменная кожа
Scope: SELF_CHICKEN
Длительность: раунд или бой — зависит от предмета
Effect: Защита boost

### TURTLE_FORMATION
Черепаший строй
Scope: MY_TEAM
Duration: ROUND
Effect: Защита up, possible Скорость down

### MIRROR
Зеркало
Scope: SELF_CHICKEN
Duration: ROUND
Эффект: первый негативный статус отражается либо отменяется
Окончательный вариант ещё не выбран

## 8. Catalog: offense

### ADRENALINE
Адреналин
Scope: ALLY_CHICKEN
Duration: ROUND
Эффект: повышение Атаки и/или Скорости

### BATTLE_CRY
Боевой клич
Scope: MY_TEAM
Duration: ROUND
Effect: Атака up

### SHIELD_BREAKER
Щитолом
Scope: SELF_CHICKEN
Duration: next Атака
Effect: partially ignores Щит

### ANTI_SHIELD
Антищит
Scope: ENEMY_CHICKEN
Effect: remove part of active Щит

### HUNTER_MARK
Метка охотника
Scope: ENEMY_CHICKEN
Duration: ROUND
Эффект: отмеченная цель получает повышенный урон от команды

### RETRIBUTION
Возмездие
Scope: SELF_CHICKEN
Duration: ROUND
Effect: источник of incoming урон receives response урон

## 9. Catalog: выживаемость

### SECOND_WIND
Второе дыхание
Scope: ALLY_CHICKEN
Effect: instant HP лечение

### TEAM_MEDIC
Общий медик
Scope: MY_TEAM
Effect: small лечение all living allies

### CLEAR_MIND
Чистая голова
Scope: ALLY_CHICKEN
Эффект: удалить ослабление/негативный статус

## 10. Catalog: Особый приём control

### CHARGE
Заряд
Scope: ALLY_CHICKEN
Effect: +Особый приём charge

### OVERLOAD
Перегрузка
Condition: Особый приём ready
Effect: Особый приём direct effect up, optional post-penalty

### SPECIAL_ECHO
Эхо Особый приём
Effect: repeat portion of Особый приём at reduced coefficient
Повторное эхо не порождает новую цепочку

### SILENCE
Тишина
Scope: ENEMY_CHICKEN
Duration: ROUND
Effect: Особый приём unavailable
Редкий эффект жёсткого контроля

### BREAK_CONCENTRATION
Сбить концентрацию
Scope: ENEMY_CHICKEN
Эффект: уменьшить заряд Special

## 11. Catalog: positional

### SMOKE
Дымовая завеса
JRPG:
- нельзя выбрать цель вручную, пока есть другие допустимые цели
Wall:
- не используется до утверждения позиционного правила

### INTERCEPT
Перехват
Область: союзная курочка
Эффект: одна курочка принимает действие, направленное на союзницу
JRPG-focused

### SWAP
Обмен местами
Область: две свои курочки
Момент: до фиксации действий
Эффект: поменять позиции
Strong in Wall

### REFORM
Перестройка
Scope: MY_TEAM
Эффект: изменить позиции живых курочек перед следующим раундом

## 12. Catalog: randomness

### JOKER
Джокер
Эффект из опубликованной таблицы случайных исходов
Должен быть проверяем в симуляции
Без скрытого или недостижимого джекпота

## 13. Бафы подготовки

### BATTLE_BREAKFAST
Боевой завтрак
+HP временный across duration

### COOP_CHARM
Оберег Курятника
+Защита

### STRONG_COFFEE
Крепкий кофе
+Скорость

### BLESSING
Благословение
character-specific Особый приём modifier

## 14. Stacking

Каждый баф определяет группу совместимости эффектов.

Default:
- эффекты одной группы не накапливаются бесконечно;
- сильнейший эффект либо сумма в пределах ограничения;
- абсолютные эффекты, как правило, не суммируются.

## 15. Visibility

При применении:
- эффект видят оба игрока, если для него специально не утверждена скрытность;
- летопись фиксирует применение.

Secret живой hidden бафы require explicit fairness review.

## 16. Допуск в рейтинговые бои

Возможные значения:
- ALLOWED
- LIMITED
- FRIENDLY_ONLY
- ASYNC_ONLY
- BANNED

Strong control/revive бафы require balance validation.

## 17. Economy

Ценность зависит от:
- win-rate uplift;
- гибкость применения;
- редкость;
- жёсткость условия активации;
- ranked legality.

Бафы для возвращения в бой могут быть сильнее, поскольку имеют строгое условие активации.

## 18. Anti-pay-to-win

- strong бафы obtainable via gameplay;
- ограничение применений на матч;
- список бафов, разрешённых в рейтинге;
- покупка не должна давать неограниченного преимущества;
- аналитика прироста побед из-за бафа.

## 19. Порядок обработки

1. eligibility
2. зарезервировать расходник
3. pre-position
4. pre-round
5. зафиксировать действие
6. модификаторы действия
7. resolve
8. on-hit
9. survival
10. end-round
11. consume
12. chronicle

## 20. Критерии приёмки

баф must answer:
- когда разрешено использовать?
- какая выбрана цель?
- duration?
- какой именно обработчик движка?
- stacking?
- лимит?
- visible?
- ranked?
- когда расходник списывается?
- какой текст попадёт в летопись?

