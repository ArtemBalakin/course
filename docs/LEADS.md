# Заявки с формы AB/digital

Форма на главной (RU/EN/KK) отправляет заявку на `POST /api/lead`. Его обслуживает отдельный сервис `services/leads`: Node.js без зависимостей, SQLite, Docker. С ботом курса он не связан.

## Как проходит заявка

1. nginx передаёт запрос на `127.0.0.1:8091`.
2. Сервис сохраняет заявку в SQLite и отвечает форме. Форма показывает успех только после записи в базу.
3. Заявка уходит в Telegram и на почту через Resend. Каналы независимы: упавший канал повторяется с паузой от 1 минуты до 6 часов, пока не получится.
4. Если сервис недоступен, данные остаются в форме, а кнопка «Отправить копию через Telegram» открывает чат и копирует текст.

## Спам

Фильтра по содержанию нет, и заявки не удаляются автоматически.

- **Скрытое поле `company_site`:** заявка приходит с пометкой «возможно, спам».
- **Больше 10 заявок за 10 минут с одного IP:** заявки сохраняются, а в Telegram приходит одна сводка.
- **Больше 60 заявок за 10 минут с одного IP:** запрос отклоняется, данные остаются в форме. Лимит защищает диск от флуда.

## Первый запуск

Ключи и токены не отправлять в чат и не хранить в репозитории.

1. Создать бота в @BotFather и написать ему `/start`. Узнать свой числовой chat id, например через @userinfobot.
2. Подключить домен в Resend, добавить его DNS-записи и дождаться статуса Verified. Создать API-ключ только с правом Sending access.
3. На сервере подготовить каталог и заполнить `.env`:

```bash
mkdir -p /opt/ab-digital-leads/data
chown 1000:1000 /opt/ab-digital-leads/data
cp /opt/ab-digital/services/leads/.env.example /opt/ab-digital-leads/.env
chmod 600 /opt/ab-digital-leads/.env
```

4. Запустить сервис и проверить `/health`: `telegram` и `email` должны быть `true`.

```bash
cd /opt/ab-digital/services/leads && docker compose up -d --build
curl -s http://127.0.0.1:8091/health
```

5. В `server` сайта в `/etc/nginx/sites-enabled/ab-digital` добавить строку, затем выполнить `nginx -t` и `systemctl reload nginx`:

```nginx
include /opt/ab-digital/deploy/nginx-leads.conf;
```

Форма переключается деплоем сайта, поэтому выкладывать сайт нужно после этих шагов. Иначе заявки будут падать в ошибку.

## Обслуживание

- Посмотреть заявки: `cd /opt/ab-digital/services/leads && docker compose exec leads node src/list.js 20`.
- Обновить сервис после изменений: `docker compose up -d --build` в этом же каталоге. `deploy-site.sh` сервис не перезапускает.
- База: `/opt/ab-digital-leads/data/leads.sqlite`. В ней персональные данные, в репозиторий и чат её не копировать.
- Тесты: `cd services/leads && npm test`.
