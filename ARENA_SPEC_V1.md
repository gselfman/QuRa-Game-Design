# QuRa — спецификация Arena v1

**Статус:** рабочая продуктовая спецификация / основной источник истины по боевой системе Arena  
**Дата:** 29.10.2026  
**Основание:** QuRa Game Bible v1 + решения, проверенные на интерактивном прототипе Arena 3×3  
**Область:** Battle Engine, действия, режимы, характеристики, персонажи, аксессуары, buffs, Battle Power, online/async/bot, экономика входа, таймеры, чат, летопись и социальные функции.

> Если этот документ противоречит старому Arena-разделу Game Bible, по механике боя приоритет имеет Arena Spec. Game Bible остаётся источником истины по общей игровой системе QuRa.

---

# 0. Статусы решений

В документе используются три статуса.

## LOCKED
Принцип утверждён и должен сохраняться при реализации, если не создан отдельный decision record.

## PROTOTYPE BALANCE
Механика подтверждена прототипом, но конкретные цифры являются рабочими и должны быть проверены симуляциями и playtest.

## OPEN
Решение ещё не закрыто. Нельзя молча превращать его в production rule.

---

# 1. Цель Arena

Arena должна создавать не «автоматическое сравнение статов», а **читаемый психологический пошаговый бой**, в котором важны:

- состав команды;
- индивидуальные особенности курочек;
- скрытый выбор действий;
- чтение поведения соперника;
- позиционирование;
- работа с численным большинством/меньшинством;
- накопление Special;
- экипировка;
- tactical buffs;
- риск;
- социальное взаимодействие;
- литературная история боя.

Arena должна давать реальное применение:

- HP;
- Attack;
- Defense;
- Speed;
- Maneuver;
- Special;
- Shield;
- Heal;
- Special charge;
- buffs/debuffs;
- аксессуарам;
- комплектам;
- Arena consumables.

**LOCKED:** в QuRa не должно существовать combat-stat, который показывается на предмете, но не участвует ни в одном реальном расчёте Battle Engine.

---

# 2. Идентичность бойца

У каждой курочки два слоя идентичности:

1. **Тип / титул / сословие** — системный архетип.
2. **Личное имя** — имя конкретного экземпляра, заданное игроком.

Примеры:

- Профессор Иванов;
- Боевик Петров;
- Дурочка Мурочка;
- Гламурочка Анжелла;
- Ряба Глаша;
- Монах Тихон.

Тип определяет:

- базовые stats;
- Maneuver;
- Special;
- character-specific effects;
- native gear;
- set synergies.

Личное имя не влияет на механику.

## 2.1. Герб команды

В live Arena игрок выбирает герб команды.

Примеры доступных гербов прототипа:

🐺 🦁 🐀 🐇 🔥 💧 💨 🌳 ⚔️ 🛡️ 🏰 🪖 🐍 🎸 ☀️ 🌙 ✝️

Правила:

- один и тот же герб нельзя выбрать двум игрокам одного матча;
- герб используется рядом с именем каждого бойца;
- герб обязателен в летописи при одинаковых типах или именах.

Формат:

**🐺 Профессор Иванов**  
**🌙 Профессор Смит**

---

# 3. Форматы Arena и доступность

**На старте:** живой 1×1 с другом; бесплатная тренировка 1×1 с ботом; асинхронный вызов защитной тактики. В витрине доступны заблокированные карточки 2×2/3×3 как цели коллекции (2/3 взрослые курочки, Курятник 4+). 2×2 и 3×3 реализуются после MVP. **Четыре игрока — Future**, не MVP. Прототип 3×3 сохраняется как экспериментальный стенд, не production-доступность.


# 4. Два режима командного боя

# 4.1. «Стенка на стенку»

**LOCKED.**

Позиции имеют значение.

Базовая логика:

- позиция 1 сталкивается с позицией 1;
- позиция 2 — с 2;
- позиция 3 — с 3.

После смерти бойца линия автоматически перестраивается.

Пример:

Игрок A:
- A1
- A2
- A3

Игрок B:
- B1 погиб
- B2
- B3

Следующий расчёт может дать:

- A1 → B2
- A2 → B2
- A3 → B3

То есть одна курочка может одновременно участвовать в нескольких столкновениях.

**LOCKED:** одна курочка выбирает **одно действие на раунд**, и это действие используется во всех её столкновениях этого раунда.

Следствие:

- один сильный выбор способен выиграть несколько столкновений;
- один плохой выбор способен проиграть несколько;
- это создаёт камбэк 1×2 и 1×3.

