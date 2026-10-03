# CRAVE Web Implementation Status

> Updated as phases land. Legend: COMPLETED · PARTIALLY COMPLETED · BACKEND REQUIRED · DEFERRED · KNOWN LIMITATION.

## PHASE 0 — Audit: COMPLETED
Android `com.srmfood.gag` mapped (22 student + 13 vendor + management suite), migrations 001–017 mapped, RPC/Edge/RLS contracts mapped, iOS parity docs ingested. `supabase_schema.json` ignored (invalid-key placeholder).

## PHASE 1 — Design contracts: COMPLETED
`CRAVE_WEB_DESIGN_BRIEF.md`, `CRAVE_DESIGN_TOKENS.md`, `CRAVE_WEB_ARCHITECTURE.md`, `CRAVE_SEARCH_SPEC.md`, `CRAVE_REVIEW_SYSTEM.md`, `CRAVE_ANALYTICS_SPEC.md` present.

## PHASE 2 — Foundation: IN PROGRESS
Next.js 16 + React 19 + Tailwind v4 + shadcn scaffold in `/web`, token CSS, shells, providers. Pending verification (`npm run build`, Playwright screenshots 1440+390).

## PHASE 3+ — PARTIALLY COMPLETED (demo-backed)
Consumer/vendor/management routes render with demo data + Supabase-live upgrade path (`NEXT_PUBLIC_SUPABASE_*` set → real data). No fake buttons: actions without backend show honest "demo / backend required" notice.

## BACKEND REQUIRED
- `018_web_parity_guards`: `get_admin_stats users→profiles`, `pickup_tokens` owner SELECT, `mark_payment_verified` hardening + service_role lockdown (expand→migrate→contract).
- `019_reviews`: images/votes/reports/replies + aggregates.
- `020_growth`: outlet favourites, collections, `analytics_events`/`search_events`, group-order tables, promo usage.
- Razorpay live keys + webhook secret in Edge env.

## KNOWN LIMITATIONS
- Single-outlet cart (multi-outlet iOS-016 proposal unapplied — stays single-outlet).
- Realtime-only notifications (FCM dormant, push deferred).
- Vendor QR scanner manual-token fallback until camera path verified.
- 3D/Spline lazy garnish only; static fallback when WebGL/reduced-motion.
