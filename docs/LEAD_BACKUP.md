# AB/digital: резервная доставка заявок

**Состояние:** код подготовлен, но Cloudflare Worker ещё НЕ развёрнут. Пока значения в `site/assets/leads-config.js` пустые, сайт по-прежнему отправляет только в Formspree. Добавлен альтернативный ручной путь через Telegram.

## Механика после включения

1. Один submit отправляет данные в Formspree и Cloudflare Worker независимо друг от друга.
2. Worker проверяет Turnstile и сначала сохраняет данные в Cloudflare D1, затем уведомляет Telegram-бота.
3. Если Telegram недоступен, заявка остаётся в D1, cron повторяет доставку каждые 5 минут с экспоненциальной задержкой (до 6 часов).
4. В D1 заявки хранятся до 90 дней, затем удаляются по расписанию. У Formspree, Telegram и бэкапов Cloudflare могут быть другие сроки.
5. При неуспехе обоих каналов форма не очищается. Альтернативная кнопка открывает чат Telegram и копирует текст заявки в буфер обмена; клиент вставляет и отправляет сообщение самостоятельно.

## Подключение Cloudflare

1. Создать отдельного бота через Telegram @BotFather. Написать новому боту /start. Узнать собственный numeric Telegram chat ID, например через @userinfobot.
2. В Cloudflare Turnstile создать Managed widget для `ab-digital.onrender.com`. Сохранить публичный sitekey и приватный secret.
3. Создать D1 database с именем `ab-digital-leads`, скопировать Database ID.
4. В файле `workers/leads/wrangler.jsonc` подставить D1 Database ID вместо `REPLACE_WITH_D1_DATABASE_ID`. Из каталога `workers/leads` выполнить:

```bash
npm install
npx wrangler login
npx wrangler d1 migrations apply ab-digital-leads --remote
npx wrangler deploy
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler secret put TURNSTILE_SECRET
```

5. Проверить Worker /health, базу D1 и получение Telegram-сообщения (секреты не публиковать!).
6. Обновить политику персональных данных и согласие на сайте: Cloudflare D1, Formspree, Telegram, UTM-метки, трансграничная передача и сроки обработки — до включения резервной отправки.
7. Только после проверки указать **публичные** URL Worker и Turnstile sitekey в `site/assets/leads-config.js` и обновить Render.

**Никогда не помещать секрет BotFather, CHAT_ID или Turnstile Secret в клиентский JavaScript, GitHub или переписку.** Они должны быть в Cloudflare Worker Secrets. Запросы проверяются через Turnstile Siteverify; Origin недостаточен как самостоятельная защита. При большом трафике дополнительно включить rate limiting.

## До подключения

Formspree продолжает работать без изменений в серверной конфигурации. Публичный Worker ещё не принимает обращения, Telegram-уведомления и D1-архивирование НЕ активированы. Нельзя считать, что заявки уже автоматически дублируются.
