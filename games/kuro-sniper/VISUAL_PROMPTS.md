# Промпты и задания на производство визуала

> Дополнение v0.2 от 15.11.2026: [текущие решения, реализованное и оставшееся](VISUAL_AUDIO_V02.md). Оно заменяет прежние значения воды, расположение кнопок, оружие второй дистанции и добавляет десятый уровень.
## Готовые наборы

- `data/screen-prompts.json`: **18 самостоятельных полных промптов** — обычный вид и прицел для каждого из девяти уровней.
- `data/asset-prompts.json`: **29 заданий** — пять героинь, девять комплектов оружия, девять окружений, пять эффектов и один editable UI-kit.
- `data/animation-events.json`: обязательные клипы и timing контакта/спуска.

Всего 47 текстовых заданий. Они подготовлены для будущего производства, не означают, что 47 ассетов уже созданы. Каждый JSON `prompt` можно копировать целиком. Character/model briefs адресованы агенту, управляющему Blender; генератор растровых картинок создаёт только концепт и референсы, а не skeletal GLB.

## Обязательные входы

Для любого видимого персонажа приложить реальный экспорт соответствующего Figma-компонента из `data/asset-sources.json`. Название файла в промпте не прикрепляет изображение автоматически. Добавить пару front/3⁄4 при наличии утверждённых ракурсов; не выдавать сгенерированный обратный ракурс за утверждённый. Если нет референса, можно продолжать окружение/предметы, но не придумывать новую курочку.

В референсах экранов обязательно сохранять парность: та же локация, камера, положения стоек и персонажи до/после ADS. Для screen-prompt scoped-версии позднего уровня указан максимальный штатный zoom, чтобы показать читаемость небольшой цели. Камера мира остаётся прежней. Во всех спокойных демонстрациях центр сетки на диске под платформой; во время ветра или движения допускается осмысленная поправка, но не попадание в тело.

## Изображения и работающие ассеты — разные поставки

| Задание | Допустимый концепт | Что требуется для игры |
|---|---|---|
| Персонаж | Референс ракурсов с канонической внешностью | Реальный mesh/rig/GLB и клипы |
| Оружие | Изолированные side/3⁄4 виды | Детали, sockets, viewmodel-анимация |
| Окружение | Чистый plate без HUD | Модульная геометрия, материалы, свет, colliders |
| Эффект | Прозрачные элементы/ключевые фазы | Particle/shader setup, timing и pools |
| HUD | Визуальная композиция | Editable text/components, SVG, строки и responsive layout |

Не пытаться сделать всю игру одним AI-видео. Игрок должен свободно наводиться, а капсула — попадать в движущуюся цель. Последовательность картинок не обеспечивает коллизии, синхронную оптику и управление.

## Самостоятельное задание на первый клип

```text
PROJECT: QuRa / QuRa / Кура. JOB: KS-ANIM-C01-DROP-v001.
INPUTS: exact canonical Ryaba reference from Figma pTm5JOM8r7b8ukBrk3UsXg node357:444; accepted pilot Ryaba.blend; rigVersion; hinged platform model and landing marker. If the accepted rig is missing, report that dependency; do not replace Ryaba with another bird.
TASK: use Blender Python to create the 1.5-second successful-target reaction and export actual animation clips. Preserve all character anatomy, face, feather markings, accessory fit and fixed proportions. At contact0ms gameplay confirms target; latch40ms; platform folds60–220ms; surprised reaction100–260ms; wings/root controlled descent220–700ms; feet contact650–950ms; indignant recovery950–1500ms then ground idle/peck. No injuries, death or uncontrolled ragdoll. Root follows a parameterized landing arc; no foot sliding at contact. Secondary tail/comb motion settles smoothly.
OUTPUT: source blend, GLB with named clips platform_surprise/drop_flap/land_soft/recover_indignant; JSON event markers; front/three-quarter preview renders and keyframe contact sheet. Author at30fps, interpolate in60fps runtime. Report actual clip durations, skeleton, texture paths and warnings. Do not claim animated GLB from an MP4 or sprite preview. Save a new version, never overwrite accepted source.
```

## Самостоятельное задание на корректную оптику

```text
PROJECT: QuRa / QuRa / Кура. JOB: KS-OPTICS-PILOT-v001.
Create a test scene in TypeScript/Babylon.js with one world simulation, a fixed-FOV main camera, a separate narrow-FOV scope camera rendering to texture, a round lens mask, and a HUD rendered once on top. Scope pass excludes weapon, HUD, lens surface and player-local effects. Only the lens interior is magnified. All objects outside lens retain normal distant scale. Every object inside lens uses the same camera perspective. Reticle is at lens center, never shifted toward a bird. The target is a separate disk BELOW the canonical hen platform.
Calibrate magnification in actual screen pixels, accounting for lens diameter and render-target compositing, per CAMERA_AND_AIM.md. Add a frozen simulation fixture with test disks and demonstrate peripheral pixel-scale invariance, correct magnification±5%, centered reticle±1px, and valid hit direction on each configured distance. Render both camera passes from the same animation snapshot. Supply measured screenshots and mobile frame-time results; do not fake magnification by scaling the entire canvas or selected hen.
```

## Контроль после каждой генерации

Проверить число объектов, фактическую ориентацию/разрешение, прозрачность, сходство, читаемость, отсутствие baked HUD/text, парность камеры и корректное место мишени. Сохранить полный prompt, reference IDs, revision, output filename и статус review. Если генератор ошибся с масштабом/лицом/пальцами/оптикой, сделать адресное исправление; не выдавать ошибку за художественный приём.
