# CRAVE Web Design Brief — The Food Operating System for Campus Life

> Source: Android prototype `com.srmfood.gag` + Supabase 001–017 + iOS parity docs.
> This brief is the **visual + product contract**. No component code may contradict it.
> Companion: `CRAVE_DESIGN_TOKENS.md` (values), `CRAVE_WEB_ARCHITECTURE.md` (structure).

## 1. Purpose / Audience / Tone (8-line brief)

```
Purpose:    Campus food marketplace + operations platform — discover, order, pickup, run outlets, command campus.
Audience:   Students on phones between classes; vendors on tablets at counters; management on desktops. India-first, price-sensitive, queue-averse.
Tone:       Campus Pop Editorial — premium food-magazine craft with sticker-book playfulness and ops-grade precision.
Reference:  Kinfolk food editorial + Campus street-sticker wall + Linear-grade ops console. NOT Zomato/Swiggy trade dress.
Palette:    Warm cream base / deep ink text / charcoal surfaces + ONE hero accent (electric coral) + categorical brights used sparingly.
Type:       Bricolage Grotesque (display, personality) + Manrope (UI/body, legibility). One ratio, no ad-hoc sizes.
Memorable:  The "craving rail" — horizontal discovery rails with sticker badges + a springy favourite-burst + a living order timeline.
Restraint:  No glassmorphism-everywhere. No purple→blue gradients. No floating blobs. No 3D-for-3D. No rounded-xl-on-everything.
```

## 2. Aesthetic direction: Campus Pop Editorial

- **Editorial grid, sticker accents.** Cream page, ink headlines, generous whitespace. Colour lives in chips, badges, offer cards, charts, active nav — never whole surfaces.
- **Food-first photography.** Large 4:3/1:1 food images, `aspect-ratio` locked, WebP/AVIF, blur-up. No grey boxes.
- **One accent, categorical seconds.** Coral `#FF4D2E` is the only CTA accent (<10% surface). Lime, cobalt, citrus, pink, lavender are *semantic/category* colours (veg, offers, slots, charts) — never competing CTAs.
- **Radius discipline:** `8 / 12 / 16 / 999-pill` only. Cards `16`, chips `999`, buttons `12`. Zero mixed `rounded-xl`-soup.
- **Shadow discipline:** 2 elevations only (contact + ambient). Dark surfaces elevate by lightening, not shadow.
- **Anti-slop:** No Inter-as-display, no centered `max-w-4xl` every page, no hero→3-cards→CTA template. Home breaks the grid once (sticker wall / ticker).

## 3. Brand voice

Confident, friendly, slightly cheeky, campus-native. Never childish, never slang-heavy.

- "What are you craving?" / "Your usual?" / "Peak hunger hours." / "Popular around campus." / "Beat the queue." / "Ready when you are." / "That craving escaped us." (no-results) / "Nothing here yet. Let's fix that." (empty favs)
- Buttons name actions: `Add to cart · Review order · Place pickup order · Start cooking · Mark ready`. Never `Submit / OK / Yes`.
- Errors: what + why + next: "That slot just filled — pick the next one, your items are kept. [Choose slot]".

## 4. Information architecture (route groups)

```
(app)/(consumer)/        /  /search  /categories/[slug]  /outlets/[slug]  /food/[slug]
                         /collections  /offers  /favorites  /cart  /checkout
                         /orders  /orders/[id]  /profile  /notifications  /reviews
                         /reorder  /group-order  /campus  /settings  /help
                         /auth/login  /auth/register
(vendor)/vendor          /vendor  /orders  /orders/[id]  /menu  /inventory
                         /analytics  /reviews  /promotions  /settings
(management)/management  /  /analytics  /outlets  /vendors  /users  /orders
                         /payments  /inventory  /reviews  /promotions
                         /pickup-slots  /notifications  /support  /settings  /audit
```

Student tabs (mobile bottom): Home · Explore · Search · Orders · Profile. Desktop header: logo · Search · Explore · Offers · Favourites · Orders · profile + persistent cart. Vendor/management use separate app shells (sidebar + command bar), never the consumer header.

## 5. Page contracts (what each must do)

