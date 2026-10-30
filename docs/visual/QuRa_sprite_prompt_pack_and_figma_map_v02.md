# QuRa — полные промпты спрайтов и точная карта Figma (v02)

**Канонический репозиторий:** gselfman/QuRa-Game-Design. Generated from the current item inventory in `SPRITE_PRODUCTION_BATCHES.md`. Every code block is standalone: copy its entire content, not fragments. **Important correction to older v01:** code C02=Боевик, C04=Профессор, C06=Гламурочка, per the canonical catalog. The old ChatGPT-only document is superseded by this file.

## Figma file and map

Create a separate Figma file **QuRa Assets Production — Arena & Meta v1**. File creation is a separate workflow; this guide does not claim it already exists.

| ID | Page | Contents | Expected output |
|---|---|---|---|
| — | `00_README` | pipeline, QA, approval status | — |
| — | `01_REFERENCES_MASTER` | approved masters, Ryaba, palette, anchor specs | — |
| C01 | `02_C01_RYABA` | Ряба | `qura_c01_character_pack_v01.png` |
| C02 | `03_C02_BOEVIK` | Боевик | `qura_c02_character_pack_v01.png` |
| C03 | `04_C03_DUROCHKA` | Дурочка | `qura_c03_character_pack_v01.png` |
| C04 | `05_C04_PROFESSOR` | Профессор | `qura_c04_character_pack_v01.png` |
| C05 | `06_C05_MONAKH` | Монах | `qura_c05_character_pack_v01.png` |
| C06 | `07_C06_GLAMUROCHKA` | Гламурочка | `qura_c06_character_pack_v01.png` |
| E01 | `08_E01_EGGS` | Жизненный цикл яиц | `qura_e01_sprite_sheet_v01.png` |
| G01 | `09_G01_GEAR_CORE` | 20 общих предметов | `qura_g01_sprite_sheet_v01.png` |
| G02 | `10_G02_GEAR_NATIVE` | 18 родных предметов | `qura_g02_sprite_sheet_v01.png` |
| AEX01 | `11_AEX01_ARENA_EXCLUSIVES` | Арена эксклюзивы | `qura_aex01_sprite_sheet_v01.png` |
| FX01 | `12_FX01_BATTLE_FX` | Боевые эффекты | `qura_fx01_sprite_sheet_v01.png` |
| S01 | `13_S01` | Лист S01 | `qura_s01_sprite_sheet_v01.png` |
| S02 | `14_S02` | Лист S02 | `qura_s02_sprite_sheet_v01.png` |
| S03 | `15_S03` | Лист S03 | `qura_s03_sprite_sheet_v01.png` |
| S04 | `16_S04` | Лист S04 | `qura_s04_sprite_sheet_v01.png` |
| S05 | `17_S05` | Лист S05 | `qura_s05_sprite_sheet_v01.png` |
| S06 | `18_S06` | Лист S06 | `qura_s06_sprite_sheet_v01.png` |
| S07 | `19_S07` | Лист S07 | `qura_s07_sprite_sheet_v01.png` |
| S08 | `20_S08` | Лист S08 | `qura_s08_sprite_sheet_v01.png` |
| S09 | `21_S09` | Лист S09 | `qura_s09_sprite_sheet_v01.png` |
| S10 | `22_S10` | Лист S10 | `qura_s10_sprite_sheet_v01.png` |
| S11 | `23_S11` | Лист S11 | `qura_s11_sprite_sheet_v01.png` |
| S12 | `24_S12` | Лист S12 | `qura_s12_sprite_sheet_v01.png` |
| — | `25_EXPORT_QA` | sliced exports, annotations, approvals | — |

## Figma page layout

Inside each page create `_PAGE_HEADER`, `_DESCRIPTION`, `_REFERENCES`, `_GEN_SOURCE`, `_SLICED_EXPORTS`, `_QA_NOTES`. Place its complete prompt into `_DESCRIPTION`; attach references inside `_REFERENCES`. States: planned → reference-confirmed → generated → sliced → QA → approved → referenced. Never label a missing Figma reference as confirmed.

## COPY-PASTE PROMPTS (complete individually)

### C01 — Ряба

Figma page: `02_C01_RYABA`; save generated file as `qura_c01_character_pack_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_c01_character_pack_v01.png
FIGMA DESTINATION PAGE: 02_C01_RYABA
SHEET ID: C01

Create exactly 9 specified independent assets in EXACT numbered order below. Arrange as a 3 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

EXACT ASSET LIST (9 outputs):
01 CARD neutral adult L4
02 PERCH
03 NEST
04 portrait crop from approved CARD
05 roster crop from approved CARD
06 joyful face overlay
07 surprised face overlay
08 determined face overlay
09 disappointed face overlay

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### C02 — Боевик

Figma page: `03_C02_BOEVIK`; save generated file as `qura_c02_character_pack_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_c02_character_pack_v01.png
FIGMA DESTINATION PAGE: 03_C02_BOEVIK
SHEET ID: C02

Create exactly 9 specified independent assets in EXACT numbered order below. Arrange as a 3 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

