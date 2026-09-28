# Acceptance criteria (prompt.md §13) — final status

Honest status as of the end of Phase 10 (+ the post-Phase-10 DB-translations addition and the
post-Phase-10 admin-panel-localization addition), checked against the running app. ✅ = verified,
⚠️ = partial / known gap (with the gap stated), ❔ = not independently verified.

- ✅ **`docker compose up` comes up clean from scratch; after seeding, the site looks complete
  as an auto-glass company.** Verified repeatedly (Phases 6-10) — full stack rebuild, health
  check, `pnpm db:seed --template=autoglass`, homepage/services/branches/blog/FAQ all render.

- ✅ **No hardcoded user-visible content in code; everything is editable from the admin, and
  the admin panel's own UI is now multilingual (DE/EN/TR, per-admin-user choice).**
  True for the *public* site's content (every page, block, service, branch, FAQ, testimonial,
  wizard question, email template, cookie banner and SEO field is DB-backed) and the public
  site's UI strings (buttons, form labels, banners — `/admin/translations`, ADR-0014: the
  `i18n/locales/*.json` files are genuinely just fallback defaults now, overridable per-key
  from the DB without a deploy). **The former gap — the admin panel's own UI being hardcoded
  English — is now closed:** every label, button, column header, hint and toast message across
  `app/pages/admin/**` and `app/components/admin/**` is sourced through `useAdminI18n()`
  (`app/i18n/admin/{de,en,tr}.json`), and each admin user's language preference is their own
  `users.locale` field, switchable in-panel via the topbar language switcher — see ADR-0015.
  `RichTextEditor.vue`'s toolbar (B/I/list icons) is deliberately left as-is (universal
  typographic symbols, not language content). One narrow, accepted limitation: the login page
  (`/admin/login`) has no user session yet, so it always renders the `'de'` default regardless
  of the eventual account's saved preference (ADR-0015). `app/error.vue`'s public-site
  error-boundary copy (title/body/back-to-home button) is now also translated via the public
  `useI18n()`/`errorPage.*` keys instead of hardcoded German — verified rendering correctly for
  a 404 at `/`, `/en/`, and `/tr/` prefixes.

- ✅ **Applying the `generic-service` template turns the site into a visibly different
  sector.** Verified — theme, copy, services, and menu all change; round-tripped
  autoglass → generic-service → autoglass with a backup snapshot each time (ADR-0011).

- ✅ **Public site and admin panel work cleanly at 360px.** Playwright's `mobile-360` project
  (`e2e/responsive.spec.ts`) checks zero horizontal overflow on `/`, `/services`, `/branches`,
  `/blog`, `/appointment`, and `/admin/login`; the admin layout's sidebar-to-drawer collapse
  (Phase 2) covers the rest of the admin UI.

- ⚠️ **Mobile Lighthouse scores ≥ 90.** Accessibility 100, Best Practices 100, SEO 100,
  **Performance 80** — measured against the bare production Docker container (no reverse
  proxy). See ADR-0013: the gap is uncompressed HTML transfer, deliberately left for the Caddy
  reverse proxy (docs/deployment.md) to solve rather than duplicating compression logic inside
  Nitro. **Not yet re-measured against a real Caddy-fronted deployment** — do that before
  treating this criterion as met.

- ✅ **Admin APIs 401 without a token.** `server/middleware/admin-auth.ts` guards every
  `/api/admin/**` route; `e2e/admin-auth.spec.ts` asserts this directly.

