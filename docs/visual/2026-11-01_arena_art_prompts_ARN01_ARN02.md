# Арена QuRa — графика: что есть и что нарисовать (ARN01, ARN02)

**Дата:** 01.11.2026 · **Владелец:** Павел · **Статус:** PRODUCTION PROMPT, утверждено к генерации
**Живая версия:** https://claude.ai/artifact/4NdZyaqRBq5u5qxmFdaaXq
**Задание агенту:** `docs/instructions/2026-11-01_arena_art_generation.md`

## Главное

Для красивой Арены в основном не хватает самой сцены: фона, трибун со зрителями, ринга и переднего плана. Эффекты ударов, кнопки, рамки карточек, гербы и сундуки уже нарисованы в Figma. Это черновики со статусом «на доработку», но их можно брать в работу.

Как бой устроен по документации ([ARENA_SPEC_V1 §40.1](../../ARENA_SPEC_V1.md), [ASSET_PRODUCTION §29](../../ASSET_PRODUCTION.md)). Это решение D-20, оно закреплено:

- У курочки **одна поза — CARD**. Отдельных поз для удара, защиты, ранения и смерти не рисуем.
- Движение делает код. Атака — сдвиг к сопернику на 8–15% и наклон. Защита — сжатие на 3–6%. Манёвр — рывок вбок. Ранение — отскок. Выбывание — затемнение и сдвиг вниз.
- Смысл действия передают **эффекты (FX)** поверх курочки и цифры урона в интерфейсе.
- Экипировка надета на CARD и двигается вместе с ней.
- Нужен режим уменьшенной анимации: без тряски, результат дублируется текстом.

Отсюда правило для всех новых промптов: курочек-бойцов в фонах не рисуем. Фон — пустая сцена, на которую код ставит двух бойцов.

## Что уже есть в Figma

В файле [QuRa · Arena и Курятник · производство графики](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg) для Арены уже сгенерированы листы по 25 элементов. Все они помечены как черновики: нарезка на отдельные файлы и проверка качества ещё не пройдены.

| Лист | Что в нём | Где нужно в Арене | Состояние |
| --- | --- | --- | --- |
| FX01 · боевые эффекты | удары, блок, контрудар, рывок Манёвра, 6 эффектов Спецнавыков, щит, лечение, усиление и ослабление, промах, выбывание, «Молния богов» | сам бой | в целом готово; уже стоит в демке |
| S11 · дополнительные эффекты | второй набор ударов и вспышек, победное конфетти, звёздочки нокаута, разделитель летописи | бой, финал, летопись | частично дублирует FX01 — выбрать лучшие |
| S10 · боевой интерфейс | рамки карточки бойца (обычная, выбранная, раненая), жетоны HP и щита, полосы HP и заряда, 4 кнопки действий в двух состояниях, таймер, маркеры «ход подтверждён» и «соперник думает», иконки Подсказка, Всевидящий, Автобой, чат, летопись | панель боя | покрывает почти весь интерфейс боя |
| AEX01 · эксклюзивы Арены | 5 рамок карточки по редкости, 5 знамён, 5 гербов, 5 победных эмоций, 5 костюмов «Гладиатор» для Рябы | косметика и награды; знамёна подойдут для декора арены | готово |
| S01 · сундуки и награды | сундуки разной редкости, в том числе Arena-сундук со щитом (S01_15), ключи | итог боя | готово |
| S04, S05, S06 · бафы | защитные, атакующие и тактические бафы | позже: бафов нет в первом релизе Арены | готово, пока не нужно |
| C01–C06 · курочки в позе CARD | шесть основательниц | бойцы на сцене | утверждена только Ряба; в демке пока стоят картинки из кошелька |

Фона арены в Figma нет ни на одной странице. Во втором файле проекта («Персонажи и анимации») фоны сделаны для мини-игры «Волк ловит яйца», а не для Арены.

## Чего не хватает

