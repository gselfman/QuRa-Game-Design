# QuRa Arena — интерактивный дизайн v14 · issue #28

Дата: 02.11.2026. Исполнитель: agent:design. Статус: готово к ревью владельца. Утверждение агентом не выставлялось.

## Вход в прототип

- [Страница 37_ARENA_FLOW_v14](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=359-2).
- [Начало 390×844](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3248) · [начало 360×740](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6482).
- [Обзор первых состояний](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-5662) · [обзор трёх путей вызова и исключений](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-15954).
- [Три способа вызова · 390](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14518) · [360](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15452).
- В Figma включить Present. Flow starting points заданы на странице; кнопки 390/360 в обзорных панелях открывают соответствующее состояние.
- Реальные сообщения, письма и Telegram-уведомления прототип не отправляет. Поля, имена и реплики — демонстрационные; ввод, копирование, системный share и серверные ответы представлены переходами состояний.

## Что сохранено и переиспользовано

| Материал | Есть / статус источника | Figma | Экспорт / доказательство |
| --- | --- | --- | --- |
| ARN01: сцена, лобби, зрители, пол, тени, кольцо | Есть, approved владельцем по манифесту ARN01/ARN02 | 211:107; источники 216:2–216:13 | assets/arena/arn01/ |
| ARN02: плитки 1×1/2×2/3×3, bot/live, поиск, ленты результата | Есть, approved владельцем по тому же манифесту | 211:117; исходная сетка 218:4 | assets/arena/arn02/ |
| Исходные Arena home / roster / battle | Есть, QA, прототипа в v13 не было | 302:5 / 302:84 / 302:367; доска 298:135 | assets/screens/v13/; production_v13_screens.json |
| Шесть Card и 18 поз | Есть, QA v13; ручная посадка Card владельца — эталон текущего изменения | Card: 293:461, 293:562, 293:675, 293:793, 293:913, 293:1034; доска 293:452 | assets/characters/v13/; текущая примерка — poses_owner_fit.png в этой поставке |
| 35 групп экипировки | Есть, QA | 318:209 | production_v13_equipment.json; assets/characters/v13/ |
| Цвета, текстовые стили, кнопки, шапка, меню | Есть, переиспользованы локальные переменные и компоненты QuRa | Button 298:36, ResourceHeader 298:40, BottomNav 298:54 | Страница 34; Onest / Russo One |

Подтверждение исходного approved: docs/visual/manifests/2026-11-01_arena_arn01_arn02_v01.json. Статус исходных v13 экранов и персонажей не повышен до approved. Старые страницы 26/27/34, PNG и исходные bitmap не перерисованы и не заменены.

Отдельно по предыдущей просьбе владельца: посадка одежды, сумок и головных уборов из шести Card перенесена на 12 PERCH/NEST на странице 33. Новые компоненты: C01 357:444, C02 357:548, C03 357:664, C04 357:786, C05 357:902, C06 357:1009. Оригинальные Card и старые компоненты сохранены. Сидящие лапы взяты из готового PERCH; в NEST сохранено перекрытие передним краем гнезда.

## Новые состояния и сценарии

