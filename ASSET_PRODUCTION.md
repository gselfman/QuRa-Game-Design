# QuRa — производство ассетов v1

**Статус:** production specification for game visual assets  
**Sources:** Game Bible, Arena Spec, Screens

## 0. Цель

Создавать повторно используемые ассеты, которые:
- fit QuRa visual language;
- support all runtime poses;
- are technically sliceable;
- preserve character identity;
- work in responsive web/mobile;
- minimize re-generation.

## 1. Visual language

Core:
- warm wood/gold;
- soft 3D volume;
- light from upper-left;
- cozy but polished;
- readable silhouettes;
- Onest font for UI;
- no visual noise covering gameplay.

## 2. Chicken master poses

Каждому архетипу нужны стандартизированные мастер-позы.

### CARD
3/4 standing pose.
Used:
- profile;
- store;
- wardrobe;
- Arena;
- selection.

### PERCH
Сидит на насесте.
Used:
- Coop.

### NEST
Находится в гнезде.
Used:
- Home.

### PROMO MAX
Полный родной комплект для эталонного образа.
Used:
- marketing/reference.

## 3. Attachment anchors

Для каждой отображаемой позы есть стандартные точки крепления:
- head
- eyes
- ears
- neck
- body
- left/right wing
- tail
- left/right foot
- aura center

Точки крепления зафиксированы отдельно для каждой позы.

## 4. Accessory pose variants

Один предмет может требовать:
- CARD variant
- PERCH variant
- NEST variant

Если слот не виден в позе:
- no sprite required;
- effect remains active.

## 5. Пакеты шести основательниц — D-20

Каждый из шести архетипов (Ряба, Боевик, Дурочка, Профессор, Монах, Гламурочка) получает единый утверждённый master reference и **только** CARD/PERCH/NEST, portrait/roster crop и четыре выразительные эмоции лица, которые не меняют точки крепления.

В бою отображается **CARD с теми же аксессуарами, что в гардеробе**, плюс независимые FX-слои. Не генерировать отдельные attack, defend, maneuver, special, hurt, victory, defeat/death позы. Седьмая — только скрытый силуэт до community unlock. Пакеты C01–C06, E01, G01, G02, FX01 описаны в SPRITE_PRODUCTION_BATCHES.md.


## 6. Personal name

Для имени не требуется отдельный графический ассет.
Имя отображается интерфейсом.

## 7. Crest assets

В прототипе временно допустимы эмодзи-гербы.

Варианты исполнения:
- emoji-style icons;
- custom QuRa crest set.

Необходимые символы:
- wolf
- lion
- rat
- rabbit
- fire
- water
- wind
- tree
- sword
- shield
- castle
- tank/helmet
- python/snake
- guitar
- sun
- moon
- cross

Need:
- 64px UI
- 128px
- vector/master if custom.

## 8. Arena action icons

Required:
- Attack
- Defense
- Maneuver
- Special
- Hint
- All-Seeing
- Autobattle
- Buff
- Chat
- Rematch
- Timer
- Reconnect
- Surrender if approved

States:
- normal
- hover
- pressed
- disabled
- selected

## 9. Status icons

- Shield
- Heal
- Attack Up
- Attack Down
- Defense Up
- Speed Up
- Special Ready
- Charge Down
- Silence
- Invulnerability
- Last Feather
- Phoenix
- Hunter Mark
- Smoke
- Intercept
- Double Power

## 10. Buff item art

Для каждого бафа нужен комплект:
- inventory icon
- activation FX
- optional Chronicle illustration hook

Rarity frames:
- Common
- Rare
- Epic
- Legendary
- Artifact if buff family supports it.

## 11. Preparation Buff art

Examples:
- Battle Breakfast
- Coop Charm
- Strong Coffee
- Blessing

Перед боем нужен видимый значок активного эффекта.

## 12. Tactical buff FX

### Double Power
- seal breaking
- energy amplification