EXACT ASSET LIST (9 outputs):
01 CARD neutral adult L4
02 PERCH
03 NEST
04 portrait crop from approved CARD
05 roster crop from approved CARD
06 joyful face overlay
07 surprised face overlay
08 determined face overlay
09 disappointed face overlay

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### C03 — Дурочка

Figma page: `04_C03_DUROCHKA`; save generated file as `qura_c03_character_pack_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_c03_character_pack_v01.png
FIGMA DESTINATION PAGE: 04_C03_DUROCHKA
SHEET ID: C03

Create exactly 9 specified independent assets in EXACT numbered order below. Arrange as a 3 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

EXACT ASSET LIST (9 outputs):
01 CARD neutral adult L4
02 PERCH
03 NEST
04 portrait crop from approved CARD
05 roster crop from approved CARD
06 joyful face overlay
07 surprised face overlay
08 determined face overlay
09 disappointed face overlay

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### C04 — Профессор

Figma page: `05_C04_PROFESSOR`; save generated file as `qura_c04_character_pack_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_c04_character_pack_v01.png
FIGMA DESTINATION PAGE: 05_C04_PROFESSOR
SHEET ID: C04

Create exactly 9 specified independent assets in EXACT numbered order below. Arrange as a 3 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

EXACT ASSET LIST (9 outputs):
01 CARD neutral adult L4
02 PERCH
03 NEST
04 portrait crop from approved CARD
05 roster crop from approved CARD
06 joyful face overlay
07 surprised face overlay
08 determined face overlay
09 disappointed face overlay

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### C05 — Монах

Figma page: `06_C05_MONAKH`; save generated file as `qura_c05_character_pack_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_c05_character_pack_v01.png
FIGMA DESTINATION PAGE: 06_C05_MONAKH
SHEET ID: C05

Create exactly 9 specified independent assets in EXACT numbered order below. Arrange as a 3 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

EXACT ASSET LIST (9 outputs):
01 CARD neutral adult L4
02 PERCH
03 NEST
04 portrait crop from approved CARD
05 roster crop from approved CARD
06 joyful face overlay
07 surprised face overlay
08 determined face overlay
09 disappointed face overlay

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### C06 — Гламурочка

Figma page: `07_C06_GLAMUROCHKA`; save generated file as `qura_c06_character_pack_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_c06_character_pack_v01.png
FIGMA DESTINATION PAGE: 07_C06_GLAMUROCHKA
SHEET ID: C06

Create exactly 9 specified independent assets in EXACT numbered order below. Arrange as a 3 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved Figma master of THIS heroine, the implemented QuRa Ryaba, and QuRa style/palette. If missing, DO NOT GENERATE; return request for reference. Do not invent silhouette.

EXACT ASSET LIST (9 outputs):
01 CARD neutral adult L4
02 PERCH
03 NEST
04 portrait crop from approved CARD
05 roster crop from approved CARD
06 joyful face overlay
07 surprised face overlay
08 determined face overlay
09 disappointed face overlay

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### E01 — Жизненный цикл яиц

Figma page: `08_E01_EGGS`; save generated file as `qura_e01_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach six approved founder master images; without them DO NOT GENERATE 18 character-dependent images.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_e01_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 08_E01_EGGS
SHEET ID: E01

Create exactly 22 specified independent assets in EXACT numbered order below. Arrange as 5 columns x 5 rows, leave last 3 cells fully transparent. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach six approved founder master images; without them DO NOT GENERATE 18 character-dependent images.

EXACT ASSET LIST (22 outputs):
01–18: six approved founders, each L1 ordinary egg, L2 developing cracked egg, L3 chick; keep archetype order from official catalog (Ряба, Боевик, Дурочка, Профессор, Монах, Гламурочка).
19–21: mysterious L1, L2, L3 lifecycle (no identity reveal).
22: opaque silhouette teaser of 7th founder, no reveal.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### G01 — 20 общих предметов

Figma page: `09_G01_GEAR_CORE`; save generated file as `qura_g01_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved CARD/PERCH/NEST and anchors plus existing gear references. Without anchor verification, generate icon mockups ONLY; never finalize wearables.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_g01_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 09_G01_GEAR_CORE
SHEET ID: G01

Create exactly 20 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 4 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved CARD/PERCH/NEST and anchors plus existing gear references. Without anchor verification, generate icon mockups ONLY; never finalize wearables.

