# Architecture

## Layers
- `app/` — Nuxt UI layer. `pages/` holds both public routes and `/admin/**`; `components/blocks` are page-builder blocks, `components/admin` is the admin UI kit, `components/ui` is the public UI kit.
- `server/api/**` — thin Nitro route handlers: parse input, call a service, return a response.
- `server/services/**` — business logic (validation orchestration, DB transactions, cache invalidation).
- `server/db/**` — Drizzle schema (`schema/`), migrations, and sector template seeds (`seed/templates/`).
- `shared/` — Zod schemas and TypeScript types used by both `app/` and `server/` (single source of truth for validation).

## Data flow (public page render)
1. Nitro route (or page-level `useAsyncData`) asks `server/services/pages.service.ts` for a page by slug + locale (Phase 4).
2. Service reads `pages` + `page_blocks`, `safeParse`s each block against `blockSchema`.
3. `app/components/blocks/BLOCK_REGISTRY` maps each valid block's `type` to a Vue component.

## Theme injection (SSR, no FOUC)
`GET /api/theme` (cached, see `defineCachedEventHandler`) returns the single `theme` row. `app/composables/useTheme.ts` fetches it during SSR and injects `:root{--site-color-primary:...}` via `useHead` before the response is sent. Tailwind's `@theme inline` block in `app/assets/css/theme.css` maps those custom properties onto Tailwind's own color/font/radius tokens, so `bg-primary`, `text-primary`, etc. always reflect the live theme.

## Cache strategy
- Public GET endpoints use `defineCachedEventHandler` (or Nitro route rules) with short TTLs.
- Any admin write to the underlying content must invalidate the corresponding cache key (pattern established as each module lands, starting Phase 3).

## i18n flow
- URL strategy: `prefix_except_default`, default locale `de` has no prefix.
- Content translations: JSONB per row (ADR-0001 in `docs/decisions.md`).
- UI translations: `translations` table (key → `{de,en,tr,...}`), code-level locale files (`app/i18n/locales/*.json`) are fallback-only defaults.
- New language = a row in `languages` + filled-in JSON keys; no code change, no deploy required for content translators.