- ✅ **Upload and form security tests pass.** `e2e/security.spec.ts` asserts: a filled
  honeypot gets a response byte-for-byte identical to a real submission (ADR-0008's actual
  security property — indistinguishable from a bot's perspective, not just "gets rejected"),
  the appointment endpoint's rate limiter genuinely 429s after its configured threshold, and
  uploading a disguised non-image file (`.jpg` extension, `image/jpeg` declared MIME type,
  shell-script content) is rejected with 422 by the magic-byte check in
  `server/services/media.service.ts`.

- ✅ **Site is complete in DE, EN and TR after seeding; the language switcher goes to the
  actual translated content.** Verified — `/`, `/en`, `/tr` all render distinct, fully
  translated homepages; `UiLanguageSwitcher` uses each page's own per-locale slug (Phase 7),
  not a naive path-prefix swap.

- ⚠️ **A 4th language can go live from the admin without a deploy.** Content: yes, immediately
  (ADR-0001 — a new `languages` row makes every translatable field show that language's tab
  right away). **URL routing does not**: `@nuxtjs/i18n`'s `prefix_except_default` strategy
  resolves locale prefixes at route-registration time, so the new locale's `/xx/...` prefix
  only starts working after adding it to `nuxt.config.ts`'s `i18n.locales` and restarting (one
  config-array edit, not application logic) — see CLAUDE.md's Phase 7 notes and the corrected
  `docs/how-to/add-a-language.md`. This was documented honestly rather than papering over it.

- ❔ **Google Rich Results Test / Schema.org validator pass on every schema type.** JSON-LD is
  emitted for Organization, WebSite, Service, AutoRepair (LocalBusiness), BreadcrumbList,
  FAQPage, and BlogPosting (`app/composables/useJsonLd.ts` + per-page wiring, Phase 7), each
  hand-checked against schema.org's documented required/recommended properties while writing
  it. **Not run through Google's actual Rich Results Test or the schema.org validator** (no
  outbound internet access from this environment to those tools) — do that against a public
  URL before relying on this for real SEO work.

- ✅ **`/llms.txt`, `/sitemap.xml`, `/robots.txt` are generated correctly from the database;
  admin bot settings reflect in `robots.txt`.** All three verified via curl against seeded
  content (Phase 7); `Settings → Robots & bots` now has real per-bot allow/disallow toggles for
  the well-known AI crawlers (`shared/constants/ai-bots.ts`, ADR-0017 — prompt.md §15.4's actual
  ask, not just the freeform-text stand-in Phase 7 shipped), plus the freeform textarea for
  anything not covered.

- ✅ **All public page content is readable with JavaScript disabled.** Every public route is
  SSR-rendered (no client-only content-fetching for the initial render); `e2e/public-site.spec.ts`
  asserts this directly with a `javaScriptEnabled: false` browser context.

## Post-Phase-10 GEO/AI-search follow-up (§15, closing most of the remaining real gaps)

See ADR-0017 for the full list — in short: 404 logging + one-click redirect creation
(`/admin/redirects`), per-bot robots.txt rules (above), `shortAnswer`/`focusKeyword` fields on
pages/services/blog posts with a reusable admin SEO panel (character + pixel-width counters,
Google-style search preview, self-scoring checklist), structured service facts (price/duration/
warranty/insurance) folded into `Service` JSON-LD, blog author bylines in `BlogPosting` JSON-LD,
two new blocks (`comparison-table`, `certificates`), optional clean-Markdown export via
`Accept: text/markdown`, IndexNow ping on publish/update, a site-wide SEO report screen, a bulk
SEO editor, and a Jaccard-similarity warning for near-duplicate pages (the city×service
"doorway page" risk from §15.3 — city×service pages themselves needed no new code, since
`pages` already supports any admin-created slug). All verified end-to-end against both the dev
server and a full `docker compose up --build` production container.

**Also closed:** ADR-0016 retroactively documents the Phase 2 decision to build the admin UI
kit from scratch in Tailwind rather than KTUI/Metronic (prompt.md §16) — a real, previously
undocumented deviation, assessed honestly rather than reversed at this stage.

**A real bug found and fixed along the way, not just worked around:** a Nitro/Nuxt file-based
route mixing a bracket param with a literal suffix in one path segment
(`server/routes/[key].txt.get.ts`) broke routing for the entire public site, not just the one
new route — see ADR-0017's gotcha writeup. Fixed by moving that logic into a middleware, the
same pattern `redirects.ts`/`markdown-export.ts` already used.

## What a real next iteration should prioritize, in order

1. Re-run Lighthouse against the actual Caddy-fronted production deployment once it exists.
2. Run the live Google Rich Results Test / schema.org validator against the deployed site.

Both of the above require a real deployed domain and can't be done from this dev environment.
`scripts/backup.sh`'s off-server upload gap is now closed (optional `rclone`-based upload —
see `docs/deployment.md` § Backups).