EXACT ASSET LIST (20 outputs):
1. `G01_01` — соломенная шляпа; иконка ICON + overlays CARD/PERCH/NEST.
2. `G01_02` — лёгкий берет; иконка ICON + overlays CARD/PERCH/NEST.
3. `G01_03` — кепка фермера; иконка ICON + overlays CARD/PERCH/NEST.
4. `G01_04` — шляпа с широкими полями; иконка ICON + overlays CARD/PERCH/NEST.
5. `G01_05` — круглые очки; иконка ICON + overlays CARD/PERCH/NEST.
6. `G01_06` — защитные очки; иконка ICON + overlays CARD/PERCH/NEST.
7. `G01_07` — золотое пенсне; иконка ICON + overlays CARD/PERCH/NEST.
8. `G01_08` — платок на шею; иконка ICON + overlays CARD/PERCH/NEST.
9. `G01_09` — бархатная лента; иконка ICON + overlays CARD/PERCH/NEST.
10. `G01_10` — деревянный амулет; иконка ICON + overlays CARD/PERCH/NEST.
11. `G01_11` — рабочий жилет; иконка ICON + overlays CARD/PERCH/NEST.
12. `G01_12` — хлопковая накидка; иконка ICON + overlays CARD/PERCH/NEST.
13. `G01_13` — простой нагрудник; иконка ICON + overlays CARD/PERCH/NEST.
14. `G01_14` — сумочка на крыло; иконка ICON + overlays CARD/PERCH/NEST.
15. `G01_15` — мини-рюкзак; иконка ICON + overlays CARD/PERCH/NEST.
16. `G01_16` — плетёная корзинка на крыло; иконка ICON + overlays CARD/PERCH/NEST.
17. `G01_17` — кожаные ботинки; иконка ICON + overlays CARD/PERCH/NEST.
18. `G01_18` — резиновые сапожки; иконка ICON + overlays CARD/PERCH/NEST.
19. `G01_19` — сандалии с ремешками; иконка ICON + overlays CARD/PERCH/NEST.
20. `G01_20` — пояс с пряжкой; иконка ICON + overlays CARD/PERCH/NEST.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### G02 — 18 родных предметов

Figma page: `10_G02_GEAR_NATIVE`; save generated file as `qura_g02_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: REFERENCE GATE — not approved for generation.

**References:** MANDATORY: attach approved CARD/PERCH/NEST and anchors plus existing gear references. Without anchor verification, generate icon mockups ONLY; never finalize wearables.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_g02_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 10_G02_GEAR_NATIVE
SHEET ID: G02

Create exactly 18 specified independent assets in EXACT numbered order below. Arrange as a 6 columns x 3 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: MANDATORY: attach approved CARD/PERCH/NEST and anchors plus existing gear references. Without anchor verification, generate icon mockups ONLY; never finalize wearables.

EXACT ASSET LIST (18 outputs):
1. `G02_01` — Ряба: кокошник золотой; ICON + CARD/PERCH/NEST.
2. `G02_02` — Ряба: скорлупный нагрудник; ICON + CARD/PERCH/NEST.
3. `G02_03` — Ряба: лента с золотым яйцом; ICON + CARD/PERCH/NEST.
4. `G02_04` — Боевик: боевые перчатки; ICON + CARD/PERCH/NEST.
5. `G02_05` — Боевик: защитный жилет; ICON + CARD/PERCH/NEST.
6. `G02_06` — Боевик: плотная кепка; ICON + CARD/PERCH/NEST.
7. `G02_07` — Дурочка: разноцветные башмачки; ICON + CARD/PERCH/NEST.
8. `G02_08` — Дурочка: колпак с бубенцами; ICON + CARD/PERCH/NEST.
9. `G02_09` — Дурочка: пёстрый шарф; ICON + CARD/PERCH/NEST.
10. `G02_10` — Профессор: очки аналитика; ICON + CARD/PERCH/NEST.
11. `G02_11` — Профессор: профессорская мантия; ICON + CARD/PERCH/NEST.
12. `G02_12` — Профессор: сумочка с тетрадями; ICON + CARD/PERCH/NEST.
13. `G02_13` — Монах: чётки тишины; ICON + CARD/PERCH/NEST.
14. `G02_14` — Монах: сдержанный капюшон; ICON + CARD/PERCH/NEST.
15. `G02_15` — Монах: пояс с деревянной бусиной; ICON + CARD/PERCH/NEST.
16. `G02_16` — Гламурочка: звёздные очки; ICON + CARD/PERCH/NEST.
17. `G02_17` — Гламурочка: жемчужное ожерелье; ICON + CARD/PERCH/NEST.
18. `G02_18` — Гламурочка: клатч на крыло; ICON + CARD/PERCH/NEST.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### AEX01 — Арена эксклюзивы

Figma page: `11_AEX01_ARENA_EXCLUSIVES`; save generated file as `qura_aex01_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_aex01_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 11_AEX01_ARENA_EXCLUSIVES
SHEET ID: AEX01

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01–05: five Arena-exclusive CARD frames, rarity variations.
06–10: five Arena banners.
11–15: five crests.
16–20: five victory-emote graphics.
21–25: five Gladiator Arena cosmetic skins; no battle-power effect.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### FX01 — Боевые эффекты

