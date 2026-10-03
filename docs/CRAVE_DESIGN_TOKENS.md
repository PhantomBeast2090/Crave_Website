# CRAVE Design Tokens — Campus Pop Editorial

> Companion to `CRAVE_WEB_DESIGN_BRIEF.md`. Single source of truth for all values.
> Components reference **token names only** — no raw hex/px outside `:root`.
> Contrast gate: body 4.5:1, large/UI-boundary 3:1. Verify with `applying-themes/scripts/check_contrast.py`.

## 1. Colour

### Base neutrals (breathing space ~90% of surface)

| Token | Value | Role |
|---|---|---|
| `--base` | `#FFF9F0` warm cream | page |
| `--surface` | `#FFFFFF` | raised cards |
| `--surface-2` | `#F6EFE3` sand | sunken / rails |
| `--ink` | `#171111` deep ink | primary text (15.2:1 on base ✅) |
| `--ink-2` | `#4A3F3F` muted | secondary (7.1:1 ✅) |
| `--ink-3` | `#6E625E` meta only | captions ≥12px bold / large only (4.6:1 ✅ — never body) |
| `--line` | `#E7DAC6` | borders, rules |
| `--charcoal` | `#1D1A18` | dark sections / vendor shell |
| `--charcoal-2` | `#2A2523` | dark raised |

### Hero accent (exactly one CTA accent, <10% surface)

| Token | Value | Use |
|---|---|---|
| `--accent` | `#FF4D2E` electric coral | primary CTA, active nav, key badges |
| `--accent-ink` | `#FFFFFF` | text on accent (4.0:1 — large/bold only; body CTA uses 16px semibold ✅) |
| `--accent-deep` | `#C4320E` | hover/press, text-accent on cream (5.9:1 ✅) |
| `--accent-soft` | `#FFE3D9` | tinted containers (with `--accent-deep` text) |

### Categorical brights (semantic only, never competing CTAs)

| Token | Value | Meaning |
|---|---|---|
| `--lime` `#A8E10C` | veg / available / success tint text `#3F6200` |
| `--cobalt` `#2456E6` | info / links (4.5:1 on white ✅) |
| `--citrus` `#FF9E0B` | offers / rating stars / warnings |
| `--pink` `#FF4D8D` | favourites / social |
| `--grape` `#7C5CFF` | collections / premium |
| `--success` `#1F9D55` / `--warning` `#B7791F` / `--error` `#D92D20` | states (always + icon/label, never colour-only) |
| `--veg` `#15803D` / `--nonveg` `#B91C1C` | diet marks with triangle/square glyph |

### Order / slot states

`created #6E625E · placed #2456E6 · accepted #7C5CFF · preparing #FF9E0B · ready #1F9D55 · picked-up #171111 · cancelled/rejected #D92D20 · expired #6E625E · refunded #2456E6`
`slot-available #1F9D55 · slot-limited #B7791F · slot-full #D92D20` — all with text labels.

### Charts (max 6 per chart, colourblind-safer order)

`#FF4D2E coral · #2456E6 cobalt · #1F9D55 green · #FF9E0B amber · #7C5CFF grape · #FF4D8D pink` on cream/charcoal grids `#E7DAC6 / #3A3330`.

## 2. Typography

- Display: `"Bricolage Grotesque", "Space Grotesk", system-ui` — headlines, hero, numerals in KPI.
- Text: `"Manrope", "Plus Jakarta Sans", system-ui` — body/UI. Never Inter-as-display.
- Scale (1.250 major third): `--step--1:0.833rem · --step-0:1rem · --step-1:1.25rem · --step-2:1.563rem · --step-3:1.953rem · --step-4:2.441rem · --step-5:3.052rem · --step-6:3.815rem`. Display tight `1.0–1.05`, body `1.6`, tracking `-0.02em` display / `0` body. `text-wrap: balance` headings. Tabular numerals for prices/KPIs.

## 3. Space / radii / borders / elevation

- Space: `--space-3xs:0.25rem · 2xs:0.5rem · xs:0.75rem · s:1rem · m:1.5rem · l:2rem · xl:3rem · 2xl:4.5rem · 3xl:7rem`. Every margin/padding/gap from this scale.
- Radii: `--radius-s:8px · m:12px · l:16px · pill:999px`. Cards `l`, buttons `m`, chips `pill`. One value per component.
- Borders: `--border: 1px solid var(--line)`; dark `--border-dark: 1px solid #3A3330`.
- Shadows (2 only): `--shadow-near: 0 1px 2px rgb(23 17 17 / .08)` (contact), `--shadow-far: 0 12px 32px -12px rgb(23 17 17 / .22)` (floating). Dark mode: lighten surface instead.

## 4. Motion

`--dur-fast:120ms · --dur:220ms · --dur-slow:420ms · --ease:cubic-bezier(0.2,0,0,1) · --ease-out:cubic-bezier(0.16,1,0.3,1)`. Consumer spring `{type:spring,bounce:.25,duration:.35}`; checkout/vendor/admin tweens per brief. `prefers-reduced-motion: reduce` → `0.01ms`.

## 5. Breakpoints

`--bp-mobile:0 · --bp-tablet:768px · --bp-desktop:1024px · --bp-wide:1440px`. Consumer mobile-first; vendor tablet/desktop; management desktop-first responsive. `100dvh` not `100vh`. Bottom-bar `padding-bottom: max(var(--space-s), env(safe-area-inset-bottom))`.

## 6. Tailwind mapping

```ts
// tailwind v4 @theme — names mirror tokens
--color-base, --color-surface, --color-ink, --color-accent, ...
--font-display, --font-sans
```
Utilities: `bg-base text-ink border-line bg-accent text-accent-ink`. No arbitrary `bg-[#...]` in components.