1. Формат: 01 → 06 для 1×1. Карточки 2×2/3×3 ведут в условия 02/03, а не запускают бой. Прогресс 1/2 и 1/3; нужно ещё 1/2 курочки уровня 4. Переход к существующему магазину — ссылка на Figma 302:515, потому что он уже существует. Магазин не перерисован.
2. Командный анонс: 02 → 04 и 03 → 05. Две разные карточки «Стенка на стенку» / «Выбор цели» с командами из готовых курочек; выбранная цель отмечена готовым золотым кольцом. Запуск командного боя отключён. Для 1×1 выбора цели нет.
3. Бот: 06 → 21 → 22 → 35. Тренировка бесплатна и без награды. Бой — статическое состояние с готовыми Card и FX; действие ведёт к примеру результата, а не симулирует новый движок.
4. Подбор соперника: 06 → 23 → 24 → 14. Автопереход 23 → 24 через 2,5 секунды — только сценарный тайминг прототипа.
5. Вызов друга: 06 → 37. Три равноправные карточки: партнёры, новый друг, email.
6. Партнёры: 37 → 38. Две группы: прямые приглашённые и пригласивший меня. Мария с L4 → 09; Андрей с L3 → 46, запуск отключён. Пустые группы — 44/45. Показываются только демонстрационные имена и курочки, без email и телефонов.
7. Новый пользователь: 37 → 39 → 40/41 → 42 → 43. Тёплый текст, личная ссылка, share/copy, подтверждение отправки; затем регистрация → знакомство с Курятником → курочка уровня 4. Ссылка не создаёт бой и не открывает чат. Fallback без share — 53; ошибка получения ссылки — 54.
8. Email: 37 → 07 → 52 → 08 → 09. Единое нейтральное подтверждение запроса не раскрывает наличие аккаунта или профиль по произвольному адресу. Проверка синтаксиса адреса и ограничения выполняются сервером. Профиль появляется после согласия. Состояние 30 — ошибка отправки/повтор запроса, а не «email не зарегистрирован».
9. Уведомление: 09 → 13 → 55 → 10 → 14. 13 — предпросмотр для получателя; 55 — явное «Принять вызов» / «Отказаться». Отказ — 11; истечение — 12. Если Telegram не связан или уведомления не разрешены — 47 «Ждём входа друга», приглашение остаётся в приложении.
10. Чат: 14 до готовности; 15 после готовности; 16 компактная строка в бою → 17 шторка; 18/19/20 чат после победы/поражения/ничьей. Отправка сохраняет контекст: 14 → 36; 15 → 27; 17 → 33; результат → 34. На малом экране показана последняя реплика. 29 — ожидание реванша, с переходом назад в лобби через 3 секунды в сценарии.
11. Ограничения: 25 жалоба/блокировка → 28/26; 31 лимит сообщений; 32 выход из лобби; 48 самовызов; 49 повтор активного приглашения; 50 запрет вызова (в том числе при блокировке); 51 антиспам приглашений. Варианты ошибок и редкие серверные исходы доступны из обзорных панелей.
12. Участники лобби и чата должны быть связаны подтверждённым вызовом. Наличие ссылки, email или реферальной связи само по себе не даёт доступа.

## Контракт с разработкой

Проверены read-only docs/product/GAME_UI_V2.md, docs/AGENT_LOOP.md, CLAUDE.md, web/components/screens/Partners22.tsx, app/api/routes/partners.py.

- Текущий UI v2 описывает доступную тренировку с ботом; онлайн, друг и команды относятся к дальнейшей серверной реализации. Макеты не означают, что эти возможности уже работают.
- Существующий Partners22 получает link_url / bot_link_url из GET /partners/me. Реализация использует navigator.share и clipboard fallback. Конкретный личный адрес не выдуман и не зашит в прототип. Share-состояние показывает передачу личной ссылки в ОС; пиксельная компоновка нативного меню зависит от устройства и устанавливаемых приложений.
- Есть GET /partners/friends. Поля готовности курочки, безопасного публичного профиля, прямого пригласившего, доступности вызова и consent должны быть проверены/добавлены серверной командой. Не выводить произвольную базу пользователей или контакты.
- Сервер проверяет существование и допустимость вызова, уровень/формат, self, active duplicate, cooldown, mutual blocks; отправка идемпотентна. Нейтральный email-ответ одинаков для постороннего адреса и существующего аккаунта.
- Telegram-уведомление допустимо только для реально связанного получателя с разрешёнными уведомлениями; иначе внутри приложения.
- Доступ к лобби, чату, истории и жалобам — только авторизованным участникам подтверждённого вызова. Блокировка не должна раскрывать лишние сведения о другом игроке.
- 200 символов и 5 сообщений за 10 секунд — предлагаемое ограничение дизайна, требует продуктового/серверного подтверждения. Тайминги 1,2/2,5/3 секунды — демонстрационные переходы Figma; не реальные SLA/TTL.
- Данные здоровья, баланса, билетов, имён и готовности — примеры. Награды/ставки/ledger не реализовывались и не менялись.
- Потеря/ничья, пустые списки, ошибки и ограничения — отдельные варианты для ревью; они не все возникают по таймеру в основном happy path.
- Product implementation до утверждения владельцем не выполнялась. PR содержит только документы, манифест и PNG.

## Недостающая графика и ограничения

Блокирующей недостающей игровой графики для этих статических экранов не обнаружено. Новые иллюстрации не генерировались; используются существующие QuRa-ассеты. Нативный системный share — интерфейс ОС, а не новый игровой арт. Отдельной задачи на генерацию графики поэтому не создавалось.

