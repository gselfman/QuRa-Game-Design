# QuRa Asset Production v1

**Статус:** production specification for game visual assets  
**Sources:** Game Bible, Arena Spec, Screens

## 0. Goal

Create reusable assets that:
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

Each archetype needs standardized master poses.

### CARD
3/4 standing pose.
Used:
- profile;
- store;
- wardrobe;
- Arena;
- selection.

### PERCH
Sitting on perch.
Used:
- Coop.

### NEST
Rendered inside nest.
Used:
- Home.

### PROMO MAX
Ideal full native set.
Used:
- marketing/reference.

## 3. Attachment anchors

Every runtime pose has standardized anchors:
- head
- eyes
- ears
- neck
- body
- left/right wing
- tail
- left/right foot
- aura center

Anchors documented per pose.

## 4. Accessory pose variants

One logical item can need:
- CARD variant
- PERCH variant
- NEST variant

If slot invisible in pose:
- no sprite required;
- effect remains active.

## 5. Archetype asset packs

For each:
- Ryaba
- Fighter
- Fool
- Professor
- Monk
- Glamour
- future seventh founder

Produce:
- base adult CARD
- PERCH
- NEST
- selected battle reactions
- Maneuver key frame
- Special key frame
- hurt
- defend
- victory
- defeat/death
- portrait/icon

## 6. Personal name

No visual asset dependency.
Name rendered by UI.

## 7. Crest assets

Current prototype emoji can remain for testing.

Production options:
- emoji-style icons;
- custom QuRa crest set.

Required meanings:
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

Each BuffDefinition needs:
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

Need visible pre-match badge.

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

## 13. Gods Lightning

High-priority production effect.

Sequence:
1. timer expires
2. sky/field darkens
3. warning flash
4. lightning strike
5. defeated team effect
6. Chronicle/result card

Must feel humorous/mythic, not punitive system error.

## 14. Battle Chronicle visuals

Optional but useful:
- round divider
- crest
- character portraits
- buff icons
- victory/death symbols

Chronicle remains readable without images.

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

## 18. Rarity presentation

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

## 22. Mini-game assets

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

## 24. File formats

Masters:
- SVG for icons where practical
- PNG/WebP transparent for characters/accessories
- source design retained in Figma

Runtime:
- WebP/AVIF where supported for large raster
- PNG only where alpha/quality requires
- SVG icons optimized

## 25. Naming convention

Examples:
- chicken_ryaba_card_base_v01.webp
- chicken_professor_arena_hurt_v01.webp
- gear_fighter_gloves_card_v02.webp
- buff_invulnerability_icon_v01.svg
- fx_gods_lightning_frame_01.webp

No random filenames.

## 26. Resolution

Store masters larger than runtime.

Typical:
- icons: master 512
- character CARD: master >=2048 height where feasible
- promo: 4K
- backgrounds: desktop 4K master
- UI exported at density variants if needed

## 27. Transparency

Character/accessory/FX sprite:
- transparent background unless intentionally environmental.

## 28. Safe areas

Characters must not crop:
- headwear
- tail
- shoes
- aura

Document bounding box.

## 29. Animation strategy

Prefer:
- short sprite/state sequences
- CSS/transform for UI
- video only for cinematic moments if justified

Arena actions:
- readable timing;
- mechanics resolved server-side independent of animation.

## 30. Accessibility

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

## 32. Asset registry

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

## 33. Production statuses

- CONCEPT
- APPROVED
- MASTER_READY
- SLICED
- IN_FIGMA
- IMPLEMENTED
- QA_APPROVED
- DEPRECATED

## 34. QA checklist

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

## 35. Figma structure

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

## 36. Source of truth

Visual source:
Figma/library.

Behavior:
Specs/code.

Do not make gameplay rule depend on a visual file.

## 37. Sprite batch library — approved production plan

See **SPRITE_PRODUCTION_BATCHES.md**: 12 sheets × 25 assets = 300 concrete objects, each with a stable ID, exact grid cell and shared generation instructions. Generate/QA/upload/slice one sheet at a time; keep existing 'Wolf catches eggs' art unless a replacement has been approved. New monetization visual elements (chests, Season Pass, Piggy Bank, store and offers) are included. All objects must be separately exportable for Figma and runtime.

## C. Визуалы для нового MVP

P0: корм зерно/кукуруза/червячки/особый корм/деликатес, состояния FED/HAPPY и возврат в NEUTRAL; 20 событий дня с **двумя** вариантами; пустой силуэт седьмой и шкала общей цели. P1: клановый герб/баннер/вклад/доска лидеров и значок официального token-клана. Позиции генерации — новые листы в SPRITE_PRODUCTION_BATCHES.md.