## 4.2. JRPG / свободная цель

**LOCKED.**

Для каждой живой курочки игрок выбирает:

- действие;
- при необходимости цель.

Attack / Maneuver / Special требуют живую цель.

Defense цели не требует.

Можно:

- атаковать разные цели;
- сфокусировать две или три курочки в одну;
- защищать уязвимого бойца через собственный выбор.

---

# 5. Раунд

Каждый раунд состоит из фаз.

## 5.1. Start of Round

Сервер фиксирует:

- живых бойцов;
- HP;
- Shield;
- Special charge;
- временные statuses;
- buffs;
- позиции;
- доступные actions/targets.

## 5.2. Decision Этап

Игроки одновременно и скрытно выбирают действия.

Противник видит только факт:

- ход ещё не сделан;
- ход уже зафиксирован.

Само действие до reveal не показывается.

## 5.3. Lock

После подтверждения:

- ход нельзя менять;
- сервер фиксирует commandId;
- повторная доставка того же пакета не создаёт второй ход.

## 5.4. Resolve

Battle Engine рассчитывает весь раунд.

## 5.5. Reveal

Игроки получают:

- действия;
- столкновения;
- урон;
- эффекты;
- победителей столкновений;
- новый HP;
- Special charge;
- deaths;
- team score;
- литературную летопись.

## 5.6. End of Round

Если хотя бы у одной стороны остаётся живой боец, начинается следующий раунд.

Если одна команда уничтожена — бой завершён.

---

# 6. Четыре действия

**LOCKED.**

У каждой живой курочки каждый раунд одно действие из четырёх:

1. ⚔️ Attack
2. 🛡️ Defense
3. 🎯 Maneuver
4. ✨ Special

---

# 7. Базовая контр-матрица

Основной психологический треугольник:

**Attack > Maneuver**  
**Maneuver > Defense**  
**Defense > Attack**

Это не единственный фактор, но базовая структура mind-game.

## 7.1. Attack vs Maneuver

Attack ловит бойца во время подготовки Maneuver.

В prototype balance Attack получает усиленный коэффициент урона.

## 7.2. Maneuver vs Defense

Defense ждёт прямой удар.

Maneuver обходит обычный блок и реализует character-specific эффект.

## 7.3. Defense vs Attack

Defense существенно уменьшает прямой Attack и создаёт контратаку.

## 7.4. Special

Special находится поверх треугольника.

Defense обычно снижает его прямой эффект, но:

- не обязательно отменяет secondary effect;
- не всегда полностью останавливает heal/shield/debuff;
- конкретное поведение зависит от персонажа.

---

# 8. Основные боевые характеристики

## 8.1. HP / Жизнь

Определяет максимальный запас здоровья.

HP = 0 → курочка погибает/выбывает.

Аксессуары могут давать HP только потому, что HP реально участвует в survivability.

## 8.2. Attack

Определяет силу обычной Attack и может участвовать в отдельных derived effects.

Prototype formula:

`BaseDamage = max(5, (20 + 1.15 × ATK - 0.72 × DEF) × multiplier)`

**PROTOTYPE BALANCE.**

Attack не обязан усиливать каждый Maneuver и каждый Special.

## 8.3. Defense

Уменьшает обычный Attack damage и участвует в counter damage.

Prototype counter:

`CounterDamage ≈ 15 + 0.45 × defender.DEF - 0.18 × attacker.DEF`

**PROTOTYPE BALANCE.**

Defense не является универсальной защитой от всего.

Это важно:

- Maneuver специально умеет обходить Defense action;
- Special имеет собственную логику;
- Shield — отдельный слой.

## 8.4. Speed

Speed должна давать тактическое преимущество, но **не становиться абсолютным god-stat**.

В текущем prototype:

- Attack × Attack → более быстрый получает небольшой бонус;
- Maneuver × Maneuver → более быстрый получает преимущество;
- JRPG prototype также сортирует действия по Speed.

### OPEN: Speed и отмена уже выбранного действия

Перед production надо решить:

если медленная курочка выбрала ход, но быстрая курочка убила её раньше в последовательности JRPG, выполняется ли уже зафиксированный ход?

Предпочтительное направление:

> скрыто выбранные действия раунда должны считаться зафиксированными; Speed влияет на качество/инициативу столкновения, но не должен автоматически превращаться в «убил раньше — враг вообще не походил».

Причина:

- иначе Speed резко доминирует над HP/Attack/Defense;
- аксессуары +Speed становятся непропорционально сильными;
- мета упрощается до speed race.

Это решение должно быть закрыто симуляцией.

