# How to add a new language

> Content is zero-code-change; the URL prefix needs one config edit + restart (Phase 7 — see ADR-0001 and CLAUDE.md's Phase 7 notes for why).

1. In the admin "Languages" settings screen, add a new language: code, name, native name, flag, text direction, active/inactive.
2. It immediately appears as a new tab in every translatable field across every module (pages, services, blog, FAQs, menus, SEO fields, wizard questions, email templates, cookie banner text, and the admin panel's own UI language switcher) — no migration, no deploy, no restart. Content can be filled in right away, before the next step.
3. Fill in content for the new language. Anything left blank falls back to the default language (`de`) and is flagged in the admin UI as an incomplete translation.
4. For the language's own **URL prefix** to start routing (`/xx/...`), add its code to the `locales` array in `nuxt.config.ts` (`i18n.locales`) and restart the app. `@nuxtjs/i18n`'s `prefix_except_default` strategy resolves locale prefixes at route-registration time, not per-request from the database — this one array entry is the sole code change, and it's config, not logic.

If you ever find yourself editing anything beyond that one config array to "support" a new language — a `.vue` file, a schema, a hardcoded locale union — that's a bug: languages must otherwise stay pure data (see ADR-0001 in `docs/decisions.md`).
