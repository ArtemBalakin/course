/**
 * Cloudflare Web Analytics for the two AB/digital Render hostnames.
 * Enter PUBLIC Cloudflare Web Analytics beacon tokens, NOT Cloudflare API keys.
 * Missing tokens disable analytics and third-party requests completely.
 */
(function () {
  'use strict';

  const BEACON_TOKENS = {
    'ab-digital.onrender.com': 'c81faf1fe46a427d8c10e8644458ab4f',
    'ab-digital-preview.onrender.com': ''
  };

  const hostname = window.location.hostname.toLowerCase();
  const token = BEACON_TOKENS[hostname];
  if (typeof token !== 'string' || !/^[a-zA-Z0-9_-]{20,128}$/.test(token)) return;

  const beacon = document.createElement('script');
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.type = 'module';
  beacon.async = true;
  // The site is multi-page HTML; hash anchors are not extra pageviews.
  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: token, spa: false }));
  document.head.appendChild(beacon);
})();
