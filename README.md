# AB/digital + Latina Solo by Sabina — preview website

An **actual responsive static website** with **zero package dependencies**. This is the public-preview-ready implementation of a personal IT/development business and an online Latin-dance course sales funnel. It does not collect payments or user details until merchant approval.

## Pages

- `/` — IT developer / digital studio portfolio: services, current project, workflow, contact.
- `/courses/sabina/` — elegant course landing with the confirmed six-stage Latina Solo program and three provisional packages.
- `/courses/sabina/checkout/?plan=self` (also `feedback` and `personal`) — interactive tariff-selection checkout preview, explicitly no payment collection.
- `/legal/offer/`, `/legal/privacy/`, `/legal/refunds/`, `/legal/payment/` — clearly labeled legal drafts pending real owner details and legal review.

## Local preview

```bash
cd site
python3 -m http.server 8080
```

Open http://localhost:8080/. No Node, Vite, or npm install is needed. All pages use directory index files so deep links work on Cloudflare Pages without SPA rewrites.

## Deploy to Cloudflare Pages (free **preview**)

1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git.
2. Authorize GitHub repo `ArtemBalakin/course` and pick branch `develop`.
3. Build command: **none** (leave empty); build output directory: **`site`** (no leading slash).
4. Deploy and use the assigned `*.pages.dev` HTTPS URL. Deploys from GitHub are automatic.
5. Do not enable payments yet. This is the development/demo environment.

**Important:** Freedom Pay's merchant terms for Kazakhstan specify that the production merchant site must not use free hosting. This Cloudflare Pages free deployment is for preview, not a representation of Freedom Pay approval or go-live readiness. Confirm production domain/hosting and site structure with Freedom Pay.

**GitHub Pages is not appropriate for the commercial version of this site** under GitHub's prohibited online-business hosting uses. Cloudflare Pages allows free previews, but commercial-merchant hosting requirements apply separately.

## Required before public sales

- Replace all example lesson titles/content with confirmed, true program information.
- Add real video/photos from Sabina with her permission, confirmed teaching credentials if presented.
- Approve actual tariff prices in KZT, deliverables, duration/access term, homework/support service levels.
- Confirm seller IP legal name, BIN/IIN, address, support contacts, sign off legally complete offer, privacy policy, refund and payment/delivery rules. Remove `noindex` and `robots.txt` block only when approved and appropriate.
- Confirm Freedom Pay permits this seller arrangement for courses created/licensed from Sabina.
- Provide backend order creation, verified signed Freedom Pay webhook, fiscal receipt, and Telegram bot access grants; never expose merchant secret in browser JavaScript. Add privacy/consent before personal data collection.
- Confirm Kazakhstani compliance with counsel/accountant.

## Hosting cost

Static previews can run free. Any payment/fulfillment backend and production merchant-accepted hosting may incur costs. No credentials are committed.


## Course content (12 October 2026)

**Only one program is offered:** Latina Solo by Sabina, in six sequential stages: introduction, body technique, basic Latina Solo movements, choreography, visual expression and confidence, final rehearsal. Full descriptions are visible at `/courses/sabina/#program`. Tariffs, pricing and video durations remain provisional, and payments stay disabled. The React/Vite `src/` prototype is not deployed; Render serves the static `site/` directory from `develop`.

## Course-card interaction (October 2026)

Six program cards explicitly show "Подробнее об этапе" and open an accessible native HTML dialog with the stage's content (stored in non-rendering templates). This replaces the repeated six-block description and the unclear :target highlighting. Supports Escape, focus handling, backdrop close, mobile scrolling and CTA to tariffs.

## Scalable program navigation (October 2026)

Inside the lesson dialog, `Назад` and `Далее`, Left/Right arrow keys and a dynamically populated "Быстрый переход" select allow browsing 6 or 20+ stages without repeatedly closing and reopening cards. First/last arrows are disabled at bounds and the progress indicator is announced to assistive technologies. Card layout uses three CSS Grid rows (index, decorative numeral, text/CTA), preventing number/text overlap on desktop and phones.


## AB/digital portfolio — Telegram Mini Apps (October 2026)

The AB/digital home page now includes two additional portfolio cases: [Reminder Bot](https://github.com/ArtemBalakin/reminderBot) and [Salon Booking Bot](https://github.com/ArtemBalakin/salon-booking-bot/tree/feature/miniapp-showcase). Each has four original full-height UI preview images in `site/assets/portfolio/*.webp` (optimized 500px-wide WebP). The Reminder preview images use the real cat illustrations from the source repository; all task names and booking values in the shots are illustrative. A keyboard-accessible modal switches between screenshots and links back to the correct GitHub branch. These are static previews, not connected live Telegram sessions.


## Portfolio copy and corporate platforms (14 October 2026)

The AB/digital homepage now has concrete descriptions of Java backend, websites and Telegram Mini Apps. The corporate-platform section links to [N3](https://n3corp.ru/) (enterprise health management) and [iSpace](https://ispace-platform.ru/) (ECM/BPM/document processes). It describes their publicly documented capabilities without claiming that AB/digital implemented the entire platforms.

The Sabina landing now contains the instructor information supplied by the content owner: Sabina Azizova, Kazakhstan Master of Sports, seven-time national champion, World Championship semifinalist, international dance practice and experience teaching Latina Solo to women's groups. An outcome section describes body control, basic rumba technique, music, choreography, plasticity and confident expression. The existing six-stage curriculum text is preserved until the course owner confirms how its 'dance selection' stage relates to the promised rumba-specific outcome. Pricing and payment remain inactive. The production photography and independently verified award details should be supplied before commercial publication.

The Render Blueprint service is renamed to `ab-digital-preview` (the portfolio-wide identity) rather than tying the whole studio to one course. The old public preview can remain separately reachable for historical links until it is retired.
