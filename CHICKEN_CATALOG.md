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
- visual identity;
- Gift;
- base Arena stats;
- Maneuver;
- Special;
- role;
- native gear direction;
- narrative vocabulary.

## 2. Ряба

Code: ryaba

Образ:
- золотая тема;
- хозяйственность;
- защитная магия скорлупы.

Gift:
**Золотая несушка**
- усиливает passive laying по Economy Model.

Prototype Arena stats:
- HP 108
- ATK 24
- DEF 21
- SPD 18

Maneuver:
**Скорлупа**
- 24 damage;
- +10 Shield.

Special:
**Золотая скорлупа**
- ~25 damage;
- +18 Shield;
- Defense scenario ~11 damage +14 Shield.

Role:
- sustain;
- shield;
- comeback;
- 1×N specialist.

Native gear directions:
- shield;
- HP;
- Special shield;
- controlled aggressive variant.

Narrative verbs:
- разбивает;
- осыпает осколками;
- закрывается панцирем;
- золотая скорлупа.

## 3. Боевик

Code: fighter

Образ:
- силовой fighter;
- прямота;
- давление;
- защита через toughness.

Gift:
**Охрана**
- блокирует часть threat-events вне Arena.

Prototype stats:
- HP 112
- ATK 26
- DEF 23
- SPD 14

Maneuver:
**Провокация**
- 25 damage;
- next Attack +18%.

Special:
**Ответочка**
- ~46 damage;
- Defense sharply reduces direct damage.

Role:
- pressure;
- heavy hit;
- counterplay.

Native gear:
- Attack;
- Defense;
- next-Attack boost;
- counter support.

Narrative:
- идёт напролом;
- толкает;
- провоцирует;
- вкладывается всем корпусом.

## 4. Дурочка

Code: fool

Образ:
- яркая;
- авантюрная;
- хаотичная;
- смешная непредсказуемость.

Gift:
**Везучая дурочка**
- Lucky Flip negative Coop event → prepared positive alternative.

Prototype stats:
- HP 102
- ATK 24
- DEF 17
- SPD 26

Maneuver:
**Финт**
- 31 damage;
- next Attack +20%.

Special:
**Авось!**
- 10% 0;
- 65% ~43;
- 25% ~58.

Role:
- speed;
- variance;
- bluff;
- high-risk comeback.

Native gear:
- Speed;
- Attack;
- controlled RNG support;
- Maneuver synergy.

Narrative:
- спотыкается;
- внезапно разворачивается;
- появляется не там;
- кричит «Авось!».

## 5. Профессор

Code: professor

Образ:
- интеллект;
- расчёт;
- анализ;
- контроль.

Gift:
**Научный подход**
- XP boost within global cap.

Prototype stats:
- HP 102
- ATK 25
- DEF 19
- SPD 22

Maneuver:
**Анализ**
- 26 damage;
- enemy Special charge -18.

Special:
**Расчёт**
- ~45 damage;
- precise direct strike.

Role:
- control;
- charge denial;
- precision.

Native gear:
- charge denial;
- Special precision;
- moderate Speed;
- control.

Narrative:
- считывает стойку;
- вычисляет;
- сбивает подготовку;
- находит слабую точку.

## 6. Монах

Code: monk

Образ:
- спокойствие;
- благодать;
- sustain;
- внутреннее равновесие.

Gift:
**Благодать**
- amplifies Coop synergy, capped.

Prototype stats:
- HP 110
- ATK 21
- DEF 24
- SPD 15

Maneuver:
**Медитация**
- 24 damage;
- heal up to 12.

Special:
**Благодать**
- heal up to 27;
- ~18 damage.

Role:
- sustain;
- attrition;
- healing comeback.

Native gear:
- HP;
- Defense;
- heal;
- Special heal.

Narrative:
- замирает;
- восстанавливает равновесие;
- собирает благодать;
- успокаивает поле боя.

## 7. Гламурочка

Code: glamour

Образ:
- стиль;
- эффектность;
- отвлечение;
- tempo.