---

## 8.5. Уровень курочки и боевая сила

**Рекомендуемая PROTOTYPE BALANCE модель:** между L4 и L20 HP/Attack/Defense получают суммарный прирост около 25–30%, Speed — меньший. Постоянные надбавки входят в Battle Power. Сначала симуляцией проверить, что gear остаётся главным инструментом build. Альтернатива: уровень открывает предметы, но сам не усиливает бой. До численной симуляции модель не считается LOCKED.

# 9. Shield

Shield — временный запас защиты поверх HP.

Порядок prototype:

1. входящий damage сначала снимает Shield;
2. остаток снимает HP.

Shield не является Defense stat.

Источники:

- Ряба;
- buffs;
- gear effects;
- future sets.

---

# 10. Heal

Heal восстанавливает HP, но не выше max HP.

Heal может быть:

- instant;
- частью Maneuver;
- частью Special;
- buff effect;
- gear modifier.

---

# 11. Special Charge

Каждая курочка имеет Special meter:

**0–100.**

Special доступен при 100.

После применения заряд сбрасывается.

Prototype charge model:

- выигранное столкновение: +35;
- проигранное: +15;
- нейтральное: +20;
- Defense в JRPG prototype: +18.

**PROTOTYPE BALANCE.**

Открытые вопросы:

- единая ли таблица для всех режимов;
- может ли gear изменять charge gain;
- есть ли hard cap на charge modifiers;
- сколько charge даёт участие сразу в нескольких столкновениях.

---

# 12. Базовые персонажи текущего прототипа

В текущей Arena реализованы 6 archetypes.

Седьмая основательница остаётся отдельным решением.

## 12.1. Ряба

Prototype stats:

- HP 108
- ATK 24
- DEF 21
- SPD 18

Maneuver — **Скорлупа**

- 24 damage;
- +10 Shield.

Narrative:

Ряба разбивает золотую скорлупу крылом; мелкие острые осколки летят в противника, крупные остаются вокруг неё как броня.

Special — **Золотая скорлупа**

Prototype:

- ~25 damage;
- +18 Shield;
- против Defense ~11 damage и +14 Shield.

Роль:

- sustain;
- comeback;
- 1×N потенциал;
- shield.

## 12.2. Боевик

Stats:

- HP 112
- ATK 26
- DEF 23
- SPD 14

Maneuver — **Провокация**

- 25 damage;
- следующая Attack +18%.

Special — **Ответочка**

- ~46 damage;
- Defense значительно режет прямой удар.

Роль:

- силовой fighter;
- pressure;
- counterplay.

## 12.3. Дурочка

Stats:

- HP 102
- ATK 24
- DEF 17
- SPD 26

Maneuver — **Финт**

- 31 damage;
- следующая Attack +20%.

Special — **Авось!**

Prototype RNG:

- 10% → 0;
- 65% → ~43;
- 25% → ~58.

Роль:

- speed;
- unpredictability;
- risk/reward.

## 12.4. Профессор

Stats:

- HP 102
- ATK 25
- DEF 19
- SPD 22

Maneuver — **Анализ**

- 26 damage;
- -18 Special charge цели.

Special — **Расчёт**

- ~45 damage;
- Defense снижает прямой эффект.

Роль:

- control;
- charge denial;
- precision.

## 12.5. Монах

Stats:

- HP 110
- ATK 21
- DEF 24
- SPD 15

Maneuver — **Медитация**

- 24 damage;
- heal до 12 HP.

Special — **Благодать**

- heal до 27 HP себе;
- ~18 damage цели.

Роль:

- sustain;
- heal;
- attrition;
- comeback.

## 12.6. Гламурочка

Stats:

- HP 102
- ATK 23
- DEF 19
- SPD 24

Maneuver — **Позирование**

- 27 damage;
- следующая Attack цели -22%.

Special — **Ослепительный выход**

- ~41 damage;
- следующая Attack цели -30%.

Роль:

- debuff;
- tempo;
- disruption.

---

# 13. Character effect types

Arena уже использует следующие реальные effect families:

- damage;
- shield;
- heal;
- attack boost;
- attack weaken;
- special charge reduce;
- RNG outcome.

Это значит, что gear и buffs могут работать с этими семьями.

Нельзя добавлять новый эффект только потому, что он красиво называется.

---

# 14. Урон и multipliers

Prototype uses contextual multipliers.

Примеры:

- Attack vs Maneuver → примерно ×1.45;
- Attack vs Attack при speed edge → примерно ×1.10;
- Attack сквозь Special → примерно ×0.35;
- Attack в Defense → примерно ×0.22.