Не хватает 8 изображений сцены (лист ARN01) и 25 мелких элементов интерфейса (лист ARN02). Для Релиза 2 «Арена 1×1» обязательны все строки с пометкой «сразу», остальное можно дорисовать после.

| ID | Элемент | Зачем | Когда |
| --- | --- | --- | --- |
| ARN01_01 | Фон арены для телефона (вертикальный) | задник сцены боя | сразу |
| ARN01_02 | Фон арены для компьютера (горизонтальный) | тот же задник для широких экранов | сразу |
| ARN01_03 | Зрители на трибунах, 3 кадра | трибуны оживают на ударах и победе | сразу |
| ARN01_04 | Пол ринга с метками старта | сюда код ставит бойцов | сразу |
| ARN01_05 | Передний план: канаты и столбики | лежит поверх бойцов, даёт глубину | сразу |
| ARN01_06 | Свет: луч прожектора и свечение фонарей | мягкое мерцание, вспышка на Спецнавыке | сразу |
| ARN01_07 | Тень под бойцом и золотое кольцо «твой боец» | боец стоит на полу, а не висит | сразу |
| ARN01_08 | Фон «Главной Арены»: ворота арены снаружи | экран выбора режима и поиска соперника | сразу |
| ARN02_01–06 | VS-эмблема, плашка имени, плашка раунда, ленты «Победа», «Поражение», «Ничья» (без текста) | заставка, раунды, финал | сразу |
| ARN02_07–08 | Значки «Бот» и «Живой игрок» | по решению от 30.10 бота нужно видно обозначать до оплаты | сразу |
| ARN02_09–11 | Иконки тактик защиты: Агрессивная, Осторожная, Хитрая | асинхронный бой и «Моя защита» | сразу |
| ARN02_12–13 | Радар поиска соперника, билет аренды Арены | поиск и оплата 10 GE | сразу |
| ARN02_14–16 | Три ячейки Arena-сундука: трофей, опыт, эксклюзив | итог победы | сразу |
| ARN02_17–18 | Значок «Неприступный курятник», журнал защиты | как вашу курочку атаковали, пока вас не было | после |
| ARN02_19–21 | Маленькие значки статусов: атака усилена, атака ослаблена, заряд сожжён | постоянно видны у полосы HP; большие FX для этого слишком крупные | сразу |
| ARN02_22–24 | Плитки режимов 1×1, 2×2 и 3×3 (две заблокированы) | «Главная Арены» и тизер | сразу |
| ARN02_25 | Иконка «Реванш» | кнопка на экране итогов | после |

Правило R-011 «только курочки» действует и здесь: среди зрителей и в декоре нет петухов, только курочки и цыплята.

## Промпты: сцена арены (ARN01)

Страница в Figma — `26_ARN01_ARENA_SCENE`. Каждый блок копируется в генератор целиком: сначала общий стиль, потом сам элемент. К каждому запросу приложите два референса: фон Курятника из кошелька (`QuRa/web/public/assets/adaptive/coop/bg-941.webp`, единый стиль мира) и лист FX01 (единый свет и материалы). Промпты на английском: генераторы точнее следуют им.

**Общий стиль (вставлять в начало каждого промпта)**

```text
QuRa game art. Premium cozy soft-3D dimensional style, warm oak wood, rich amber and polished gold, soft volumetric materials, warm lantern light with top-left key light, evening barn atmosphere, crisp mobile-readable shapes, gentle depth of field. Same world as the QuRa coop: a rustic wooden barn turned into a festive chicken arena. Only hens and chicks, no roosters, no people, no other animals. No text, no letters, no numbers, no logos, no watermark, no UI.
```

**ARN01_01 · Фон арены для телефона**

```text
Empty arena stage for a turn-based duel game, vertical 9:16, 1080x1920 (master 2160x3840). Inside a large festive wooden barn at evening. Back wall of warm oak planks with two tiers of empty wooden bleachers in the upper 45% of the frame (spectators will be added as a separate layer). Hanging warm lanterns and strings of small bulbs under the roof beams. Two tall hanging cloth banners on the left and right walls, plain with a gold feather emblem, no text. In the lower half a round sandy-straw arena floor seen from a slight 3/4 high angle, framed by a low red rope fence on wooden posts with gold caps. The center of the floor is clear and evenly lit by a soft spotlight from above. Keep the top 18% calm and darker for the score bar, keep the bottom 25% simple for buttons. No characters on the floor.
```