Сохраняется ограничение исходных ARN01/ARN02: это рабочие растровые превью, а не нативные 4K-мастера. Проверка анимации толпы/боевого движка и реальной сетевой синхронизации не входит в статический дизайн. Переходы проверены по карте реакций Figma; реальный многопользовательский backend, clipboard, share и доставка уведомлений не тестировались.

## Проверка

- 55 состояний × 2 размера = 110 редактируемых макетов.
- 278 реакций/переходов на экранах; отдельные обзорные панели дают прямой доступ к исключениям.
- Нет найденных неверных целей переходов и переполнений auto-layout.
- Шрифты — только Onest и Russo One.
- Кнопки недоступных команд и неготового партнёра не имеют реакций запуска.
- Просмотрены PNG обоих размеров, исправлены переносы и границы спрайтов.
- 16 PNG-листов со всеми состояниями плюс PNG текущей примерки 18 поз. Хеши и состав — в манифесте.
- Утверждение новых экранов и продуктовых лимитов остаётся за владельцем.

## Каждый экран

| Состояние | 390×844 | 360×740 |
| --- | --- | --- |
| 01-format · Арена | [360:3248](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3248) | [360:6482](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6482) |
| 02-lock2 · Две против двух | [360:3342](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3342) | [360:6576](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6576) |
| 03-lock3 · Три против трёх | [360:3388](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3388) | [360:6622](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6622) |
| 04-types2 · Тип боя · 2×2 | [360:3434](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3434) | [360:6668](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6668) |
| 05-types3 · Тип боя · 3×3 | [360:3485](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3485) | [360:6719](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6719) |
| 06-launch · Одна против одной | [360:3536](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3536) | [360:6770](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6770) |
| 07-email · Вызвать друга | [360:3592](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3592) | [360:6826](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6826) |
| 08-found · Запрос отправлен | [360:3676](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3676) | [360:6910](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6910) |
| 09-waiting · Приглашение отправлено | [360:3765](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3765) | [360:6999](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6999) |
| 10-accepted · Приглашение принято | [360:3888](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-3888) | [360:7122](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7122) |
| 11-declined · Друг отказался | [360:4011](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4011) | [360:7245](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7245) |
| 12-expired · Время вышло | [360:4134](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4134) | [360:7368](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7368) |
| 13-telegram · Приглашение в QuRa | [360:4257](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4257) | [360:7491](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7491) |
| 14-lobby · Лобби · 1×1 | [360:4377](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4377) | [360:7611](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7611) |
| 15-ready · Все готовы | [360:4515](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4515) | [360:7744](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7744) |
| 16-battle · Дружеский бой | [360:4653](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4653) | [360:7877](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-7877) |
| 17-battle-chat · Дружеский бой | [360:4796](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4796) | [360:8020](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8020) |
| 18-win · Результат боя | [360:4958](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-4958) | [360:8182](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8182) |
| 19-loss · Результат боя | [360:5094](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5094) | [360:8315](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8315) |
| 20-draw · Результат боя | [360:5230](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5230) | [360:8448](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8448) |
| 21-bot-roster · Тренировка с ботом | [360:5366](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5366) | [360:8581](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8581) |
| 22-bot-battle · Тренировка | [360:5442](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5442) | [360:8657](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8657) |
| 23-search · Ищем соперника | [360:5581](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5581) | [360:8796](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8796) |
| 24-match · Соперник найден | [360:5622](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5622) | [360:8837](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8837) |
| 25-safety · Настройки чата | [360:5663](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5663) | [360:8878](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8878) |
| 26-blocked · Лобби · 1×1 | [360:5712](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5712) | [360:8927](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-8927) |
| 27-sent · Лобби · 1×1 | [360:5839](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5839) | [360:9054](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-9054) |
| 28-report · Жалоба отправлена | [360:5977](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-5977) | [360:9187](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-9187) |
| 29-rematch · Реванш | [360:6017](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6017) | [360:9227](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-9227) |
| 30-not-found · Повторите запрос | [360:6140](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6140) | [360:9350](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-9350) |
| 31-chat-limit · Чат боя | [360:6224](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6224) | [360:9434](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-9434) |
| 32-left · Друг покинул лобби | [360:6359](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-6359) | [360:9569](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=360-9569) |
| 33-battle-sent · Сообщение в бою отправлено | [365:6004](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6004) | [365:6573](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6573) |
| 34-result-sent · Сообщение после боя отправлено | [365:6165](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6165) | [365:6734](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6734) |
| 35-bot-result · Результат тренировки | [365:6300](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6300) | [365:6866](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6866) |
| 36-lobby-sent · Сообщение в лобби отправлено | [365:6436](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6436) | [365:6999](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=365-6999) |
| 37-friend-methods · Вызвать друга | [385:14518](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14518) | [386:15452](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15452) |
| 38-partners · Ваши партнёры | [385:14613](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14613) | [386:15547](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15547) |
| 39-invite-new · Новый друг в QuRa | [385:14748](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14748) | [386:15682](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15682) |
| 40-share-sheet · Поделиться | [385:14839](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14839) | [386:15773](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15773) |
| 41-link-copied · Ссылка скопирована | [385:14916](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14916) | [386:15850](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15850) |
| 42-link-sent · Друг приглашён | [385:14999](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-14999) | [386:15933](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-15933) |
| 43-new-onboarding · Друг осваивается | [385:15082](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15082) | [386:16016](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16016) |
| 44-partners-empty · Приглашённые мной | [385:15165](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15165) | [386:16099](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16099) |
| 45-referrer-empty · Кто пригласил меня | [385:15241](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15241) | [386:16175](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16175) |
| 46-partner-notready · Пока рано на Арену | [385:15317](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15317) | [386:16251](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16251) |
| 47-no-telegram · Ждём входа друга | [385:15399](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15399) | [386:16333](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16333) |
| 48-self-invite · Это ваш аккаунт | [385:15442](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15442) | [386:16376](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16376) |
| 49-duplicate · Приглашение уже есть | [385:15485](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15485) | [386:16419](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16419) |
| 50-blocked-invite · Вызов недоступен | [385:15528](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15528) | [386:16462](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16462) |
| 51-invite-limit · Небольшая пауза | [385:15571](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15571) | [386:16505](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16505) |
| 52-email-sending · Отправляем запрос | [385:15614](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15614) | [386:16548](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16548) |
| 53-share-fallback · Поделитесь ссылкой | [385:15655](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15655) | [386:16589](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16589) |
| 54-link-error · Ссылка недоступна | [385:15731](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=385-15731) | [386:16665](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=386-16665) |
| 55-incoming · Принять входящий вызов | [391:17426](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=391-17426) | [391:17551](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=391-17551) |