Figma page: `12_FX01_BATTLE_FX`; save generated file as `qura_fx01_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_fx01_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 12_FX01_BATTLE_FX
SHEET ID: FX01

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
1. **FX01_01** — лёгкий прямой удар.
2. **FX01_02** — сильный удар с искрами.
3. **FX01_03** — световой блок Защиты.
4. **FX01_04** — искра контратаки.
5. **FX01_05** — рывок Манёвра.
6. **FX01_06** — ответный толчок.
7. **FX01_07** — Особый Рябы — разлёт золотой скорлупы.
8. **FX01_08** — Особый Боевика — тяжёлый удар.
9. **FX01_09** — Особый Дурочки — случайная вспышка «Авось!».
10. **FX01_10** — Особый Профессора — вычисленная цель.
11. **FX01_11** — Особый Монаха — светлая волна исцеления.
12. **FX01_12** — Особый Гламурочки — ослепительная вспышка.
13. **FX01_13** — персональный Shield.
14. **FX01_14** — общий Боевой купол.
15. **FX01_15** — мягкое лечение HP.
16. **FX01_16** — усиление атаки.
17. **FX01_17** — ослабление атаки.
18. **FX01_18** — перегрузка Special.
19. **FX01_19** — снижение заряда Special.
20. **FX01_20** — замедление/утрата темпа.
21. **FX01_21** — комичный промах.
22. **FX01_22** — замешкалась и закрылась.
23. **FX01_23** — выбывание — мерцающее затухание.
24. **FX01_24** — Молния богов — предупреждение.
25. **FX01_25** — Молния богов — удар.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S01 — Лист S01

Figma page: `13_S01`; save generated file as `qura_s01_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s01_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 13_S01
SHEET ID: S01

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S01_01** (R1C1) — маленький дубовый сундук с железной скобой, закрытый.
02. **S01_02** (R1C2) — тот же малый сундук с приоткрытой крышкой.
03. **S01_03** (R1C3) — тот же малый сундук открытый, золотое сияние.
04. **S01_04** (R1C4) — плетёная корзина с тканью и золотыми яйцами.
05. **S01_05** (R1C5) — деревянный ящик наград с печатью QuRa.
06. **S01_06** (R2C1) — редкий синий сундук с бронзовой фурнитурой.
07. **S01_07** (R2C2) — редкий синий сундук открытый.
08. **S01_08** (R2C3) — эпический пурпурный сундук с золотым орнаментом.
09. **S01_09** (R2C4) — эпический пурпурный сундук открытый.
10. **S01_10** (R2C5) — легендарный золотой сундук с резными крыльями.
11. **S01_11** (R3C1) — легендарный сундук открытый с лучами.
12. **S01_12** (R3C2) — артефактный чёрно-золотой ларец.
13. **S01_13** (R3C3) — артефактный ларец открытый.
14. **S01_14** (R3C4) — сезонный сундук с лентой.
15. **S01_15** (R3C5) — Arena-сундук со щитом.
16. **S01_16** (R4C1) — сундучок новичка с маленьким замком.
17. **S01_17** (R4C2) — запечатанный загадочный ящик.
18. **S01_18** (R4C3) — мешок с монетами GE и шнуром.
19. **S01_19** (R4C4) — подарочная коробка с пером.
20. **S01_20** (R4C5) — редкий ключ серебряный.
21. **S01_21** (R5C1) — эпический ключ с рубином.
22. **S01_22** (R5C2) — легендарный золотой ключ.
23. **S01_23** (R5C3) — сверток с печатью награды.
24. **S01_24** (R5C4) — маленькая капсула случайного приза.
25. **S01_25** (R5C5) — символ pity — гарантированная звезда в рамке.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S02 — Лист S02

Figma page: `14_S02`; save generated file as `qura_s02_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s02_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 14_S02
SHEET ID: S02

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S02_01** (R1C1) — золотая копилка-яйцо пустая.
02. **S02_02** (R1C2) — копилка на четверть заполнена GE.
03. **S02_03** (R1C3) — копилка наполовину заполнена GE.
04. **S02_04** (R1C4) — копилка заполнена на три четверти.
05. **S02_05** (R1C5) — полная копилка с сияющим замком.
06. **S02_06** (R2C1) — копилка с открытым люком и призами.
07. **S02_07** (R2C2) — маленький медный ключ копилки.
08. **S02_08** (R2C3) — серебряный ключ копилки.
09. **S02_09** (R2C4) — золотой ключ копилки.
10. **S02_10** (R2C5) — печать бесплатной награды.
11. **S02_11** (R3C1) — печать premium-награды.
12. **S02_12** (R3C2) — карта Season Pass из тёплого дерева.
13. **S02_13** (R3C3) — карта Season Pass с золотой каймой.
14. **S02_14** (R3C4) — сезонный билет с тиснением пера.
15. **S02_15** (R3C5) — золотая медаль сезонного уровня.
16. **S02_16** (R4C1) — сезонный прогресс-значок с пером.
17. **S02_17** (R4C2) — жетон достижения 7 дней.
18. **S02_18** (R4C3) — жетон достижения 14 дней.
19. **S02_19** (R4C4) — жетон достижения 21 день.
20. **S02_20** (R4C5) — жетон достижения 28 дней.
21. **S02_21** (R5C1) — маленький свиток сезонных заданий.
22. **S02_22** (R5C2) — сезонный сундук с календарём.
23. **S02_23** (R5C3) — премиальная подарочная лента.
24. **S02_24** (R5C4) — награда сезона — звёздный венец.
25. **S02_25** (R5C5) — значок финала сезона с трофеем.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S03 — Лист S03

Figma page: `15_S03`; save generated file as `qura_s03_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s03_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 15_S03
SHEET ID: S03

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S03_01** (R1C1) — одно золотое яйцо GE с тиснением QuRa.
02. **S03_02** (R1C2) — кучка из 5 золотых яиц.
03. **S03_03** (R1C3) — горсть золотых яиц 300 GE.
04. **S03_04** (R1C4) — корзинка золотых яиц.
05. **S03_05** (R1C5) — лукошко полное яиц.
06. **S03_06** (R2C1) — большой сундук золотых яиц.
07. **S03_07** (R2C2) — бирка цены чистая без текста.
08. **S03_08** (R2C3) — ценник со стёртым знаком скидки без цифр.
09. **S03_09** (R2C4) — золотая наклейка «выгодно» без текста.
10. **S03_10** (R2C5) — витрина из дуба пустая.
11. **S03_11** (R3C1) — настольный золотой пьедестал.
12. **S03_12** (R3C2) — мешочек покупок с пером.
13. **S03_13** (R3C3) — лента limited edition без текста.
14. **S03_14** (R3C4) — подарочный стартовый комплект.
15. **S03_15** (R3C5) — квитанция покупки без текста.
16. **S03_16** (R4C1) — иконка пополнения кошелька со стрелкой.
17. **S03_17** (R4C2) — иконка заработка GE с платёжной карточкой.
18. **S03_18** (R4C3) — иконка выбора между заработком и покупкой.
19. **S03_19** (R4C4) — счётчик нехватки GE без цифр.
20. **S03_20** (R4C5) — маркер набора из 3 вещей.
21. **S03_21** (R5C1) — маркер набора из 5 вещей.
22. **S03_22** (R5C2) — комплектная подарочная шкатулка.
23. **S03_23** (R5C3) — скидочный талон без чисел.
24. **S03_24** (R5C4) — призовой конверт с золотой печатью.
25. **S03_25** (R5C5) — лента купленного товара с галочкой.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S04 — Лист S04

