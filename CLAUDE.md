# AB/digital — сайт ab-digital.kz

Статический сайт студии AB/digital и страницы курса Latina Solo by Sabina (RU + KK). Владелец — ИП «БАЛАКИН».

## Сервер

- VPS HostLab, Ubuntu 24.04, `root@206.223.245.252`, доступ по SSH-ключу (`ssh -o BatchMode=yes`). Пароли и ключи не хранить в репозитории.
- nginx + Let's Encrypt (сертификат ab-digital.kz). Конфиг сайта: `/etc/nginx/sites-enabled/ab-digital`, внутрь подключён `/opt/sabina-course-bot/deploy/nginx-coursebot.conf`.
- Что работает на сервере:
  - сайт: `/opt/ab-digital` (git, ветка `develop`) → `/var/www/ab-digital`;
  - Telegram-бот курса: `/opt/sabina-course-bot` (Spring Boot + PostgreSQL в Docker, контейнеры `deploy-app-1`, `deploy-postgres-1`, порт 127.0.0.1:8090). Репозиторий бота: `E:\proj\sabina-course-bot`, ветка `initial-import`;
  - приём заявок с формы: `services/leads` (Node.js + SQLite в Docker, порт 127.0.0.1:8091), секреты и база в `/opt/ab-digital-leads`;
  - чужое приложение `speakup-chinese-bot` (контейнеры `speakup-*`) — не трогать.
- Наружу через nginx проксируются только `/api/telegram/webhook`, `/api/payments/webhook/`, `/api/site/`, `/mock-pay/`, `/api/lead`.
- Памяти около 3,7 ГБ на три приложения — тяжёлые сборки не запускать параллельно.

## Деплой сайта

1. Правки в `site/`, коммит и `git push origin develop`.
2. `ssh root@206.223.245.252 /opt/ab-digital/deploy-site.sh` (fetch + ff-only pull, rsync `site/` в `/var/www/ab-digital`, `nginx -t`, reload). Скрипт не деплоит при локальных правках на сервере.
3. После правок CSS/JS поднять версию в `?v=` у подключений, иначе браузеры покажут кэш.

## Заявки с формы

- Главная собирается из `scripts/templates/home.ru.html` командой `node scripts/generate-locales.mjs`, словари — `scripts/i18n/{en,kk}.json`.
- Форма шлёт заявки на `/api/lead`, устройство и запуск сервиса описаны в `docs/LEADS.md`. Заявки не отсеивать по содержанию и не удалять автоматически.
- `deploy-site.sh` сервис не перезапускает: после правок в `services/leads` выполнить там `docker compose up -d --build`.

## Страницы курса и казахская версия

- RU-страницы правятся руками: `site/courses/sabina/**`.
- KK-страницы не править руками: `node scripts/generate-sabina-locales.mjs` строит `site/kk/courses/sabina/**` по словарю `scripts/i18n/sabina-kk.json` (ключ — точная русская фраза). Без перевода сборка падает; список — `--missing`.
- Казахская типографика: `site/assets/sabina-kk-font.css` (Noto Serif Display + Inter с точными весами). Не добавлять cyrillic-ext @font-face в RU-стили.
- Тарифы и тексты должны совпадать с ботом: 12 уроков, 4 модуля, SELF DANCE 12 990 ₸, DANCE WITH ME 19 990 ₸, VIP LATINA 39 990 ₸.

## Оплата

- Кнопка «Оплатить» (`/courses/sabina/checkout/`) вызывает `POST /api/site/checkout` бота, получает ссылку FreedomPay и переводит на неё. После оплаты — `/courses/sabina/checkout/result/`, откуда кнопка ведёт в бота (`?start=claim_<заказ>`) для выдачи доступа.
- Документы: `site/courses/sabina/legal/*` (оферта, конфиденциальность, возвраты, оплата, согласия). Правовые ссылки проверены по adilet.zan.kz (ГК РК 387/395/396/686; Закон 274-IV ст. 14, 42-4; Закон 94-V ст. 8, 16).

## Правила работы

- Не печатать токены и ключи (бот, Freedom). Файл `.env` на сервере — `chmod 600`.
- Не менять DNS, Render и настройки GitHub без прямой просьбы.
- Перед необратимыми или внешними действиями (удаление, возвраты, массовые рассылки) спрашивать.
