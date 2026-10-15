# Cloudflare Web Analytics — AB/digital

## Status
Code is prepared, but **tracking is inactive** until public beacon tokens are configured.
Do NOT put Cloudflare account credentials or API keys in the repository.

## Create two distinct Cloudflare Web Analytics sites
1. Sign in at https://dash.cloudflare.com/ and go to Web Analytics.
2. Click Add a site and enter each hostname (without https://):
   - ab-digital.onrender.com — main
   - ab-digital-preview.onrender.com — preview/testing
3. Open Manage site, copy each site's JavaScript beacon snippet.
4. Take only the public beacon token from data-cf-beacon's JSON, not an API token.
5. Insert the respective tokens into site/assets/analytics.js under these hostnames.
6. Commit and deploy both Render sites from develop. They publish the same site/ directory.

The analytics bootstrap is present on all currently published HTML pages. Unknown
hostnames, localhost and sites with empty tokens do not load Cloudflare at all.

## Verify
- On each hostname, open browser DevTools > Network and search beacon.min.js.
- With the real token, the JavaScript should load from static.cloudflareinsights.com
  and send measurements to cloudflareinsights.com/cdn-cgi/rum.
- Check separate Cloudflare Web Analytics dashboards; reporting can be delayed.
- Browser privacy protections or ad blockers can block analytics.
- Hash-only navigation (#process etc.) is not recorded as a separate pageview.
- Cloudflare visitor counts are estimates rather than identified people.
- Visits before enabling the beacon cannot be reconstructed retroactively.

## Privacy
Cloudflare Web Analytics is designed to avoid tracking cookies and invasive
tracking. Review the draft privacy notice and local legal obligations before
public commercial launch. Never send personal contact form data to analytics.

Official documentation:
https://developers.cloudflare.com/web-analytics/get-started/
https://developers.cloudflare.com/web-analytics/faq/