**ARN01_02 · Фон арены для компьютера**

```text
Same arena as the vertical version, wide 16:9, master 3840x2160. Wider bleachers on both sides, a big wooden gate at the back center with a gold feather crest, more lanterns. Round sandy-straw ring in the lower middle, red rope fence on wooden posts. Leave a clear empty floor area in the center third for two fighters standing left and right. Keep the top band calm for the score bar. No characters.
```

**ARN01_03 · Зрители (3 кадра)**

```text
Spectator layer for the arena bleachers, transparent PNG, same size and perspective as ARN01_01 so it overlays exactly. Rows of small cute hens and chicks of different feather colors (brown, white, speckled, golden) sitting on the bleachers, some waving tiny flags without text, some holding small corn snacks. Create three frames of the same crowd: frame A calm, frame B cheering with wings up, frame C excited with small confetti. Characters must stay in the same positions in all three frames, only poses change. Nothing outside the bleacher area.
```

**ARN01_04 · Пол ринга с метками**

```text
Arena floor layer, transparent PNG, matching ARN01_01 perspective. A round sandy-straw ring with a soft painted gold circle in the middle and two subtle start marks left and right (small gold feather-shaped floor marks, no text). Light scattered straw, a few small grains. Soft warm spotlight pool in the center. Nothing else.
```

**ARN01_05 · Передний план: канаты**

```text
Foreground layer, transparent PNG, matching ARN01_01. Front part of the ring fence only: red ropes on two wooden posts with gold caps at the lower left and lower right corners, slightly blurred like a close camera, plus a few straw bits on the ground at the very bottom. Center of the frame must stay transparent so the fighters are fully visible.
```

**ARN01_06 · Световые слои**

```text
Two separate transparent light overlays for the arena, same size as ARN01_01: (1) a soft volumetric spotlight cone from the roof onto the ring center with floating dust specks; (2) warm glow halos around each lantern position. Additive glow look, no objects, no hard edges.
```

**ARN01_07 · Тень и кольцо под бойцом**

```text
Two small transparent assets, top-down 3/4 floor perspective: (1) a soft dark oval contact shadow for a standing chicken; (2) a glowing gold ring on the floor with tiny sparkles, marking the player's fighter. 1024x512 each, centered, no text.
```

**ARN01_08 · Фон «Главной Арены»**

```text
Arena lobby background, vertical 9:16, 1080x1920. Outside view of the same festive wooden barn arena at dusk: big double wooden gates slightly open with warm light inside, two tall banners with a gold feather emblem, lanterns, a wooden notice board without text on the side, straw and a few corn sacks near the entrance. Keep the middle 60% calm and slightly darker for mode cards and buttons. No characters, no text.
```

## Промпт: детали интерфейса (ARN02)

Один лист 5×5 в том же формате, что листы в Figma: генерируется одним изображением и потом нарезается. Страница в Figma — `27_ARN02_ARENA_UI_PLUS`. Референсы: листы S10 и AEX01, чтобы золото, дерево и круглые жетоны совпали.