**PROTOTYPE BALANCE.**

Production числа должны пройти:

- simulation;
- matchup analysis;
- average rounds;
- 1×N comeback analysis;
- gear sensitivity;
- buff sensitivity.

---

# 15. Победа в столкновении

Столкновение может иметь:

- winner A;
- winner B;
- neutral.

Winner collision — не то же самое, что death.

Можно:

- выиграть столкновение, не убив;
- проиграть столкновение и остаться в живых;
- получить neutral при взаимном damage.

Prototype fallback:

если разница фактически нанесённого damage больше ~5 HP, преимущество может присваиваться стороне с большим damage.

**PROTOTYPE BALANCE.**

---

# 16. Победа в раунде

Каждое выигранное столкновение даёт 1 point раунда.

Пример:

- команда A: 2;
- команда B: 1.

Раунд выигрывает команда с большим числом побед в столкновениях.

Round score:

**2:1**

При равенстве — team draw.

Round win не завершает match автоматически.

---

# 17. Победа в бою

Основное условие:

> у противника не осталось живых курочек.

Возможен double knockout.

Rules for paid-match draw settlement — OPEN / ECONOMY_MODEL.

---

# 18. Численное большинство и камбэк

**LOCKED:** Arena не должна автоматически превращать 3×1 в гарантированную победу троих.

Оставшаяся курочка:

- выбирает одно действие;
- в «Стенке» оно работает во всех её столкновениях;
- может правильно законтрить несколько одинаковых действий;
- может применить Special;
- может использовать comeback buff.

Это создаёт драматические 1×2 / 1×3 ситуации.

Особенно сильные comeback identities:

- Ряба — Shield + Special;
- Монах — heal/sustain;
- Дурочка — high variance Special.

---

# 19. Target reassignment

## Wall

После смерти цели Battle Engine назначает следующий living opponent по positional rule.

## JRPG

Если выбранная цель умерла до отдельного позднего action resolution — production rule должен быть определён вместе со Speed decision.

Варианты:

1. action остаётся на dead target и теряется;
2. auto-retarget;
3. все выбранные действия считаются simultaneous.

**OPEN.**

Предпочтительно избегать неожиданных потерянных ходов без ясного UX.

---

# 20. Аксессуары и Arena stats

## 20.1. Разрешённые базовые stats предметов

Базовый combat gear использует:

- HP;
- Attack;
- Defense;
- Speed.

Это четыре основных numeric combat stats.

## 20.2. Почему нет дополнительных базовых stat

Не вводим без механической необходимости:

- Intelligence;
- Charisma;
- Magic;
- Luck stat;
- Special Attack;
- Special Defense;
- Crit stat;
- Accuracy;
- Evasion.

Если когда-нибудь появляется соответствующая реальная механика — это отдельное изменение Battle Engine.

## 20.3. Advanced gear effects

Редкие/родные/set items могут модифицировать существующие effects.

Примеры:

- Shield +N;
- Heal +N;
- Maneuver damage +%;
- Special damage +%;
- Special shield +N;
- Special heal +N;
- Special debuff +%;
- Special charge gain +N;
- enemy Special charge reduction +N;
- next Attack boost +%;
- weaken effect +%.

Каждый эффект должен ссылаться на конкретный engine hook.

## 20.4. Запрещённый шаблон

Плохо:

> Special +10

Непонятно, что это значит для Монаха, Рябы и Боевика.

Хорошо:

> Special damage +5%  
> Special heal +4 HP  
> Special shield +3  
> Special weaken +5%

---

# 21. Native gear и sets

У каждого archetype может быть родная линейка gear.

Native synergy должна:

- усиливать характер персонажа;
- не делать чужой gear бесполезным;
- не создавать mandatory single build.

Пример:

Ряба:
- shield build;
- HP sustain build;
- aggressive Attack build.

Профессор:
- charge control build;
- precision build.

Гламурочка:
- debuff build;
- speed/tempo build.

---

# 22. Battle Power

Battle Power нужен для matchmaking.

Он учитывает только **постоянную силу**:

- base stats;
- level-derived permanent stats;
- gear stats;
- permanent set bonuses;
- разрешённые legacy modifiers.

Не учитывает:

- morale;
- temporary Arena buffs;
- tactical consumables;
- Daily Event modifier;
- текущий HP;
- текущий Special charge.

## 22.1. BP weights

Нельзя считать:

> +1 HP = +1 BP = +1 Speed.

Вес каждого stat должен быть выведен через simulation:

- изменение win rate;
- matchup spread;
- round length;
- survival;
- first-action advantage.

Особенно нужно проверить Speed.

---

# 23. Morale / Боевой дух

Временный modifier Arena.

Рабочая гипотеза:

**-15% … +15%.**

Не входит в BP.

Нельзя покупать напрямую за GE.

Противник видит наличие повышенного/пониженного духа.

Точная формула влияния — OPEN.

---

# 24. Arena Buffs

Buff system делится на:

1. Preparation Buff;
2. Tactical Consumable.

Подробный каталог задаётся Game Bible §26 и будущим BUFF_CATALOG.

## 24.1. Preparation Buff

Активируется до боя.

Примеры:

- HP bonus;
- Defense bonus;
- Speed bonus;
- Special modifier.

## 24.2. Tactical Consumable

Берётся в ограниченный Arena Buff Loadout.

Рабочая гипотеза:

- до 3 consumables в бой;
- один consumable экземпляр — одно использование;
- обычно не более одного activation buff за раунд.

## 24.3. Duration classes

- Instant;
- Round;
- Battle;
- Conditional.

## 24.4. Buff targets

- SELF_CHICKEN;
- ALLY_CHICKEN;
- ENEMY_CHICKEN;
- MY_TEAM;
- ENEMY_TEAM;
- BATTLEFIELD.

## 24.5. Approved effect hooks

Buff может менять только существующую механику:

- HP;
- Attack;
- Defense;
- Speed;
- Shield;
- Heal;
- Special charge;
- action multiplier;
- targetability;
- action availability;
- buffs/debuffs;
- survival condition;
- position.

---

# 25. Ключевые tactical buffs

## 25.1. Двойная сила

Условие:

> одна живая курочка против двух или трёх.

Эффект:

- выбранное действие получает примерно ×2 к основному effect;
- exact caps зависят от action type.

Comeback buff.

## 25.2. Неуязвимость

Одна курочка не получает damage один раунд.

Не защищает от системной «Молнии богов».

## 25.3. Последнее перо

Первый lethal event оставляет 1 HP.

## 25.4. Феникс

Редкий revive с ограниченным HP.

## 25.5. Боевой купол

Team shield на один раунд.

## 25.6. Заряд

Добавляет Special charge.

## 25.7. Тишина

Временно запрещает Special выбранной цели.

Hard-control; должен быть редким.

## 25.8. Обмен местами / Перестройка

Меняет позицию своих бойцов.

Особенно стратегично в Wall.

---

# 26. Buff processing order

Production engine должен иметь жёсткий priority stack.

Черновой порядок:

1. eligibility;
2. reserve consumable;
3. pre-round position changes;
4. pre-round stats/shields;
5. hidden actions locked;
6. action modifiers;
7. collision resolution;
8. on-hit/on-damage triggers;
9. survival triggers;
10. end-round effects;
11. consume item;
12. chronicle log.

---

# 27. Tactical Hint

Подсказка — анализ открытой информации.

Она должна учитывать:

- 3×3 / 3×2 / 2×1 / 1×3 и т.д.;
- конкретных живых бойцов;
- HP;
- Shield;
- charge;
- Special readiness;
- mode;
- positional pressure;
- history patterns;
- buffs;
- known debuffs.

Запрещено выдавать нерелевантный совет.

Пример плохой подсказки:

> «Сфокусируйте Профессора всей командой»

если у игрока осталась одна курочка.

## 27.1. 1×N hint strategy

Для one-survivor state подсказка должна переходить в comeback mode.

Примеры:

- Ряба → shield/survival/Special;
- Монах → heal/sustain;
- Боевик → provocation + finishing;
- Дурочка → speed/RNG;
- Профессор → charge denial;
- Гламурочка → debuff dangerous attacker.

## 27.2. Monetization

Prototype — free.

Production — платная tactical service / GE sink.

---

# 28. Всевидящий / Ясновидение

Prototype UI: **Ясновидение**.

Future paid buff/service: **Всевидящий**.

Он не раскрывает выбранный ход соперника.

Он показывает рассчитанные исходы:

если opponent выберет:

- Attack;
- Defense;
- Maneuver;
- Special.

Показывается:

- win/loss/neutral;
- predicted HP;
- death;
- double KO;
- Shield/heal/debuff;
- невозможность Special при charge < 100.

## 28.1. Wall

Если одна курочка участвует в двух/трёх столкновениях — прогноз показывается по каждому opponent.

## 28.2. JRPG

Прогноз строится по доступным targets.

---

# 29. Разведка

**Не разрешена в synchronous online Arena.**

Причина:

второй игрок мог бы получить скрытую информацию после фиксации первого.

Future:

- paid async feature;
- reveal intent/action одной defensive chicken;
- strict limits;
- GE sink.

---

# 30. Автобой

Платная tactical function.

Автобой:

- рассматривает legal actions;
- legal targets;
- HP;
- stats;
- status;
- Special;
- buffs;
- expected outcomes;
- выбирает математически лучший ход.

Не читает фактически выбранный скрытый ход другого live player.

Отличается от Hint:

- Hint объясняет;
- Autobattle выбирает.

Отличается от timeout random action:

- Autobattle оптимальный;
- timeout action случайный.

---

# 31. Таймер хода (LOCKED D-05)

**45 секунд** на решение, серверная конфигурация **30–60 секунд**. Первый пропуск хода — автоматическая **Защита**; запись в летопись «курочка замешкалась и закрылась». **Два пропуска подряд** — «Молния богов», техническое поражение; любой вовремя зафиксированный ход сбрасывает счётчик подряд. Платформенный сбой не должен приводить к поражению. Прежние 3 минуты отменены.

# 32. 4-player timer (FUTURE)

Таймер будущего массового режима отдельно проектируется; не переносить его на начальный релиз.


# 33. Аренда Arena и призовой сундук

**Не ставки.** Живой бой с другом: аренда 10 GE с каждого (PROTOTYPE BALANCE); асинхронный бой — 10 GE с атакующего (PROTOTYPE BALANCE); бот и «Тренировочный бой с другом» бесплатны, без приза. Победитель получает **Arena-сундук** без гарантированного GE и без переводов между аккаунтами. Три ячейки: мелкий продаваемый трофей (ожидаемый выкуп 7,5 GE; максимум 12,5 GE), XP/прогресс/Боевой дух без GE-стоимости, исключительно непродаваемый косметический предмет с редким шансом (пример 1–2%, PROTOTYPE BALANCE). Продаваемый пул ограничен 5×аренды (50 GE при аренде 10). При дублировании эксклюзива — усиленный сезонный прогресс.

Анти-фарм: лимит призовых боёв с одной парой, например три в сутки (PROTOTYPE BALANCE). Сбой платформы/отмена до начала — возврат; двойной KO — без возврата и сундука; Молния — поражение. Четыре игрока и экономика их аренды — FUTURE, значения OPEN.


# 34. Бой с другом, тренировка, рейтинг

**Платный живой бой с другом** оплачивается арендой и даёт сундук победителю с анти-фарм лимитом. **Тренировочный бой с другом** бесплатен и без сундука. **Бот** бесплатен и без призового сундука. Слава и рейтинговый подбор — Future после MVP. Асинхронная атака на защитную тактику оплачивается атакующим и использует тот же сундук.


# 35. Асинхронная защитная тактика

Защитник задаёт состав, позиции, одну из политик **Агрессивная / Осторожная / Хитрая**. Сервер принимает HP, Shield, заряд, численность, позиции и историю прошлых ходов и на их основе строит распределение **легальных** действий; выбор через seeded RNG, чтобы policy не была гарантированно угадываема. Агрессивная предпочитает давление; Осторожная усиливает защиту при низком HP; Хитрая опирается на историю и заряд Special. Вероятности — OPEN. После боя защитнику доступен журнал, летопись, результат и изменённые ресурсы.

# 36. Chat

## 2-player

- public match chat;
- quick phrases;
- emoji/emotes;
- short text;
- mute/report in production.

## 4-player FFA

- public;
- possible private DM if rules permit diplomacy.

## 4-player 2×2

Channels:

- Все;
- Команда;
- Лично.

Enemy cannot see team chat.

UI обязан явно показывать active recipient/channel.

---

# 37. Quick chat

Prototype examples:

- ✅ Да
- ❌ Нет
- 👋 Привет!
- 👏 Красивый ход!
- 🔥 Вот это бой!
- 😱 Вот это да!
- 😂 Ха!
- 🍀 Повезло!
- 😈 Я это задумал!
- 🛡️ Читаю тебя
- 🎯 Попробуй угадай
- 🤝 GG
- 🔁 Реванш?

---

# 38. Rematch

После боя:

1. один игрок предлагает;
2. второй выбирает Да/Нет;
3. только mutual Yes запускает новый match.

При rematch:

- тот же mode;
- те же команды;
- те же позиции;
- HP reset;
- Special reset;
- statuses reset;
- chronicle нового боя начинается заново;
- chat может сохраняться.

---

# 39. Летопись боя

Летопись — не technical log.