## PNG-превью

- [390px · лист 1](../../assets/screens/arena_flow_v14/arena_390_1.png) — [Figma 366:5957](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-5957)
- [390px · лист 2](../../assets/screens/arena_flow_v14/arena_390_2.png) — [Figma 366:6486](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-6486)
- [390px · лист 3](../../assets/screens/arena_flow_v14/arena_390_3.png) — [Figma 366:7529](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-7529)
- [390px · лист 4](../../assets/screens/arena_flow_v14/arena_390_4.png) — [Figma 366:8408](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-8408)
- [390px · лист 5](../../assets/screens/arena_flow_v14/arena_390_5.png) — [Figma 366:9239](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-9239)
- [390px · лист 6](../../assets/screens/arena_flow_v14/arena_390_6.png) — [Figma 389:16105](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-16105)
- [390px · лист 7](../../assets/screens/arena_flow_v14/arena_390_7.png) — [Figma 389:16677](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-16677)
- [390px · лист 8](../../assets/screens/arena_flow_v14/arena_390_8.png) — [Figma 389:17090](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-17090)
- [360px · лист 1](../../assets/screens/arena_flow_v14/arena_360_1.png) — [Figma 366:9803](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-9803)
- [360px · лист 2](../../assets/screens/arena_flow_v14/arena_360_2.png) — [Figma 366:10332](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-10332)
- [360px · лист 3](../../assets/screens/arena_flow_v14/arena_360_3.png) — [Figma 366:11365](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-11365)
- [360px · лист 4](../../assets/screens/arena_flow_v14/arena_360_4.png) — [Figma 366:12235](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-12235)
- [360px · лист 5](../../assets/screens/arena_flow_v14/arena_360_5.png) — [Figma 366:13061](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=366-13061)
- [360px · лист 6](../../assets/screens/arena_flow_v14/arena_360_6.png) — [Figma 389:17389](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-17389)
- [360px · лист 7](../../assets/screens/arena_flow_v14/arena_360_7.png) — [Figma 389:17919](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-17919)
- [360px · лист 8](../../assets/screens/arena_flow_v14/arena_360_8.png) — [Figma 389:18332](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg?node-id=389-18332)

- [Примерка Card / PERCH / NEST](../../assets/screens/arena_flow_v14/poses_owner_fit.png).
