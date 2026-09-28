# Design system — token architecture

This document covers the design tokens introduced in the FAZ C design pass (post-Phase-10
visual redesign). It does not cover component markup/layout — see `docs/design-audit.md`
(the audit that drove this) and the FAZ D/E work that follows it for that.

## Two-tier token model

Every visual constant in the app is one of two tiers. See ADR-0018 in `docs/decisions.md`
for the full reasoning; summary:

1. **Brand tokens** — DB-backed (`theme` table), one row, admin-editable at
   `/admin/appearance/theme`, re-seeded per sector template. These are the things that
   genuinely differ by brand/sector: colors, both font families, and the literal
   radius/shadow values used for buttons and cards.
2. **Structural tokens** — static, defined once in `app/assets/css/theme.css`, identical
   across every sector template. These are systemic consistency constants: the fluid type
   scale, and (unchanged from before this pass) Tailwind v4's default spacing scale,
   z-index scale, and transition-duration scale. Varying these per template would fragment
   visual consistency for no real benefit — a heading being 3rem vs. 3.2rem doesn't express
   brand identity, it just makes rhythm inconsistent.

## Brand tokens (DB-backed)

| Zod/DB field | CSS custom property | Tailwind token | Utility classes | `autoglass` default |
|---|---|---|---|---|
| `colorPrimary` | `--site-color-primary` | `--color-primary` | `bg-primary`, `text-primary`, `border-primary` | `#1E3A5F` |
| `colorSecondary` | `--site-color-secondary` | `--color-secondary` | `bg-secondary`, `text-secondary` | `#23282D` |
| `colorAccent` | `--site-color-accent` | `--color-accent` | `bg-accent`, `text-accent` | `#FFB020` |
| `colorBackground` | `--site-color-background` | `--color-background` | `bg-background` | `#F4F6F8` |
| `colorText` | `--site-color-text` | `--color-text` | `text-text` | `#1A1F24` |
| `colorSurface` | `--site-color-surface` | `--color-surface` | `bg-surface` | `#FFFFFF` |
| `colorBorder` | `--site-color-border` | `--color-border` | `border-border` | `#D7DCE1` |
| `colorMuted` | `--site-color-muted` | `--color-muted` | `text-muted` | `#5B6570` |
| `fontFamily` | `--site-font-family` | `--font-body` | `font-body` | `"IBM Plex Sans", system-ui, sans-serif` |
| `fontFamilyHeading` | `--site-font-family-heading` | `--font-heading` | `font-heading` | `"IBM Plex Sans Condensed", "Arial Narrow", sans-serif` |
| `borderRadius` | `--site-radius-button` | `--radius-button` | `rounded-button` | `2px` |
| `radiusCard` | `--site-radius-card` | `--radius-card` | `rounded-card` | `4px` |
| `shadowCard` | `--site-shadow-card` | `--shadow-card` | `shadow-card` | `0 1px 2px rgba(20, 41, 67, 0.08)` |
| `shadowElevated` | `--site-shadow-elevated` | `--shadow-elevated` | `shadow-elevated` | `0 12px 28px rgba(20, 41, 67, 0.18)` |
| `buttonStyle` | *(no CSS var — read directly by components)* | — | `solid` / `outline` / `pill` | `solid` |

`colorSurface` vs. `colorBackground`: `colorBackground` is the page background, `colorSurface`
is what cards/panels sit on top of it with (usually white, but can differ — e.g. a dark-mode
sector template could set `colorBackground` darker than `colorSurface` is not, or vice versa;
the two are intentionally decoupled rather than one being computed from the other).

`radiusCard` vs. `borderRadius`: `borderRadius` was already the button radius before this
pass (existing field, unchanged in meaning). Card radius is often deliberately different from
button radius in a real design system (Direction 1 uses a tighter 2px on buttons and a
slightly softer 4px on cards) — collapsing them into one field would have forced a
compromise value.

`shadowCard`/`shadowElevated` are raw `box-shadow` value strings (same pattern the project
already used for `borderRadius` being a raw CSS length rather than an enum) — a `sm`/`md`/`lg`
enum was considered and rejected because a sector template's admin should be able to type any
box-shadow, including `none` for a flat-elevation brand.

## Structural tokens (static, `app/assets/css/theme.css`)

Fluid type scale, added as **new** keys under Tailwind v4's `--text-*` theme namespace
(which generates a `text-{key}` utility for *any* key, not only the built-in
xs/sm/base/lg/xl/2xl/... scale). These are additive — `text-sm`, `text-lg`, etc. are
completely untouched, which matters because the admin panel must stay visually independent
of the public site's theme (CLAUDE.md, ADR-0016) and shares the same compiled Tailwind build.