Figma page: `16_S04`; save generated file as `qura_s04_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s04_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 16_S04
SHEET ID: S04

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S04_01** (R1C1) — сфера Неуязвимость с прозрачной оболочкой.
02. **S04_02** (R1C2) — одно светящееся Последнее перо.
03. **S04_03** (R1C3) — Феникс — огненное яйцо возрождения.
04. **S04_04** (R1C4) — Боевой купол — щит на три силуэта.
05. **S04_05** (R1C5) — Каменная кожа — каменное перо.
06. **S04_06** (R2C1) — Черепаший строй — три щита.
07. **S04_07** (R2C2) — Зеркало — отражающий золотой круг.
08. **S04_08** (R2C3) — Второе дыхание — светящееся сердце.
09. **S04_09** (R2C4) — Общий медик — аптечка с золотым крестом.
10. **S04_10** (R2C5) — Чистая голова — хрустальная капля.
11. **S04_11** (R3C1) — усиление Shield — двойной щит.
12. **S04_12** (R3C2) — маленький персональный оберег.
13. **S04_13** (R3C3) — щит от первого удара — щит с цифрой один без текста.
14. **S04_14** (R3C4) — сильный защитный барьер.
15. **S04_15** (R3C5) — туманный щит.
16. **S04_16** (R4C1) — непробиваемое яйцо.
17. **S04_17** (R4C2) — лечебное облако.
18. **S04_18** (R4C3) — аура восстановления здоровья.
19. **S04_19** (R4C4) — печать защиты от Special.
20. **S04_20** (R4C5) — щит от дебафа.
21. **S04_21** (R5C1) — цепь командного прикрытия.
22. **S04_22** (R5C2) — маска защитника.
23. **S04_23** (R5C3) — оберег Курятника.
24. **S04_24** (R5C4) — благословлённая защитная лента.
25. **S04_25** (R5C5) — пузырь спасения на 1 HP.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S05 — Лист S05

Figma page: `17_S05`; save generated file as `qura_s05_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s05_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 17_S05
SHEET ID: S05

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S05_01** (R1C1) — Двойная сила — расколовшаяся печать с двумя лучами.
02. **S05_02** (R1C2) — Адреналин — красный флакон энергии.
03. **S05_03** (R1C3) — Боевой клич — золотой рупор.
04. **S05_04** (R1C4) — Щитолом — перо-клинок разбивает щит.
05. **S05_05** (R1C5) — Антищит — разрушающееся кольцо щита.
06. **S05_06** (R2C1) — Метка охотника — цель с золотым пером.
07. **S05_07** (R2C2) — Возмездие — отражающий удар молот.
08. **S05_08** (R2C3) — Заряд Special — сияющая шкала энергии.
09. **S05_09** (R2C4) — Перегрузка Special — взрыв звезды.
10. **S05_10** (R2C5) — Эхо Special — два концентрических импульса.
11. **S05_11** (R3C1) — Тишина — замок на звезде Special.
12. **S05_12** (R3C2) — Сбить концентрацию — рассыпающиеся искры.
13. **S05_13** (R3C3) — Ускоритель — крылатый ботинок.
14. **S05_14** (R3C4) — ослабление атаки — треснутое красное перо.
15. **S05_15** (R3C5) — усиление атаки — два скрещённых пера.
16. **S05_16** (R4C1) — контратака — бумеранг щита.
17. **S05_17** (R4C2) — разящий финт — стрелка ложного движения.
18. **S05_18** (R4C3) — ядовитое яйцо как дебаф-символ без яда в реальности.
19. **S05_19** (R4C4) — перепуг — комичная испуганная маска.
20. **S05_20** (R4C5) — волна оглушения — звуковое кольцо.
21. **S05_21** (R5C1) — боевой рывок — след сапога.
22. **S05_22** (R5C2) — точный удар — мишень и перо.
23. **S05_23** (R5C3) — сокрушение — треснувший щит.
24. **S05_24** (R5C4) — разрыв концентрации — разломанный кристалл.
25. **S05_25** (R5C5) — связанный Special — звезда в цепях.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S06 — Лист S06

