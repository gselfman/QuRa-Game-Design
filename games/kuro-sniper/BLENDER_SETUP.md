# Blender — установка и проверка автоматизации

Дата: 15.11.2026, Москва. Установлена стабильная **Blender 5.3.0**, Release `02f0899d78e3`, нативная архитектура Apple Silicon arm64. Установка через официальный Homebrew cask `blender` с ARM Homebrew `/opt/homebrew/bin/brew`.

Приложение: `/Applications/Blender.app`. Исполняемый файл: `/Applications/Blender.app/Contents/MacOS/Blender`. Команда терминала: `/opt/homebrew/bin/blender`. macOS: проверка подписи пройдена, Gatekeeper `accepted`, источник `Notarized Developer ID`. Защита macOS не отключалась.

## Что реально проверено

- Запуск Blender из командной строки без ручной работы в интерфейсе.
- Выполнение Python через `bpy`, создание геометрии/материала/ключей анимации.
- Сохранение реального `.blend`.
- Рендер кадра 512×512 через Cycles CPU.
- Экспорт glTF 2.0 `.glb`: один mesh, одна анимация, канал rotation.
- Обратный импорт GLB и проверка движения между кадрами 1 и 30: изменение поворота около 34.38°.
- Рендер кадра 512×512 через **EEVEE на GPU, backend METAL**, с повторной успешной проверкой экспорта/импорта анимации.
- Сохранены настройки: графический backend Metal; Cycles остаётся на проверенном CPU-пути. Остальные существующие предпочтения при повторной настройке сохраняются.

Машиночитаемые результаты: [blender-environment.json](data/blender-environment.json).

Это проверка установленного инструментария на диагностическом кубе. Она не является производством игровых курочек и не доказывает качество будущего rig/анимаций или FPS мобильной игры.

## Команды для дальнейшей работы

Из корня репозитория:

```sh
bash games/kuro-sniper/tools/blender.sh --version
bash games/kuro-sniper/tools/blender.sh --background --factory-startup --python-exit-code 1 --python games/kuro-sniper/tools/blender_probe.py -- --output /tmp/kuro-sniper-blender-probe
```

Быстрый GPU-тест EEVEE:

```sh
bash games/kuro-sniper/tools/blender.sh --background --factory-startup --python-exit-code 1 --python games/kuro-sniper/tools/blender_probe.py -- --output /tmp/kuro-sniper-blender-eevee --engine BLENDER_EEVEE
```

Повторная установка проверенного рабочего профиля с сохранением остальных предпочтений:

```sh
bash games/kuro-sniper/tools/blender.sh --background --factory-startup --python-exit-code 1 --python games/kuro-sniper/tools/configure_blender.py
```

Опциональная проверка **Cycles** на Metal с сохранением настроек только после успешного рендера:

```sh
bash games/kuro-sniper/tools/blender.sh --background --factory-startup --python-exit-code 1 --python games/kuro-sniper/tools/blender_metal_check.py -- --output /tmp/kuro-sniper-blender-metal --save-preferences
```

`blender.sh` автоматически находит приложение и позволяет задать другую проверенную установку через `BLENDER_BIN`. Это устраняет зависимость от того, какой Homebrew первым стоит в PATH. Пароль/API-ключ, внешний MCP-сервер и открытый сетевой порт для управления не требуются.

## GPU для производственного скрипта

Для быстрых превью выбирать `scene.render.engine='BLENDER_EEVEE'`: этот режим с Metal реально прошёл тест. Cycles CPU также проверен. Первый FULL-тест Cycles/GPU был остановлен после более восьми минут компиляции без кадра; облегчённый OFF-тест тоже остановлен без результата. Это не считается PASS и не доказывает невозможность Cycles на GPU. У Blender есть [сообщение о замедленной компиляции Metal в 5.3](https://projects.blender.org/blender/blender/issues/166491); оно может объяснять наблюдение, но точная причина в этом сеансе не установлена.

Если отдельно проводить повторный Cycles/GPU-тест, в конкретной сцене выбирать его явно:

```python
preferences = bpy.context.preferences.addons['cycles'].preferences
preferences.compute_device_type = 'METAL'
preferences.get_devices()
for device in preferences.devices:
    device.use = device.type == 'METAL'
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
```

Перед рендером проверить наличие enabled Metal device; при отсутствии вывести понятную ошибку или явно выбранный CPU fallback. Не считать сохранённые user preferences гарантией выбора GPU в `--factory-startup`. Первый Metal-рендер может долго компилировать шейдеры; последующие задания используют системный cache. Не выполнять очистку этого cache как обычный подготовительный шаг.

## Артефакты текущей проверки

В рабочем каталоге QuRa: `output/blender-check/` содержит CPU-проверку — `probe.blend`, `probe.glb`, `probe.png`, `probe-report.json`. Каталог `output/blender-eevee-check/` содержит такую же успешную проверку через EEVEE/Metal. Cycles-GPU-файлы `metal-probe.png` и `metal-report.json` не созданы: эти тесты не завершили рендер. В репозиторий включён небольшой environment report; диагностические модели не подмешиваются к игровым ассетам.

Для новой модели агент получает canonical source, версию rig, длительности и события клипа, затем создаёт/изменяет `.blend` через Python и возвращает GLB, preview и отчёт. Подробный производственный процесс: [AI_PRODUCTION_RUNBOOK.md](AI_PRODUCTION_RUNBOOK.md).