### Invulnerability
- transparent protective shell

### Last Feather
- glowing feather catches lethal blow

### Phoenix
- flame/rebirth

### Battle Dome
- team barrier

### Charge
- Special meter energy burst

### Silence
- muted/locked Special symbol

### Swap/Reform
- positional arrows

## 13. Молния богов

Серверный таймер: 45 секунд (конфиг 30–60). При первом пропуске короткий FX «замешкалась и закрылась»: CARD слегка дёргается, затем поверх появляется иконка Защиты. При **втором пропуске подряд**: небо темнеет, предупреждающая вспышка, FX01_24–25, CARD темнеет/падает трансформацией; летопись пишет причину. Все анимации могут быть пропущены/уменьшены по accessibility; результат определяет Battle Engine, не визуальный тайминг.


## 14. Летопись боя visuals

Необязательно, но полезно:
- round divider
- crest
- character portraits
- buff icons
- victory/death symbols

Летопись читается даже без иллюстраций.

## 15. Gear art

Every GearDefinition needs:
- inventory icon
- equipped sprite by visible poses
- store preview
- rarity frame
- set identity if applicable.

## 16. Gear category visual QA

Check overlap/readability for:
- hats
- glasses
- earrings
- neck
- scarf
- body
- bag/wing item
- shoes
- skin
- tail
- medals
- aura

Deactivate slots that produce unreadable stacking.

## 17. Native sets

Each archetype should get a coherent visual family:
- Ryaba: gold/shell/folk
- Fighter: rugged/protective
- Fool: colorful/unpredictable
- Professor: analytical/academic
- Monk: calm/spiritual
- Glamour: stylish/showy

## 18. Редкость presentation

Rarity should use:
- frame/detail density;
- material;
- subtle FX;
- not only color.

Accessibility:
do not rely solely on hue.

## 19. Coop environments

Tiers:
- Nest 2
- Coop 4
- Poultry Yard 6
- Estate 10
- Golden Yard 16
- Ryaba Palace 24

Each tier:
- wide background
- mobile crop
- perch/nest zones
- lighting
- upgrade preview

## 20. Egg lifecycle assets

L1:
- intact egg

L2:
- developing/cracked

L3:
- chick

Need:
- mystery/known variants
- special egg skins future

## 21. 3D embodiment assets

L15 flow:
- premium turntable/render
- figure preview
- passport visual
- QR claim packaging UI

## 22. Мини-игра assets

Existing mini-game packs remain separate production tracks.

Shared QuRa assets:
- GE icon
- tickets
- UI buttons
- rarity frames
- buff icons
- character masters

## 23. Responsive requirements

For every key screen:
- desktop
- tablet
- mobile portrait
- mobile landscape where game requires it

Arena 3×3:
- mobile cards stack/readable
- chat can collapse/dock
- Chronicle remains long-scroll readable

## 24. Форматы файлов

Masters:
- SVG for icons where practical
- PNG/WebP transparent for characters/accessories
- source design retained in Figma

Runtime:
- WebP/AVIF where supported for large raster
- PNG only where alpha/quality requires
- SVG icons optimized

## 25. Правила именования

Examples:
- chicken_ryaba_card_base_v01.webp
- chicken_professor_arena_hurt_v01.webp
- gear_fighter_gloves_card_v02.webp
- buff_invulnerability_icon_v01.svg
- fx_gods_lightning_frame_01.webp

No random filenames.

## 26. Разрешение

Store masters larger than runtime.

Typical:
- icons: master 512
- character CARD: master >=2048 height where feasible
- promo: 4K
- backgrounds: desktop 4K master
- UI exported at density variants if needed

## 27. Прозрачность

Character/accessory/FX sprite:
- transparent background unless intentionally environmental.

## 28. Защитные поля

Characters must not crop:
- headwear
- tail
- shoes
- aura

Document bounding box.