Figma page: `18_S06`; save generated file as `qura_s06_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s06_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 18_S06
SHEET ID: S06

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S06_01** (R1C1) — Обмен местами — две перекрещённые стрелки.
02. **S06_02** (R1C2) — Перестройка — три переставляемые фишки.
03. **S06_03** (R1C3) — Перехват — щит перед союзником.
04. **S06_04** (R1C4) — Дымовая завеса — серое облако с пером.
05. **S06_05** (R1C5) — Джокер — золотая игральная карта с вопросом.
06. **S06_06** (R2C1) — магнитная притяжка цели.
07. **S06_07** (R2C2) — перенос урона — двойная стрелка.
08. **S06_08** (R2C3) — отступление в укрытие — следы лап.
09. **S06_09** (R2C4) — приманка — деревянная курочка-манекен.
10. **S06_10** (R2C5) — переход в другую линию — три дорожки.
11. **S06_11** (R3C1) — случайный усилитель — лотерейная звезда.
12. **S06_12** (R3C2) — случайный щит — закрытый куб.
13. **S06_13** (R3C3) — переброс эффекта — две круглые стрелки.
14. **S06_14** (R3C4) — печать неожиданности — треснутая маска.
15. **S06_15** (R3C5) — туман для всей команды.
16. **S06_16** (R4C1) — метка безопасной позиции.
17. **S06_17** (R4C2) — флажок выбранной линии.
18. **S06_18** (R4C3) — отмена фиксации позиции — перетаскиваемая фишка.
19. **S06_19** (R4C4) — ловушка на дорожке — деревянная сетка.
20. **S06_20** (R4C5) — разворот атаки — изогнутая стрелка.
21. **S06_21** (R5C1) — барьер между двумя командами.
22. **S06_22** (R5C2) — защитная перестановка — щиты и стрелки.
23. **S06_23** (R5C3) — мгновенный рывок вбок.
24. **S06_24** (R5C4) — удачный случай — четырёхлистный клевер в яйце.
25. **S06_25** (R5C5) — неудачный случай — треснувший чёрный куб.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S07 — Лист S07

Figma page: `19_S07`; save generated file as `qura_s07_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s07_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 19_S07
SHEET ID: S07

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S07_01** (R1C1) — дубовая кормушка.
02. **S07_02** (R1C2) — берёзовый насест.
03. **S07_03** (R1C3) — соломенное гнездо.
04. **S07_04** (R1C4) — гнездо с мягкой подушкой.
05. **S07_05** (R1C5) — маленькое окно с видом на поле.
06. **S07_06** (R2C1) — настенный фонарь тёплый.
07. **S07_07** (R2C2) — ведёрко зерна.
08. **S07_08** (R2C3) — деревянная бочка.
09. **S07_09** (R2C4) — мешок с пшеницей.
10. **S07_10** (R2C5) — полка с банками.
11. **S07_11** (R3C1) — коврик ручной работы.
12. **S07_12** (R3C2) — маленькая лестница на второй насест.
13. **S07_13** (R3C3) — картина с золотым яйцом.
14. **S07_14** (R3C4) — настенные часы с кукушкой.
15. **S07_15** (R3C5) — декоративная подкова.
16. **S07_16** (R4C1) — деревянная табличка без надписи.
17. **S07_17** (R4C2) — кувшин с ромашками.
18. **S07_18** (R4C3) — ящик с игрушками.
19. **S07_19** (R4C4) — плетёный корзинный стол.
20. **S07_20** (R4C5) — лампа с янтарным абажуром.
21. **S07_21** (R5C1) — тумбочка с резьбой.
22. **S07_22** (R5C2) — деревянная скамья.
23. **S07_23** (R5C3) — занавеска кремового цвета.
24. **S07_24** (R5C4) — циновка перед дверью.
25. **S07_25** (R5C5) — кучерявый куст в горшке.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S08 — Лист S08

