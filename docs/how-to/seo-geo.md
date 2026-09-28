# SEO & GEO: writing content, adding schema types, and how llms.txt is built

This is the reference required by prompt.md §15.5 — it covers what an editor should pay
attention to when entering new content, how to add a new JSON-LD schema type, and how
`/llms.txt` is generated.

## Writing content that both search engines and AI answer engines can use

Every content type with a `seo` field (pages, services, blog posts) has these fields available
from the admin editor's SEO panel (`app/components/admin/SeoPanel.vue`):

- **Focus keyword** — the main term this page targets. Only drives the panel's own checklist;
  never rendered publicly. Fill it in so the checklist can actually tell you something.
- **Meta title / description** — the panel shows a live character count *and* an approximate
  pixel-width bar (Google's search-result truncation is pixel-based, not character-based) plus
  a Google-style search-result preview. Aim for the bar staying under 100%.
- **Short answer** — 2-3 sentences that directly answer the page's main question, in plain
  language. This is rendered visibly at the top of the page/service/post (not hidden metadata)
  specifically so AI crawlers and answer engines (ChatGPT, Perplexity, Google AI Overviews) have
  something quotable right at the top. Write it like you're answering the question a search
  result's snippet would need to answer — "How long does a windshield chip repair take?" → "A
  chip repair usually takes about 30 minutes and is often free under comprehensive insurance."
  not "Learn about our chip repair service."
- **noindex** — only for pages that genuinely shouldn't be indexed (thank-you pages, internal
  search results). Don't reach for this to "hide" a page from navigation; use menus for that.

For **services** specifically, also fill in the structured facts (price from, duration,
warranty, insurance info) whenever they're true and stable — these render in a facts table on
the service page and feed into the `Service` JSON-LD's `offers`, which is exactly the kind of
structured, quotable data AI answer engines pull from (prompt.md §15.4's "concrete facts in
structured fields" requirement).

For **blog posts**, fill in the author byline (name, role, photo) — it feeds the `BlogPosting`
JSON-LD's `author` and is an E-E-A-T signal search engines and AI crawlers both weigh.

**Avoid near-duplicate pages.** If you're building a city×service landing page (e.g.
`/standorte/berlin-mitte`, a `pages` entry like any other — no special "location page" type
exists, it's just a normal page with its own slug and blocks), the page editor
(`/admin/pages/:id`) runs a similarity check against every other page automatically and shows a
warning banner if the new page's text content overlaps too heavily with an existing one
(`server/services/content-similarity.service.ts`, a simple Jaccard word-overlap score, threshold
0.5). This is Google's "doorway page" risk (prompt.md §15.3) — the fix is always to add
genuinely unique content (the branch's own photos, specific opening hours, a locally-relevant
FAQ or testimonial), not to suppress the warning.

**Check the SEO report and bulk editor regularly.** `/admin/seo-report` aggregates missing meta
fields, images missing alt text, duplicate meta titles/descriptions, and the most-hit 404 paths
across the whole site. `/admin/bulk-seo` lets you fix meta title/description for every page,
service, and blog post from one table instead of opening each one individually.

## Adding a new JSON-LD schema type

`app/composables/useJsonLd.ts` renders whatever plain object you give it as a
`<script type="application/ld+json">` tag. There's no schema-type registry to update — each
public detail page (e.g. `app/pages/services/[slug].vue`) builds its own object inline and
calls `useJsonLd(() => ({ '@context': 'https://schema.org', '@type': '...', ... }))`.

To add a new type (e.g. a sector template needs `Dentist` instead of `AutoRepair` for branch
pages, per prompt.md §15.2):

1. Build the object against [schema.org](https://schema.org/docs/schemas.html)'s documented
   properties for that type — check required and recommended properties for the specific type,
   not just the generic parent type.
2. **Give the `useJsonLd()` call site its own `useId()`-derived key prefix.** unhead dedupes head
   tags by `key` globally, not per call-site — reusing a key (or letting two call-sites land on
   the same numeric index) silently overwrites one script tag with the other. Every existing
   call site already does this; copy the pattern, don't invent a new one.
3. If the schema type should be admin-configurable per sector (prompt.md §15.2's "şema tipi
   sektör şablonuna göre değişebilir" — e.g. `AutoRepair` for auto glass, `Dentist` for a dental
   template), add a `site_settings.general` (or a new settings key) field the admin can set, and
   branch on it when building the object. Don't hardcode the type into the page component.
4. Add a unit test if the object-building logic has any branching (optional fields, computed
   values) — see `shared/schemas/blocks/index.test.ts` for the project's testing style, though
   JSON-LD objects themselves aren't Zod-validated, just hand-built.
5. Manually check the output against schema.org's own validator or Google's Rich Results Test
   once there's a real deployed URL to test against (this project's dev environment has no
   outbound internet access to reach those tools — see `docs/acceptance-criteria.md`).

## How `/llms.txt` and `/llms-full.txt` are built

Both are Nitro server routes (`server/routes/llms.txt.get.ts`, `llms-full.txt.get.ts`), not
static files — they read live from the database on every request (cached briefly via
`defineCachedEventHandler`), so they're always in sync with actual content, no separate
generation step to remember.

- **Locale selection is a query param** (`?locale=en`), not a path prefix (`/en/llms.txt`) — see
  ADR-0009 for why: a true per-locale path would need its own file-based route per language,
  which conflicts with languages being pure runtime data (ADR-0001). Default locale is used when
  the query param is omitted.
- `llms.txt` is a short summary: company name, contact info, and a linked list of services and
  branches (`listServicesForBlock`/`listLocationsForBlock` from
  `server/services/content-read.service.ts` — the same read functions the page-builder's
  `service-cards`/`branch-finder` blocks use).
- `llms-full.txt` (check that file directly for its exact content) extends this with fuller
  page/content detail, still built from the same live DB reads.
- Every URL emitted is built with `withLocalePrefix()` (`server/utils/locale-paths.ts`) so links
  in the file always point to the correct locale-prefixed public URL, matching
  `@nuxtjs/i18n`'s `prefix_except_default` strategy.

If you add a new content type that should be discoverable by AI crawlers (e.g. a new sector
template's flagship content type), add it to both routes the same way services/branches are
already included — a `list*ForBlock()` read function plus a mapped list of `- name: url` lines.

## Optional Markdown export

Any page, service, or blog post also serves a clean Markdown version via HTTP content
negotiation — request the same URL with `Accept: text/markdown` and you get plain Markdown back
instead of the HTML page (see `server/middleware/markdown-export.ts`). This is never a separate
route, specifically so it can never shadow the normal HTML page at the same URL. It's
admin-togglable at Settings → SEO defaults → "Enable Markdown export". No content changes are
needed to support this — it's generated automatically from the same title/content fields (via
`server/utils/html-to-markdown.ts`, a small converter scoped to exactly the HTML tags our TipTap
editor produces).

## IndexNow

Settings → SEO defaults → IndexNow lets you notify Bing/Yandex the moment a page, service, or
blog post is published or updated, instead of waiting for their crawlers to notice on their own.
Enabling it auto-generates a verification key, served back at `/{key}.txt` (a middleware, not a
static file — see ADR-0017 for why a file-based dynamic route doesn't work here). No content
author action needed beyond enabling the toggle once; every publish/update after that pings
automatically and silently no-ops if IndexNow is unreachable (never blocks a content save).