| Token | Utility | Value | Intended use |
|---|---|---|---|
| `--text-fluid-h1` | `text-fluid-h1` | `clamp(2.25rem, 1.6rem + 3vw, 3.75rem)` | Page H1 |
| `--text-fluid-h2` | `text-fluid-h2` | `clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)` | Section H2 |
| `--text-fluid-h3` | `text-fluid-h3` | `clamp(1.15rem, 1.05rem + 0.5vw, 1.375rem)` | Card/subsection H3 |
| `--text-fluid-body` | `text-fluid-body` | `clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)` | Body copy where fluid sizing is wanted |

Public blocks opt into these explicitly with `text-fluid-*` classes; nothing is forced.
Component markup has not been migrated to use them yet — that's FAZ D (component redesign).

**Deliberately left alone (Tailwind v4 defaults, not reinvented):**
- **Spacing** — the default `space-*`/`p-*`/`gap-*` scale already covers everything the audit
  and the direction previews needed. No project-specific reason was found to diverge from it.
- **Z-index** — surveyed existing usage before deciding: `z-20` (dropdowns), `z-30` (sticky
  bars / mobile CTA bar / modal backdrop), `z-40` (sidebar / modal panel), `z-50` (toasts /
  cookie banner) is already a de-facto convention across `app/components/**`. Codifying this
  as a documented convention (not new tokens) is enough; introducing named
  `--z-dropdown`/`--z-modal` tokens on top of numbers already this consistent would be pure
  indirection with no consistency gained.
- **Transition durations** — existing usage (`duration-200`, `duration-300`) is sparse and
  already drawn from Tailwind's default duration scale. No new tokens added for the same
  reason as z-index.

## Fonts — self-hosting

Direction 1 ("Werkstatt Präzision") pairs **IBM Plex Sans Condensed** (headings) with
**IBM Plex Sans** (body). Both are self-hosted via `@fontsource/ibm-plex-sans` and
`@fontsource/ibm-plex-sans-condensed` (added as real npm dependencies — served from the
app's own origin at build time, never Google's CDN, per CLAUDE.md's DSGVO rule). Both
packages' weight files (`400.css`/`500.css`/`700.css`/`700.css`) include a `latin-ext`
`unicode-range` subset, confirmed to cover ä/ö/ü/ß.

Imports live in `app/assets/css/main.css`, loaded before `theme.css`. Importing the font
CSS is unconditional (it's cheap — a few files bundled at build time) but **using** it is
entirely up to what the active theme row's `fontFamily`/`fontFamilyHeading` say; a sector
template that prefers a system-font stack (like `generic-service`, see below) pays no extra
cost for fonts it never references.

## `generic-service` preset

Deliberately different brand tokens (warm/rounded vs. `autoglass`'s technical/sharp), to
prove the token architecture generalizes rather than being Direction-1-specific:

| Field | Value |
|---|---|
| `colorPrimary` / `colorSecondary` / `colorAccent` | `#15803d` / `#14532d` / `#facc15` (unchanged from before this pass) |
| `colorBackground` | `#F6FAF7` (soft green-tinted, new) |
| `colorSurface` / `colorBorder` / `colorMuted` | `#ffffff` / `#D9E5DC` / `#5B6B60` |
| `fontFamily` / `fontFamilyHeading` | `system-ui, sans-serif` / `ui-rounded, system-ui, sans-serif` (both system stacks — no new font package needed) |
| `borderRadius` / `radiusCard` | `0.75rem` / `1rem` |
| `shadowCard` / `shadowElevated` | soft green-tinted shadows, larger blur than `autoglass`'s |
| `buttonStyle` | `pill` (unchanged) |

## Adding a new sector template

1. Call `setTheme({...})` in the new template's seed file with a full `ThemeValues` object
   (all 15 fields — the Zod schema requires every field, there is no partial-default
   fallback at the seed layer, only in `DEFAULT_THEME` for an empty `theme` table).
2. You are not required to add a new font package — a system-font stack is DSGVO-safe with
   zero extra code (see CLAUDE.md, Phase 9 fonts note). Only add a `@fontsource/*` package
   and import if the sector genuinely needs a specific brand typeface, and verify it ships
   a `latin-ext` (or explicit German) character subset before using it for German copy.
3. Do not invent new structural tokens per template — if the fluid type scale or spacing
   genuinely doesn't fit a new sector, that's a signal to revisit the *shared* structural
   tokens (affecting every template), not to fork them per template.