```text
You are producing production-ready artwork for the QuRa game application.
OUTPUT FILE NAME: qura_arn02_sprite_sheet_v01.png
FIGMA DESTINATION PAGE: 27_ARN02_ARENA_UI_PLUS
SHEET ID: ARN02

Create exactly 25 specified independent assets in EXACT numbered order below. Arrange as a 5 columns x 5 rows sheet. Each cell contains one complete asset only, no labels, no rendered cell borders. PNG transparent alpha background, source canvas 4096x4096 or maximum available size; 12% inner safe margins, no overlap, no cropped elements.

VISUAL IDENTITY: QuRa premium cozy soft-3D / dimensional game art, warm oak wood, rich amber and polished gold, soft volumetric materials, top-left key light, consistent 3/4 front camera, crisp mobile-readable edges. Match the round gold-rimmed tokens and wooden frames of sheets S10 and AEX01. No photorealism, no text, no letters, no numbers, no logos, no watermark. Only hens and chicks, never roosters.

EXACT ASSET LIST (25 outputs):
01. ARN02_01 — VS emblem: two crossed golden feathers over a cracked golden egg with a burst of light, no letters.
02. ARN02_02 — fighter name plate: horizontal oak plank with gold corners and a round empty socket on the left for a crest.
03. ARN02_03 — round plate: small oval wooden plaque with gold rim and an empty center for a number.
04. ARN02_04 — victory ribbon: wide gold-and-red ribbon with laurel branches and sparkles, empty center.
05. ARN02_05 — defeat ribbon: soft muted brown ribbon with a single gentle feather, friendly, not sad, empty center.
06. ARN02_06 — draw ribbon: two-tone half gold half silver ribbon with two crossed feathers, empty center.
07. ARN02_07 — bot badge: round token with a cute wooden toy hen with a small wind-up key on its back.
08. ARN02_08 — live player badge: round token with a hen silhouette and a small green glowing dot.
09. ARN02_09 — defense tactic Aggressive: round red token with a forward-pointing beak and speed lines.
10. ARN02_10 — defense tactic Cautious: round blue token with a hen tucked behind a round shield.
11. ARN02_11 — defense tactic Tricky: round purple token with a swirling feather and a winking eye.
12. ARN02_12 — opponent search radar: golden egg-shaped radar dish with circular pulse waves.
13. ARN02_13 — arena rental ticket: wooden-and-gold ticket with a torn edge and a small GE golden egg stamp, no numbers.
14. ARN02_14 — arena trophy: small golden cup with a feather crest on a wooden base, sellable reward look.
15. ARN02_15 — experience reward: glowing scroll tied with a ribbon and a rising star.
16. ARN02_16 — exclusive cosmetic reward: purple velvet cushion with a mystery silhouette under a soft glowing shimmer.
17. ARN02_17 — Impregnable Coop badge: small wooden coop with a gold shield on the door and laurels.
18. ARN02_18 — defense journal: open wooden-bound book with a small shield bookmark.
19. ARN02_19 — status icon attack boosted: tiny round token with an orange upward arrow and a beak, readable at 32px.
20. ARN02_20 — status icon attack weakened: tiny round token with a purple downward arrow and a dimmed beak, readable at 32px.
21. ARN02_21 — status icon special charge drained: tiny round token with a blue charge bar leaking sparks, readable at 32px.
22. ARN02_22 — mode tile 1x1: wooden card with two small hen silhouettes facing each other, gold rim.
23. ARN02_23 — mode tile 2x2 locked: same card with four hen silhouettes, greyed out, a small gold padlock.
24. ARN02_24 — mode tile 3x3 locked: same card with six hen silhouettes, greyed out, a small gold padlock.
25. ARN02_25 — rematch icon: round token with two golden circular arrows around a small egg.

SELF-QA BEFORE DELIVERY: confirm 25 assets, correct order, transparent alpha, consistent style with S10 and AEX01, no text, no cropped edges, separation suitable for Figma slicing.
```

## Как элементы работают вместе

Экран боя — это 10 слоёв друг над другом. Художник рисует каждый слой отдельно, а код складывает их и двигает. Сверху вниз, от ближнего к дальнему:

| № | Слой | Источник |
| --- | --- | --- |
| 1 | Кнопки 4 действий, таймер, «соперник думает» | S10 |
| 2 | Полосы HP и заряда, имя, герб, значки статусов | S10, ARN02 |
| 3 | Передний план: канаты и столбики | ARN01_05 |
| 4 | Эффекты удара, блока, Спецнавыка, цифры урона | FX01, S11 |
| 5 | **Курочка в позе CARD с экипировкой** | C01–C06, G01, G02 |
| 6 | Тень и золотое кольцо под бойцом | ARN01_07 |
| 7 | Пол ринга с метками старта | ARN01_04 |
| 8 | Зрители на трибунах, 3 кадра | ARN01_03 |
| 9 | Свет: прожектор и фонари | ARN01_06 |
| 10 | Фон: амбар-арена, пустые трибуны, знамёна | ARN01_01 / 02, AEX01 |