Она должна быть **литературным рассказом боя**.

Сначала narrative.

Отдельно под spoiler:

**Тактика и расчёт**

где доступны:

- actions;
- HP before/after;
- damage;
- buffs;
- effects;
- engine result.

## 39.1. Character-specific prose

Каждый Maneuver/Special имеет свои action templates.

Не:

> «Attack поймал Maneuver».

А:

> 🐺 Дурочка Мурочка начала безумный Финт, но 🌙 Боевик Петров не стал угадывать направление и пошёл напролом, сорвав подготовку прямым ударом.

## 39.2. Buff narrative

Buff тоже обязан попадать в рассказ.

Пример:

> 🐺 Ряба Глаша осталась одна против троих. Печать «Двойной силы» вспыхнула, и золотая скорлупа разлетелась вдвое ярче.

## 39.3. Sharing

Chronicle:

- Copy;
- Share;
- potentially battle replay/link in future.

---

## 39.4. Летопись: готовые шаблоны и LLM

Библиотека шаблонов **archetype × action × outcome**, плюс смертельный удар, buff, дебафф, Молния. В LLM отправляется только `BattleEngineResult` (участники, Type+Name, гербы, действия, HP before/after, эффекты, победитель). LLM связывает утверждённые события в рассказ; **не вправе придумывать факты**. Проверка обязательных сущностей и чисел; при сбое модели/валидации — детерминированные шаблоны. Тренировка и бесплатные бои используют шаблоны без LLM. Стоимость LLM должна покрываться арендой — конкретный бюджет OPEN. Поделиться: Telegram-карточка лучшего момента + ссылка.

# 40. Action explanation UI

После выбора action игрок может открыть описание под spoiler.

Описание включает:

- что делает action;
- character narrative;
- effect;
- strong matchup;
- weak matchup.

Это education layer без необходимости читать отдельные правила.

---

# 41. Death

HP reaches 0 → dead.

Dead chicken:

- no longer chooses action;
- removed from living targets;
- affects positional reassignment.

Chronicle must narrate death.

---

# 42. Status effects

Current prototype statuses:

- Shield;
- next Attack boost;
- next Attack weaken;
- Special charge reduction.

Future effects can be added only with:

- data definition;
- duration;
- stacking rule;
- priority;
- clear UI.

---

# 43. Stacking

Every modifier needs:

- source;
- target;
- duration;
- stack group;
- cap;
- priority.

Default principle:

same-family effects should not stack infinitely.

Use strongest or capped aggregation according to catalog.

---

# 44. Gear ↔ Buff boundary

Gear:

- permanent;
- included in BP;
- visible pre-battle or according to rules.

Tactical consumable:

- temporary;
- not included in BP;
- finite inventory;
- activated during battle.

Preparation buff:

- temporary;
- pre-battle;
- not BP;
- visible after match begins.

---

# 45. Fairness and pay-to-win control

Arena uses GE sinks, but paid tools must not collapse skill.

Requirements:

- strong consumables obtainable through gameplay;
- ranked allowlist/banlist possible;
- usage caps;
- no unlimited stacking;
- effects visible when activated;
- Scout banned in live PvP;
- Autobattle/Hint/All-Seeing cannot read hidden move;
- matchmaking ignores temporary buffs in BP but server audits loadout.

---

# 46. Anti-farm

Ranked:

- recent opponent memory;
- repeat-opponent coefficient;
- daily/season caps where needed;
- rating-difference reward scaling;
- no manual selection of weak ranked opponent.

---

# 47. Reconnect and authoritative server

Production Battle Engine must be server-authoritative.

Client:

- displays;
- chooses;
- sends command.

Server:

- validates;
- locks;
- resolves;
- persists;
- distributes state.

Commands require:

- matchId;
- round;
- playerId;
- commandId;
- action payload;
- version.

Duplicate commandId is idempotent.

---

# 48. Hidden information

During Decision Phase opponent must not receive hidden action payload.

Not enough to hide via CSS.

Server view must omit opponent action until reveal.

Same applies to:

- hidden team pick before both ready;
- private team chat;
- future secret consumables if design allows them.

---

# 49. Prototype transport vs production

Current prototype may use public MQTT/WebSocket infrastructure for testing.

This is **not production security architecture**.

Production requires:

- auth;
- private room;
- server authority;
- anti-cheat;
- authenticated state;
- rate limits;
- abuse controls.

---

# 50. Telemetry

Every battle should log:

- mode;
- format;
- team composition;
- stats;
- gear;
- buffs/loadout;
- actions per round;
- targets;
- damage;
- heal;
- shields;
- charge;
- deaths;
- collision winners;
- round winners;
- battle winner;
- duration;
- timeout;
- hint use;
- clairvoyance use;
- autobattle use;
- rematch;
- GE settlement.

---

# 51. Balance metrics

Core metrics:

- win rate by archetype;
- win rate by team composition;
- first-slot advantage;
- mode advantage;
- average rounds;
- average battle duration;
- 3×1 comeback rate;
- 2×1 comeback rate;
- Special usage rate;
- action distribution;
- Speed sensitivity;
- gear stat marginal value;
- buff marginal value;
- timeout rate;
- surrender/quit rate.

---

# 52. Цели баланса

Not hard production numbers yet.

Design intent:

- no single archetype universally best;
- no single action dominates;
- no mandatory gear stat;
- no mandatory buff;
- 1×3 comeback possible but uncommon;
- 3×1 remains advantaged but not guaranteed;
- fights brisk enough to remain readable;
- Special meaningful but not automatic win;
- prepared player can beat slightly stronger raw stats through decisions.

---

# 53. Known prototype risk: Speed

Highest-priority balance question.

Current JRPG ordering can cause a faster unit to kill a slower one before slower action executes.

This may make Speed disproportionately valuable.

Before gear catalog finalization:

1. simulate current sequential model;
2. simulate simultaneous-commit model;
3. compare win-rate elasticity of +1 Speed;
4. choose model;
5. freeze BP weight.

Until this is closed, **do not finalize Speed values on production gear.**

---

# 54. Known prototype risk: multi-collision

Wall 1×N is strategically interesting but must be checked for:

- duplicated Special effect;
- duplicated heal;
- duplicated shield gain;
- duplicated charge gain;
- boost consumption;
- weaken consumption.

Need explicit rule:

> which effects apply once per action and which apply once per collision.

This is critical before production.

---

# 55. Known prototype risk: JRPG focus fire

Focus fire can create strong snowball.

Test:

- 3→1 kill probability round 1;
- survivability with Defense;
- target retarget;
- action cancellation;
- Speed interaction;
- protection/intercept buffs.

---

# 56. Rules for accessory design

Every combat property in GEAR_CATALOG must answer:

1. Which engine variable/effect does it change?
2. At what stage?
3. Does it affect BP?
4. What is its cap?
5. How does it stack?
6. Is it visible to opponent?
7. Does it work in all modes?
8. Does it create a dead stat for some archetypes?

No answer → stat cannot ship.

---

# 57. Rules for buff design

Every BUFF_CATALOG entry must define:

- id;
- name;
- rarity;
- source;
- target scope;
- activation window;
- duration;
- condition;
- effect;
- engine hook;
- stacking;
- cap;
- visibility;
- ranked legality;
- consumable behavior;
- chronicle template.

---

# 58. Rules for Maneuver/Special design

New archetype cannot ship with generic:

> +X damage.

It should have character identity.

Process:

1. invent physical/character action;
2. derive natural mechanical effect;
3. assign number;
4. simulate;
5. write Chronicle prose.

---

# 59. Open decisions before Arena production

1. Final Speed resolution model.
2. Retarget after death in JRPG.
3. Special charge exact table.
4. Multi-collision once-per-action vs once-per-collision effects.
5. Draw settlement.
6. Paid Arena cancellation/refund.
7. BP formula/weights.
8. Morale formula.
9. Gear caps.
10. Buff loadout exact size.
11. Buff ranked allowlist.
12. 4-player reward split.
13. surrender rules.
14. disconnect grace period.
15. seven-founder Arena definition.

---

# 60. Последовательность реализации (справочно)

Единственный актуальный порядок фаз, DoD и MVP-ограничения приведены в **IMPLEMENTATION_ROADMAP.md**. Здесь фиксируются только боевые правила, проверки и незакрытые балансные решения.


# 61. Источник истины

For Arena combat:

1. **ARENA_SPEC_V1.md**
2. Game Bible
3. prototype implementation as executable experiment

Prototype numbers do not silently override this document.

When prototype discovers a better rule:

- update spec;
- record reason;
- then update production.

---

# 62. Documentation package status

The complete v1 documentation package is now created.

See **DOCUMENTATION_INDEX.md** for reading order and source-of-truth mapping.

Arena-related follow-up is no longer another document creation step. The next work is to close the explicit OPEN balance/implementation decisions through simulation and production engineering:
- Speed resolution;
- multi-collision semantics;
- JRPG retarget;
- Special charge table;
- BP weights;
- draw/refund settlement.

