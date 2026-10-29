# QuRa — каталог курочек v1

**Статус:** каталог типов/титулов курочек и их механической идентичности  
**Источники:** Game Bible, Arena Spec

## 0. Модель

Все шесть известных основательниц и все их Дары доступны с начала игры без исключений. Седьмая — Future / сюрприз.

Каждая сущность имеет:
- Archetype = тип/титул;
- Chicken Instance = конкретная курочка;
- Personal Name = имя игрока.

Формат:
**Тип Имя**

Arena:
**[Герб] Тип Имя**

## 1. Общие поля archetype

Каждый тип обязан определить:
- code;
- title;
- визуальный identity;
- Gift;
- base Arena stats;
- Манёвр;
- Особый приём;
- role;
- native экипировка direction;
- narrative vocabulary.

## 2. Ряба

Код: ryaba

Образ:
- золотая тема;
- хозяйственность;
- защитная магия скорлупы.

Дар:
**Золотая несушка**
- усиливает passive laying по Economy Model.

Характеристики Arena в прототипе:
- HP 108
- ATK 24
- DEF 21
- SPD 18

Манёвр:
**Скорлупа**
- 24 урон;
- +10 Щит.

Особый приём:
**Золотая скорлупа**
- ~25 урон;
- +18 Щит;
- Защита scenario ~11 урон +14 Щит.

Игровая роль:
- выживаемость;
- щит;
- возвращение в бой;
- 1×N specialist.

Направления родной экипировки:
- щит;
- HP;
- Особый приём щит;
- controlled aggressive variant.

Глаголы для летописи:
- разбивает;
- осыпает осколками;
- закрывается панцирем;
- золотая скорлупа.

## 3. Боевик

Код: fighter

Образ:
- силовой fighter;
- прямота;
- давление;
- защита через toughness.

Дар:
**Охрана**
- блокирует часть threat-events вне Arena.

Характеристики прототипа:
- HP 112
- ATK 26
- DEF 23
- SPD 14

Манёвр:
**Провокация**
- 25 урон;
- next Атака +18%.

Особый приём:
**Ответочка**
- ~46 урон;
- Защита sharply reduces direct урон.

Игровая роль:
- pressure;
- heavy hit;
- counterplay.

Родная экипировка:
- Атака;
- Защита;
- next-Атака boost;
- counter support.

Литературное описание:
- идёт напролом;
- толкает;
- провоцирует;
- вкладывается всем корпусом.

## 4. Дурочка

Код: fool

Образ:
- яркая;
- авантюрная;
- хаотичная;
- смешная непредсказуемость.

Дар:
**Везучая дурочка**
- Lucky Flip negative Coop event → prepared positive alternative.

Характеристики прототипа:
- HP 102
- ATK 24
- DEF 17
- SPD 26

Манёвр:
**Финт**
- 31 урон;
- next Атака +20%.

Особый приём:
**Авось!**
- 10% 0;
- 65% ~43;
- 25% ~58.

Игровая роль:
- speed;
- variance;
- bluff;
- high-risk возвращение в бой.

Родная экипировка:
- Скорость;
- Атака;
- controlled RNG support;
- Манёвр synergy.

Литературное описание:
- спотыкается;
- внезапно разворачивается;
- появляется не там;
- кричит «Авось!».

## 5. Профессор

Код: professor

Образ:
- интеллект;
- расчёт;
- анализ;
- контроль.

Дар:
**Научный подход**
- XP boost within global лимит.

Характеристики прототипа:
- HP 102
- ATK 25
- DEF 19
- SPD 22

Манёвр:
**Анализ**
- 26 урон;
- enemy Особый приём charge -18.

Особый приём:
**Расчёт**
- ~45 урон;
- precise direct strike.

Игровая роль:
- control;
- charge denial;
- точность.

Родная экипировка:
- charge denial;
- Особый приём точность;
- moderate Скорость;
- control.

Литературное описание:
- считывает стойку;
- вычисляет;
- сбивает подготовку;
- находит слабую точку.

## 6. Монах

Код: monk

Образ:
- спокойствие;
- благодать;
- выживаемость;
- внутреннее равновесие.

Дар:
**Благодать**
- amplifies Coop synergy, capped.

Характеристики прототипа:
- HP 110
- ATK 21
- DEF 24
- SPD 15

Манёвр:
**Медитация**
- 24 урон;
- лечение up to 12.

Особый приём:
**Благодать**
- лечение up to 27;
- ~18 урон.