- **Home:** hero (photo + headline + campus context + search + CTA + ONE lazy 3D garnish) → category strip → personalised (usuals/recent) → trending → fastest pickup → popular → best rated → offers → new → collections → previously ordered → time module (Morning fuel / Between-class / Post-class / Midnight mode) → social → footer. Horizontal rails, editorial cards.
- **Search:** server-side only. Food/outlet/category/ingredient/tag/cuisine/dietary. Sort: relevance/rating/price/prep/popularity/newest. Filters: veg, price, rating, prep, category, outlet, availability, offers, dietary. Zero-result state names the query + clear-filters.
- **Outlet:** hero + open/closed + rating + hours + pickup ETA + location → sticky category nav → menu (filter/search/jump) → popular → offers → reviews → info/policies. Favourite + share + reorder + queue info.
- **Food:** big image, price, rating, outlet, prep, veg, ingredients/tags/calories, variants/options, qty, add, favourite, reviews, related + frequently-together. Layout transition from card.
- **Reviews:** eligibility = completed/picked-up order only (server-enforced). States pending/published/hidden/reported/moderated. Sort helpful/newest/high/low. Distribution 5→1. Verified-purchase badge. Vendor replies. Report/moderate.
- **Favourites:** foods + outlets + collections + categories. "Your staples / emergency meal / sweet tooth". Quick reorder, server-synced.
- **Cart:** qty, variants, instructions, availability re-check, single-outlet guard with clear-and-add dialog, coupons, 5% tax (server-authoritative), slot, prep ETA. Fast + reassuring.
- **Checkout:** 7 steps (review → outlet → slot → instructions → coupon → payment → confirmation). Razorpay + pay-at-counter. Failure recovery + idempotency. No secrets client-side.
- **Tracking:** CREATED→PLACED→ACCEPTED→PREPARING→READY→PICKED_UP (+REJECTED/CANCELLED/EXPIRED/REFUNDED) visual timeline with campus copy ("Kitchen got it → Cooking now → Ready to grab"). Slot, ETA, QR when READY, realtime.
- **Vendor:** KPIs + hourly/daily charts + top items + payment mix + prep trend + heatmap; live queue (new/accepted/preparing/ready/completed) with 1-click transitions, SLA/age warnings, availability toggles; menu editor + inventory alerts; review replies.
- **Management:** campus command centre — revenue/orders/hourly/dow/outlet ranking/vendor/category/payment mix/cancel-reject reasons/congestion/inventory/search→order/cart-abandon/repeat. All server-aggregated.

## 6. Motion language (Motion for React only)

- Consumer: playful springy (`bounce 0.25, duration 0.35`). Checkout: calm deliberate (tween 0.25, no bounce). Vendor: fast functional (0.15). Management: precise restrained (0.2, no spring).
- Favourite: heart burst→settle. Add: morph→confirm. Search: focus expand. Ready: pulse. Coupon: mini-burst. QR: depth entry. Charts: fade-rise stagger. Respect `prefers-reduced-motion` (kill all).
- Durations `120 / 220 / 420ms`, easings `cubic-bezier(0.2,0,0,1)` + `cubic-bezier(0.16,1,0.3,1)`. Only `transform/opacity/filter`. Never `transition: all`.

## 7. 3D policy

One lazy hero garnish (floating takeaway/burger/drink + stickers, mouse parallax, scroll-link, DPR≤2, pause offscreen, static fallback). Optional Spline mascot. Rive for empty-state play. Lenis only if it helps without harming a11y/touch/perf. No full-3D pages.

## 8. Quality bars (must all pass)

- Every data component: loading / loaded / empty-first-use / empty-no-results / empty-cleared / error-recoverable / error-permission / offline / partial — distinct copy + action.
- WCAG 2.2 AA: native elements, landmarks, visible focus, live regions, 44px targets, contrast 4.5:1/3:1 both modes, no colour-only meaning.
- Perf: server render where it helps, images optimised, dynamic 3D/charts, p99 checkout <2s, Lighthouse green.
- Security: RLS everywhere, role routing + server re-check, no service_role browser, payments server-verified, audit sensitive actions.
- Real data only. No fake buttons, no fake charts, no client averages. Missing capability → migration/RPC + doc, never fake state.