Передний план лежит выше бойцов, поэтому курочки оказываются «внутри» ринга, а не приклеены к картинке.

Как проходит один раунд ([SCREENS §33–39](../../SCREENS.md), [ARENA_SPEC §5](../../ARENA_SPEC_V1.md)):

1. **Выбор.** Идёт таймер 45 секунд. Игрок жмёт одну из 4 кнопок (S10_10–17). Под кнопкой есть спойлер с полным описанием действия. У соперника виден только маркер «думает» или «ход сделан» (S10_19–20), сам ход скрыт.
2. **Раскрытие.** Сервер считает раунд и присылает результат. Курочки делают движение (выпад, сжатие, рывок), поверх играет эффект из FX01, цифры урона всплывают, полосы HP и заряда доезжают до новых значений. Зрители переключаются на кадр «ликуют».
3. **Итог раунда.** Плашка раунда (ARN02_03), короткое объяснение «что чем побили», значки статусов у полос HP (ARN02_19–21), запись в летопись.
4. **Пропуск хода.** Первый — автоматическая Защита и эффект «замешкалась» (FX01_22). Второй подряд — «Молния богов» (FX01_24–25) и техническое поражение.
5. **Конец боя.** Выбывшая курочка темнеет и опускается (FX01_23, звёздочки S11_24). Лента «Победа», «Поражение» или «Ничья» (ARN02_04–06), конфетти (S11_23). Победитель получает Arena-сундук (S01_15) с тремя ячейками (ARN02_14–16). В бою с ботом сундук сокращённый: только опыт.

Режим уменьшенной анимации убирает тряску и выпады, эффекты плавно проявляются, результат дублируется текстом.

## Порядок работ и приёмка

1. Сначала ARN01_01 (фон для телефона). По нему утвердить стиль арены; остальные слои генерировать с ним как референсом.
2. Затем ARN01_03–07: зрители, пол, передний план, свет, тень. Они должны точно ложиться на фон.
3. Лист ARN02 и фон «Главной Арены» ARN01_08.
4. Широкий фон ARN01_02 — последним, когда вертикальный утверждён.
5. Параллельно: нарезать уже готовые FX01, S10, S11, AEX01 и S01_15 на отдельные файлы и снять с них пометку «на доработку».

Что проверять при приёмке:

- на фонах нет курочек-бойцов, надписей, цифр и петухов;
- центр ринга свободен, верхняя полоса спокойная — там будут полосы HP;
- слои на прозрачном фоне и того же размера, что фон;
- на фоне одновременно читаются и Ряба, и тёмный Боевик (проверить, поставив их в демку);
- имена файлов по правилу репозитория: `qura_arn01_01_v01.png` и так далее.

Как только фон появится в Figma, его вставят в [демку Арены](https://claude.ai/artifact/2MgK3WkqX964am4atrV66f) вместо нарисованной кодом сцены.

## Источники

- [ARENA_SPEC_V1.md](../../ARENA_SPEC_V1.md) — §40 описание действий, §40.1 рендер CARD + FX
- [ASSET_PRODUCTION.md](../../ASSET_PRODUCTION.md) — §8 иконки Арены, §24–29 форматы и анимация
- [SCREENS.md](../../SCREENS.md) — §25–41 экраны Арены, решения 30.10
- [QuRa_sprite_prompt_pack_and_figma_map_v02.md](QuRa_sprite_prompt_pack_and_figma_map_v02.md) — карта страниц Figma и формат промптов
- [Figma: QuRa · Arena и Курятник · производство графики](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg) — страницы FX01, S10, S11, AEX01, S01, S04