Gift:
**Шопинг с характером**
- discount on configured game purchases/upgrades with cap.

Prototype stats:
- HP 102
- ATK 23
- DEF 19
- SPD 24

Maneuver:
**Позирование**
- 27 damage;
- target next Attack -22%.

Special:
**Ослепительный выход**
- ~41 damage;
- target next Attack -30%.

Role:
- debuff;
- tempo;
- disruption.

Native gear:
- Speed;
- weaken;
- Special debuff;
- fashion/cosmetic value.

Narrative:
- позирует;
- ослепляет;
- отвлекает;
- сбивает концентрацию.

## 8. Седьмая основательница — общий сюрприз сообщества

Статус: OPEN; на старте доступны **шесть** основательниц. Седьмая открывается после выполнения общей цели сообщества.

Запрещено придумывать её Arena/Gift mechanics без отдельного утверждения.

Catalog fields reserved:
- code
- title
- Gift
- stats
- Maneuver
- Special
- role
- native gear

## 9. Personal name

После получения/раскрытия игрок задаёт personal name.

Examples:
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
L2 Developing Egg  
L3 Chick / type reveal  
L4 Adult + gear + Arena 1×1  
L5–14 progression  
L15 3D eligibility  
L16–19 prestige  
L20 cap

## 11. Archetype vs rarity

Base archetype is not rarity.

Future chicken can be:
- Rare;
- Epic;
- Legendary;
- Seasonal;
- Partner;
- Heir.

Legendary should alter strategy, not simply +50% everything.

## 12. New archetype acceptance rules

New archetype must have:
1. clear visual silhouette;
2. real Gift outside Arena or explicitly defined role;
3. distinct Maneuver;
4. distinct Special;
5. role not redundant;
6. approved engine hooks;
7. narrative action logic;
8. balance simulation;
9. native gear direction.

## 13. Maneuver design rule

First:
- character action.

Then:
- natural effect.

Then:
- numbers.

Do not start with:
> need another -20% debuff character.

## 14. Special design rule

Special must:
- be memorable;
- justify charge;
- create counterplay;
- have Defense interaction;
- be narratable.

## 15. Base-stat rule

Stats are not final until simulation.

Current prototype values are reference only.

## 16. Gift rule

Gift:
- permanent;
- character identity;
- primarily outside Arena unless explicitly bridged;
- must affect real system;
- stacking family/cap required.

## 17. Heirs

Heir:
- starts L1;
- inherits lineage/visual traits;
- gets controlled LegacyBonus;
- progresses faster under cap;
- does not inherit L15 level.

## 18. 3D embodiment

At L15 eligible.

Embodiment:
- original leaves digital Coop;
- physical passport/identifier;
- one-time heir claim capability.

## 19. UI identity

Card:
- Type + Personal Name;
- Level;
- rarity if applicable;
- Gift;
- Coolness;
- Arena stats when unlocked;
- equipment.

Arena:
- Crest + Type + Personal Name;
- HP;
- Special charge;
- statuses.

## 20. Chronicle identity

Never say only “Дурочка” when ambiguous.

Use:
- crest;
- full Type+Name.

Example:
> 🐺 Дурочка Мурочка провела Финт против 🌙 Дурочки Соньки.

## 21. Catalog extension process

Any new type requires:
- Game Bible decision;
- catalog entry;
- Arena Spec update;
- Gear compatibility;
- asset plan;
- localization;
- analytics code;
- migration version.

## B2 и A4. Дары с запуска, прогрессия силы

Все шесть стартовых основательниц доступны с их Дарами без ограничений: Ряба — daily egg/яйценоскость; Гламурочка — скидка на яйца, gear и расширения (под cap); Дурочка — Lucky Flip; Боевик — защита от событий-угроз; Монах — синергии и положительные события; Профессор — XP boost. Силы Дара OPEN.

Модель роста HP/ATK/DEF на +25–30% от L4 до L20 (Speed медленнее) — **PROTOTYPE BALANCE**; альтернатива «уровень лишь открывает gear» OPEN. Седьмая — скрыта до community event.