Игровая роль:
- выживаемость;
- attrition;
- healing возвращение в бой.

Родная экипировка:
- HP;
- Защита;
- лечение;
- Особый приём лечение.

Литературное описание:
- замирает;
- восстанавливает равновесие;
- собирает благодать;
- успокаивает поле боя.

## 7. Гламурочка

Код: glamour

Образ:
- стиль;
- эффектность;
- отвлечение;
- tempo.

Дар:
**Шопинг с характером**
- discount on configured game purchases/upgrades with лимит.

Характеристики прототипа:
- HP 102
- ATK 23
- DEF 19
- SPD 24

Манёвр:
**Позирование**
- 27 урон;
- target next Атака -22%.

Особый приём:
**Ослепительный выход**
- ~41 урон;
- target next Атака -30%.

Игровая роль:
- debuff;
- tempo;
- disruption.

Родная экипировка:
- Скорость;
- weaken;
- Особый приём debuff;
- fashion/cosmetic value.

Литературное описание:
- позирует;
- ослепляет;
- отвлекает;
- сбивает концентрацию.

## 8. Седьмая основательница — общий сюрприз сообщества

Статус: OPEN; на старте доступны **шесть** основательниц. Седьмая открывается после выполнения общей цели сообщества.

Запрещено придумывать её Arena/Gift mechanics без отдельного утверждения.

Для каталога зарезервированы поля:
- code
- title
- Gift
- stats
- Манёвр
- Особый приём
- role
- native экипировка

## 9. Personal name

После получения/раскрытия игрок задаёт personal name.

Примеры:
- Профессор Иванов;
- Боевик Петров;
- Дурочка Мурочка;
- Гламурочка Анжелла.

Rename:
- allowed later;
- does not affect mechanics;
- moderation required.

## 10. Lifecycle

L1 Egg  
L2 — развивающееся яйцо  
L3 — цыплёнок / открытие типа  
L4 Adult + экипировка + Arena 1×1  
L5–14 progression  
L15 — право на 3D-воплощение  
L16–19 prestige  
L20 лимит

## 11. Archetype vs редкость

Base archetype is not редкость.

Будущая курочка может относиться к категориям:
- Rare;
- Epic;
- Legendary;
- Seasonal;
- Partner;
- Heir.

Legendary should alter strategy, not simply +50% everything.

## 12. New archetype acceptance rules

Новый архетип должен иметь:
1. clear визуальный silhouette;
2. real Gift outside Arena or explicitly defined role;
3. distinct Манёвр;
4. distinct Особый приём;
5. role not redundant;
6. approved engine hooks;
7. narrative action logic;
8. balance simulation;
9. native экипировка direction.

## 13. Манёвр design rule

First:
- character action.

Then:
- natural effect.

Then:
- numbers.

Не следует начинать с:
> need another -20% debuff character.

## 14. Особый приём design rule

Особый приём должен:
- be memorable;
- justify charge;
- create counterplay;
- have Защита interaction;
- be narratable.

## 15. Base-stat rule

Характеристики не утверждены до симуляции.

Значения прототипа служат ориентиром, а не окончательным балансом.

## 16. Gift rule

Дар:
- постоянный;
- character identity;
- primarily outside Arena unless explicitly bridged;
- must affect real system;
- stacking family/лимит required.

## 17. Heirs

Heir:
- starts L1;
- inherits lineage/визуальный traits;
- gets controlled LegacyBonus;
- progresses faster under лимит;
- does not inherit L15 уровень.

## 18. 3D embodiment

Право на воплощение открывается с L15.

Embodiment:
- original leaves digital Coop;
- physical passport/identifier;
- one-time heir claim capability.

## 19. UI identity

Карточка:
- Type + Personal Name;
- Level;
- редкость if applicable;
- Gift;
- Крутость;
- Arena stats when unlocked;
- equipment.

Arena:
- Crest + Type + Personal Name;
- HP;
- Особый приём charge;
- statuses.

## 20. Chronicle identity

Never say only “Дурочка” when ambiguous.

Use:
- crest;
- full Type+Name.

Пример:
> 🐺 Дурочка Мурочка провела Финт против 🌙 Дурочки Соньки.

## 21. Catalog extension process

Каждый новый тип требует:
- Game Bible decision;
- catalog entry;
- Arena Spec update;
- Экипировка compatibility;
- asset plan;
- localization;
- analytics code;
- migration version.
