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

## Studio services & proven experience (14 October 2026)

The homepage now consistently uses a team **we** voice and features a three editorial service rows (Telegram Mini Apps, Telegram bots, web/backend), two inline Mini App cases, five steps of delivery, and concrete links to our project previews. Corporate cards identify our participation in development of N3 and iSpace without claiming to own or have delivered the complete products. Removed non-clickable decorative top-right arrows; official platform links remain active at the bottom. No invented prices, delivery estimates, or client outcomes.


## Inline Telegram case studies (14 October 2026)

The `/#solutions` section was redesigned to use AB/digital's own dark navy / lime visual language, not a generic reference card layout. Salon Booking and Reminder Bot now have direct, full-height image previews **inside** their problem/solution case studies; clicking either preview or “Смотреть 4 экрана” opens the existing accessible gallery **without scrolling to another block**. The redundant duplicate gallery cards were removed from `/#works`, where the separately developed Latina Solo project remains. The modal and all eight optimized image files remain unchanged and functional. The case claims stay grounded in the implemented UI, and no real appointments or reminders are created.


## Studio layout refresh (14 October 2026)

Refactored the homepage to remove reference-derived equal service-card and process-card grids. The original AB/digital identity drives the new sections:
- `#services`: asymmetric studio panel with the AB/digital motif alongside three editorial capability rows, with direct links to live visual examples.
- `#process`: a single connected five-step timeline with a typographic introduction rather than five standalone cards.
- `#solutions`: existing inline Reminder and Salon Mini App screen previews and their accessible four-screen gallery remain immediately accessible, no duplicate gallery further down.
- Dedicated `site/assets/studio.css` loads **only on the studio homepage** and does not alter the Latina Solo landing.
- Removed the reference-based service/process CSS overrides from `site/assets/site.css`. Tested new sections at 1440px and 390px with headless Chromium, with no horizontal overflow (local archived-base visual preview); production browser check still required.

The layout was designed around the site's existing Manrope + Playfair typography, lime accent and navy/cream palette; there are no invented prices, timelines or client statistics.


## Design polish (2026-10-14)

Refreshed both homepage stylesheet URLs with an explicit version query to avoid stale cached styling. Normalized AB/digital heading accents to Manrope, strengthened the five-stage process as a connected vertical flow with visible arrows and continuous track (desktop and mobile), and added gentle orbit/card/letter motion to the hero. All animations respect `prefers-reduced-motion`. No business claims, course content, payments, or Mini App functionality were changed.


## Public-facing homepage revisions (Oct 14, 2026)

Improved reading contrast and body type across the homepage and course, simplified the three service descriptions for non-technical clients and added design/Tilda/other site builders. Replaced the generic N3/iSpace boxes with differently composed cards themed to their public websites and linked to public-page screenshots via WordPress mShots (third-party-generated, may change/temporarily be unavailable). Reframed process copy with explicit agreed milestones and timeframes; layered timeline behind numbered circles. Direct Telegram/WhatsApp buttons are not yet included because no confirmed personal contact handles have been supplied: never substitute a guessed chat URL. Existing GitHub link is retained as a verified interim route.


## AB/digital Formspree contact (October 2026)

Studio homepage `/#contact` now submits to **`https://formspree.io/f/mgaongrd`**. The previous Telegram message-draft submission is replaced with a native `POST` action plus progressive AJAX `fetch`, preserving the form's existing fields and style. Client-side success, error, and submitting states handle Formspree JSON responses and the button is disabled during submission. A visitor consent checkbox is required and the privacy-policy draft now discloses Formspree for inquiries. No Formspree secrets are present in client code; the form endpoint is a public submission destination.

**Operational follow-ups:** Verify the form and configure Telegram notifications in the Formspree dashboard (Workflow). A successful HTTP submission confirms Formspree acceptance, **not** that a Telegram notification is configured or delivered. Because the website's legal privacy page is still a draft with the legal owner details missing, it must be reviewed and finalized before general public commercial intake. Do not submit fake leads to test the endpoint without the owner's approval.