## 29. Анимация Arena без отдельных поз (LOCKED D-20)

- Базовая стойка — одна CARD; позиция и текущие overlays экипировки сохраняются при всех действиях.
- **Атака:** сдвиг CARD к цели на 8–15% локальной ширины (PROTOTYPE BALANCE), небольшой наклон, удар FX01_01/02 и возврат в исходную позицию.
- **Защита:** сдвиг/сжатие CARD на 3–6% (PROTOTYPE BALANCE), полупрозрачный щит FX01_03 поверх; контратака отдельным эффектом.
- **Манёвр:** быстрый короткий sidestep по оси X и FX01_05/06, без перерисовки тела.
- **Особый приём:** на CARD остаётся исходная форма; проигрывается характерный FX01_07..12 соответствующего архетипа и effect overlay.
- **Попадание:** короткий отскок, вспышка и уменьшение HP по UI, текст «урон» отдельно.
- **Лечение:** glow/particles FX01_15 + увеличение показанного HP до серверного значения.
- **Выбывание:** затемнение CARD, смещение вниз/наклон, FX01_23 и исчезновение; не создавать позу смерти.
- **Таймаут:** FX01_22 → Защита; второй подряд → FX01_24/25.
- Состояния Shield/heal/attack buff/debuff показываются FX + status icon, не новой позой.
- Продолжительность последовательностей и easing — PROTOTYPE BALANCE после UI-плейтеста; логика боя **не зависит** от длительности эффектов.
- `prefers-reduced-motion`: минимальный сдвиг, мягкая прозрачность, без тряски, доступный текст результата.


## 30. Доступность

- sufficient contrast
- no information encoded by color alone
- reduced-motion mode
- animation skip
- captions/text for major effects
- status icons + labels

## 31. Audio

Separate layers:
- UI
- battle SFX
- music
- character reactions

User controls:
- sound
- music
- vibration

## 32. Реестр ассетов

Need table/entity:
- asset_id
- type
- owner entity
- pose
- variant
- version
- source Figma node
- runtime path
- status

## 33. Статусы производства

- CONCEPT
- APPROVED
- MASTER_READY
- SLICED
- IN_FIGMA
- IMPLEMENTED
- QA_APPROVED
- DEPRECATED

## 34. Контрольный список качества

Every asset:
- correct archetype
- no accidental crop
- transparent clean edge
- consistent light
- correct pose anchor
- correct file name
- correct dimensions
- no text baked unless required
- mobile readability
- no duplicate

## 35. Структура Figma

Recommended pages:
- Foundations
- Chickens
- Gear
- Buffs
- Arena
- Coop
- Mini-games
- Icons
- Screens
- Archive

Components:
- rarity frame
- item card
- chicken card
- stat chip
- status chip
- action button
- chat
- Chronicle
- modal
- reward card

## 36. Источник истины

Visual source:
Figma/library.

Behavior:
Specs/code.

Do not make gameplay rule depend on a visual file.

## 37. Sprite batch library — approved production plan

См. **SPRITE_PRODUCTION_BATCHES.md**: базовые 12 листов × 25 объектов и специальные пакеты C01–C06, E01, G01/G02 и FX01, each with a stable ID, exact grid cell and shared generation instructions. Generate/QA/upload/slice one sheet at a time; keep existing 'Wolf catches eggs' art unless a replacement has been approved. New monetization visual elements (chests, Season Pass, Piggy Bank, store and offers) are included. All objects must be separately exportable for Figma and runtime.

## 38. Приоритеты визуалов для MVP

P0: корм зерно/кукуруза/червячки/особый корм/деликатес, состояния FED/HAPPY и возврат в NEUTRAL; 20 событий дня с **двумя** вариантами; пустой силуэт седьмой и шкала общей цели. P1: клановый герб/баннер/вклад/доска лидеров и значок официального token-клана. Позиции генерации — новые листы в SPRITE_PRODUCTION_BATCHES.md.