Figma page: `20_S08`; save generated file as `qura_s08_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s08_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 20_S08
SHEET ID: S08

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S08_01** (R1C1) — золотой насест с резьбой.
02. **S08_02** (R1C2) — королевское гнездо с бархатом.
03. **S08_03** (R1C3) — бархатная подушка.
04. **S08_04** (R1C4) — хрустальная люстра.
05. **S08_05** (R1C5) — золотая люстра в форме яйца.
06. **S08_06** (R2C1) — парадные дубовые ворота.
07. **S08_07** (R2C2) — миниатюрный фонтанчик.
08. **S08_08** (R2C3) — медная жаровня без огня.
09. **S08_09** (R2C4) — витраж с перьями.
10. **S08_10** (R2C5) — фонарь из позолоченной бронзы.
11. **S08_11** (R3C1) — парадный ковёр красный.
12. **S08_12** (R3C2) — королевская табличка без текста.
13. **S08_13** (R3C3) — декоративный трон Рябы.
14. **S08_14** (R3C4) — серебряный поднос.
15. **S08_15** (R3C5) — витрина для медалей.
16. **S08_16** (R4C1) — стенд для кубков.
17. **S08_17** (R4C2) — птичий портрет в раме.
18. **S08_18** (R4C3) — золотая колонна.
19. **S08_19** (R4C4) — ширма с растительным узором.
20. **S08_20** (R4C5) — комнатное деревце с золотыми листьями.
21. **S08_21** (R5C1) — балюстрада из дерева и золота.
22. **S08_22** (R5C2) — фигурка золотого петуха.
23. **S08_23** (R5C3) — шкатулка с украшениями.
24. **S08_24** (R5C4) — трофейный пьедестал.
25. **S08_25** (R5C5) — аура золотых частиц вокруг гнезда.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S09 — Лист S09

Figma page: `21_S09`; save generated file as `qura_s09_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s09_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 21_S09
SHEET ID: S09

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S09_01** (R1C1) — осенний венок из листьев.
02. **S09_02** (R1C2) — снежный венок с шишками.
03. **S09_03** (R1C3) — весенний венок с цветами.
04. **S09_04** (R1C4) — летняя гирлянда из колосьев.
05. **S09_05** (R1C5) — тыква с весёлой мордочкой.
06. **S09_06** (R2C1) — белая снежинка резная.
07. **S09_07** (R2C2) — ёлочная игрушка яйцо.
08. **S09_08** (R2C3) — новогодняя подарочная коробка.
09. **S09_09** (R2C4) — шапка Деда Мороза для курочки.
10. **S09_10** (R2C5) — зимний шарф с кисточками.
11. **S09_11** (R3C1) — весенний цветочный венец.
12. **S09_12** (R3C2) — дождевик с капюшоном для курочки.
13. **S09_13** (R3C3) — солнцезащитные очки.
14. **S09_14** (R3C4) — сердечко в деревянной рамке.
15. **S09_15** (R3C5) — лента победителя сезона.
16. **S09_16** (R4C1) — праздничная гирлянда из лампочек.
17. **S09_17** (R4C2) — золотая осенняя ветвь.
18. **S09_18** (R4C3) — ярмарочный флажок.
19. **S09_19** (R4C4) — летняя соломенная шляпа.
20. **S09_20** (R4C5) — миниатюрный зонтик.
21. **S09_21** (R5C1) — корзинка пасхальных расписных яиц.
22. **S09_22** (R5C2) — цветок подсолнуха.
23. **S09_23** (R5C3) — зимний маленький снеговик.
24. **S09_24** (R5C4) — фейерверк частиц без фона.
25. **S09_25** (R5C5) — сезонная медаль с листом.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S10 — Лист S10

