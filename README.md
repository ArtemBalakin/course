# AB/digital + SABINA — preview website

An **actual responsive static website** with **zero package dependencies**. This is the public-preview-ready implementation of a personal IT/development business and an online Latin-dance course sales funnel. It does not collect payments or user details until merchant approval.

## Pages

- `/` — IT developer / digital studio portfolio: services, current project, workflow, contact.
- `/courses/sabina/` — elegant course landing with eight illustrative program items and three provisional packages.
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
