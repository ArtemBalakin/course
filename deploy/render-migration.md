# Legacy Render domains

The primary website is hosted separately at https://ab-digital.kz/. Both `ab-digital` and `ab-digital-preview` remain as redirect services.

For each existing Render static service:

- Source repository: ArtemBalakin/course, branch develop.
- Publish Directory: `render-redirect` (not `site`).
- Redirect/Rewrite rule: source `/*`, destination `https://ab-digital.kz/*`, action Redirect (301).
- Preserve the existing build command, headers, environment, and other service settings.

Render serves an existing static file before matching redirect rules. The redirect-only publish directory therefore intentionally contains no index.html, sitemap.xml, robots.txt, assets or service pages. Its only file is the non-HTML migration marker. The actual website remains in `site/`, deployed to its existing .kz host.

`render.yaml` preserves the existing Blueprint service name ab-digital-preview and specifies the same publish directory and route. The ab-digital service is configured in the Dashboard; this change does not create or replace resources. The independent ab-digital-sabina-preview service is outside this migration.

Verify GET and HEAD, root, localized pages, services, sitemap, robots and query strings on both old domains. Every former website path must return 301 to the same path on ab-digital.kz. Existing legacy project paths subsequently redirect to their matching sections on the bot service page.