Figma page: `22_S10`; save generated file as `qura_s10_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s10_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 22_S10
SHEET ID: S10

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S10_01** (R1C1) — пустая карточка бойца деревянная.
02. **S10_02** (R1C2) — карточка бойца выбранная золотая.
03. **S10_03** (R1C3) — карточка бойца раненая с трещинами.
04. **S10_04** (R1C4) — жетон HP с сердцем.
05. **S10_05** (R1C5) — жетон щита.
06. **S10_06** (R2C1) — полоса HP пустая.
07. **S10_07** (R2C2) — полоса HP наполненная.
08. **S10_08** (R2C3) — шкала Special пустая.
09. **S10_09** (R2C4) — шкала Special заряженная.
10. **S10_10** (R2C5) — кнопка Attack обычная.
11. **S10_11** (R3C1) — кнопка Attack нажатая.
12. **S10_12** (R3C2) — кнопка Defense обычная.
13. **S10_13** (R3C3) — кнопка Defense нажатая.
14. **S10_14** (R3C4) — кнопка Maneuver обычная.
15. **S10_15** (R3C5) — кнопка Maneuver нажатая.
16. **S10_16** (R4C1) — кнопка Special готова.
17. **S10_17** (R4C2) — кнопка Special недоступна.
18. **S10_18** (R4C3) — таймер деревянный циферблат.
19. **S10_19** (R4C4) — маркер хода подтверждено.
20. **S10_20** (R4C5) — маркер соперник думает.
21. **S10_21** (R5C1) — иконка Подсказка.
22. **S10_22** (R5C2) — иконка Всевидящий.
23. **S10_23** (R5C3) — иконка Автобой.
24. **S10_24** (R5C4) — иконка чата.
25. **S10_25** (R5C5) — иконка летописи.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S11 — Лист S11

Figma page: `23_S11`; save generated file as `qura_s11_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s11_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 23_S11
SHEET ID: S11

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S11_01** (R1C1) — лёгкий удар по щиту.
02. **S11_02** (R1C2) — сильный удар с искрами.
03. **S11_03** (R1C3) — разлёт золотой скорлупы.
04. **S11_04** (R1C4) — маленькая вспышка Special.
05. **S11_05** (R1C5) — большой взрыв Special.
06. **S11_06** (R2C1) — сверкание лечения.
07. **S11_07** (R2C2) — сияние нового Shield.
08. **S11_08** (R2C3) — частицы ослабления.
09. **S11_09** (R2C4) — частицы ускорения.
10. **S11_10** (R2C5) — полоска комичной пыли от финта.
11. **S11_11** (R3C1) — след рывка.
12. **S11_12** (R3C2) — волна концентрации Профессора.
13. **S11_13** (R3C3) — ореол Монаха.
14. **S11_14** (R3C4) — вспышка позирования Гламурочки.
15. **S11_15** (R3C5) — удар всем корпусом Боевика.
16. **S11_16** (R4C1) — случайная вспышка Авось.
17. **S11_17** (R4C2) — появление Последнего пера.
18. **S11_18** (R4C3) — активация Феникса.
19. **S11_19** (R4C4) — разрушение Боевого купола.
20. **S11_20** (R4C5) — Молния богов — предупреждающая туча.
21. **S11_21** (R5C1) — Молния богов — удар.
22. **S11_22** (R5C2) — Молния богов — дым и искры.
23. **S11_23** (R5C3) — победное конфетти.
24. **S11_24** (R5C4) — маркер нокаута — звёздочки.
25. **S11_25** (R5C5) — декоративный разделитель летописи.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```

### S12 — Лист S12

Figma page: `24_S12`; save generated file as `qura_s12_sprite_sheet_v01.png` (generator might not assign real filename; rename exported PNG accordingly). Status: PRODUCTION PROMPT.

**References:** Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

**COPY THE FULL BLOCK BELOW AS ONE PROMPT.**

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME (rename exported file if generator does not support filenames): qura_s12_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 24_S12
SHEET ID: S12

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements. Maintain stable grid cell sizes; export the final artwork as a single sheet and later slice to stable IDs in Figma.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera for objects, crisp mobile-readable edges and faithful approved proportions. No photorealism, flat generic icon art, unrelated props, text, fake logos, numbers, captions, watermark, painted opaque background, duplicated slots or inconsistent shadows.

D-20 IS LOCKED: Arena fighters use ONE CARD body with runtime animations and separate FX layers. Never create attack/defend/hit/death body poses. Equipment must fit existing anchor positions on the CARD and other approved poses, not change anatomy.

REFERENCE REQUIREMENTS: Attach approved QuRa palette/style board; for Arena graphics add approved CARD and Arena UI reference, for S lists attach existing related visual references if present.

EXACT ASSET LIST (25 outputs):
01. **S12_01** (R1C1) — серебряный билет мини-игры.
02. **S12_02** (R1C2) — золотой билет мини-игры.
03. **S12_03** (R1C3) — жетон бесплатной попытки.
04. **S12_04** (R1C4) — жетон повторной попытки.
05. **S12_05** (R1C5) — награда за 20 очков — маленькая медаль.
06. **S12_06** (R2C1) — награда за 50 очков — бронзовая медаль.
07. **S12_07** (R2C2) — награда за 100 очков — серебряная медаль.
08. **S12_08** (R2C3) — награда за 200 очков — золотая медаль.
09. **S12_09** (R2C4) — награда за 300 очков — медаль с пером.
10. **S12_10** (R2C5) — награда за 500 очков — звёздная медаль.
11. **S12_11** (R3C1) — награда за 1000 очков — корона.
12. **S12_12** (R3C2) — иконка лидерборда.
13. **S12_13** (R3C3) — значок первого места.
14. **S12_14** (R3C4) — значок второго места.
15. **S12_15** (R3C5) — значок третьего места.
16. **S12_16** (R4C1) — победный баннер без текста.
17. **S12_17** (R4C2) — кнопка паузы деревянная.
18. **S12_18** (R4C3) — кнопка старта деревянная.
19. **S12_19** (R4C4) — кнопка повтора деревянная.
20. **S12_20** (R4C5) — кнопка звука.
21. **S12_21** (R5C1) — кнопка вибрации.
22. **S12_22** (R5C2) — маленький трофей мини-игры.
23. **S12_23** (R5C3) — эмблема режима А.
24. **S12_24** (R5C4) — эмблема режима Б.
25. **S12_25** (R5C5) — жетон удвоения очков рейтинга.

SELF-QA BEFORE DELIVERY: confirm asset count, grid layout, correct mapping of each item to its numbered cell, transparent alpha, consistent style, no textual labels, no cropped edges, no missing or duplicated objects, separation suitable for Figma slicing. Mark all character dependent results as draft until reference comparison is approved.
```


## Export and acceptance

Keep source sheet and sliced PNGs; each output as `qura_<id>_<cell>_v01.png`; no baked UI text, no false claims of 4096px when actual output differs. Overlay gear requires CARD/PERCH/NEST alignment QA. Do not regenerate legacy Wolf assets without explicit comparison. Character images remain blocked until their actual approved Figma master and Ryaba references are attached. S11 overlaps FX01: audit duplicate assets before generation.
