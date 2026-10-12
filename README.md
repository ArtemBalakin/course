# SABINA — Latin dance website

Responsive React + Vite landing page for Sabina's online Latin dance classes.

## Development
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
```

Cloudflare Pages: framework preset Vite, build command `npm run build`, output directory `dist`, production branch `develop`.

## Telegram integration
Set `VITE_TELEGRAM_BOT_URL=https://t.me/your_bot` in Cloudflare Pages environment variables. Rebuild after changing variables. The course buttons open `start=site_01` ... `start=site_08`. Your bot must process these deep-link payloads.

## Important notes
Lesson names and copy are placeholders; replace with confirmed course descriptions, images/videos, pricing, seller identity, and legal documents before onboarding Freedom Pay. No payment functionality is wired. Never commit Freedom Pay Merchant Key/secret to GitHub, and never include them in `VITE_*` variables. Payment creation, callback signature verification, and course access belong on a secure backend.

Freedom Pay official onboarding: https://freedompay.kz/largebusiness/anketa
API documentation: https://docs.freedompay.kz/
