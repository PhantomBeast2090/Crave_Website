# CRAVE Web Implementation Status

> Updated as phases land. Legend: COMPLETED · PARTIALLY COMPLETED · BACKEND REQUIRED · DEFERRED · KNOWN LIMITATION.

## Backend connection: LIVE
- Project `btdmhveaqssuuhyoyanz` (`https://btdmhveaqssuuhyoyanz.supabase.co`), publishable key in `web/.env.local` (gitignored, never committed). No service_role in the repo. AnonReads + GoTrue + RPCs + Edge verified from the browser path.
- Live data observed: **9 outlets, 1397 food items, 61 categories, 504 future pickup slots**. `search_food`, `get_catalogue_for_outlet` verified working. `reviews` empty, `coupons` empty, `food_variants` empty.
- **Zero demo/fake data in the app.** `lib/domain/demo.ts` deleted. Every page reads Supabase or renders an honest loading/empty/error/permission state.

## PHASE 0 — Audit: COMPLETED
Android `com.srmfood.gag` mapped, migrations 001–017 mapped, RPC/Edge/RLS contracts mapped, iOS parity docs ingested.

## PHASE 1 — Design contracts: COMPLETED
`CRAVE_WEB_DESIGN_BRIEF.md`, `CRAVE_DESIGN_TOKENS.md`, `CRAVE_WEB_ARCHITECTURE.md`, `CRAVE_SEARCH_SPEC.md`, `CRAVE_REVIEW_SYSTEM.md`, `CRAVE_ANALYTICS_SPEC.md` present.

## PHASE 2 — Foundation: COMPLETED
Next.js 16 + React 19 + Tailwind v4 scaffold, token CSS, consumer/vendor/management shells. `next build` clean, `eslint` clean, Playwright 13/13 (6 live smoke + 7 axe/keyboard) green, screenshots reviewed at 1440 + 390.

## PHASE 3+ — Consumer/vendor/management on live data: COMPLETED (honest states where backend lacks data)
- Home/search/outlet/food/category/collections/campus: live catalogue, real counts, honest rails (Under ₹100, categories, outlets). No trending/rating claims — backend has no order/rating aggregates publicly.
- Cart: live price refresh, single-outlet conflict resolution. Checkout: live slots, server-cart sync, `place_order` RPC, pay-at-counter + Razorpay Checkout.js with honest fallback when unconfigured.
- Orders/tracking: live rows + realtime status + QR token (needs 018 owner policy; honest fallback until applied).
- Favourites: device saves merged with `favorites` table when signed in. Reviews: live read + verified-order-gated write. Offers: live `coupons` (currently empty → honest empty). Profile/auth: GoTrue + `profiles` row.
- Vendor: outlet-scoped orders + order detail + 1-tap RPC transitions + realtime, QR scanner (camera + manual, `verify_pickup_token`), menu availability/price, inventory, computed analytics, reviews, promotions, open/close.
- Management: `get_management_analytics` RPC, orders/outlets/vendors/users/payments/inventory/slots/reviews/promotions/audit — all RLS-honest.

## Finish pass: COMPLETED
- Real QR pickup codes (`react-qr-code` over `pickup_tokens.token_value`).
- Outlet pages: menu search, save/share outlet, live outlet reviews, per-page SEO metadata. Food/category pages: SEO metadata (server-rendered). PWA manifest + icon.
- Analytics bus wired: `food_viewed`, `add_to_cart`, `favourite_toggled`, `search_submitted`, `sort_applied`, `checkout_started`, `order_completed` (flush endpoint lands with 020 events tables).
- Lazy R3F 3D sticker cluster on desktop hero (DPR≤2, pauses offscreen, static fallback, reduced-motion + no-WebGL safe, aria-hidden).
- Axe WCAG 2.2 AA suite green (7/7): CTA fills moved to measured 5.51:1 deep coral; bright coral reserved for large display + graphics.

## BACKEND REQUIRED (additive migrations, Android untouched)
- `018_web_parity_guards` (in `web/supabase/migrations/`): `get_admin_stats users→profiles` fix, `pickup_tokens` owner SELECT, `mark_payment_verified` hardening + service_role lockdown (expand→migrate→contract). **Needs DBA apply + soak.**
- `019_reviews`: images/votes/reports/replies + server aggregates + moderation states.
- `020_growth`: outlet favourites, collections, `analytics_events`/`search_events`, group-order tables, promotion creation, inventory adjustments, `slug` columns for outlets/categories/foods.
- Razorpay live Key ID + Edge secrets for online payments.

## KNOWN DATA-LIMITATIONS (live backend, surfaced honestly — never papered over)
- `is_veg` is `true` on all 1397 rows (015 heuristic backfill) — dietary filter stays OFF until re-classified; serving wrong veg info would be harmful.
- `rating`/`total_reviews` are 0 everywhere — UI shows "Not rated yet", rating sort removed until aggregates exist.
- `prep_time_minutes` defaults (≤10 everywhere) — "fastest pickup" rail removed; per-item prep shown as stored.
- `food_variants` empty — customisations UI deferred; checkout notes it.
- `pickup_slots` future rows exist (504) but are outlet-sparse — empty days say so plainly.
