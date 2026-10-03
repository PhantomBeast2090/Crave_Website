# CRAVE Web Architecture

> Next.js 16 App Router + React 19 + TS + Tailwind v4 + shadcn/ui + Supabase SSR + Zod + RHF + Motion.
> Monorepo: `/docs` (contracts) + `/web` (deployable app). Android untouched.

## 1. Layout

```
Crave_Website/
  docs/  BRIEF · TOKENS · ARCHITECTURE · SEARCH · REVIEW · ANALYTICS · STATUS
  web/   Next.js app (this repo's deployable)
    app/(consumer)/  page(search, categories, outlets, food, cart, checkout, orders, favorites, offers, profile…)
    app/(vendor)/vendor/…  app/(management)/management/…
    app/auth/  login · register
    components/ui (shadcn) · consumer · vendor · management · motion · three
    lib/supabase (client/server/middleware) · domain (types,zod,rpc) · analytics (trackEvent) · search (ranking)
    supabase/migrations/  additive only (018+)
    tests/e2e (playwright)
```

Route groups share one codebase but separate shells: consumer (header/bottom-nav + cart), vendor (sidebar + queue command bar), management (sidebar + KPI grid). Role guard in middleware + server re-check (never UI-only).

## 2. Data layer

- Supabase SSR: `createBrowserClient` (client) + `createServerClient` (server/middleware, httpOnly cookies). No service_role in browser. Anon key only.
- Domain types mirror Android `domain/model` + iOS `Domain/Models`: `User, Outlet, FoodItem(+variants/options), Cart(+items+customizations), Order(+items, 10-state), PaymentRecord, PickupSlot, Favorite, Review(+media/votes/replies/reports), Notification, Coupon`.
- Reads: PostgREST direct for catalogue (`food_items` + nested variants, `outlets`, `categories`); RPCs for `search_food`, `get_catalogue_for_outlet`, `place_order`, vendor transitions, `verify_pickup_token`, `mark_payment_verified` (via Edge), `get_management_analytics`.
- Writes: all privileged mutations via `SECURITY DEFINER` RPCs. Client never computes price/tax/eligibility — previews only.
- Realtime: `orders` + `notifications` channels (existing publication). Live tracking + vendor queue + notif badge via `supabase.channel().on('postgres_changes')`.
- Cache: server components (RSC) for catalogue/search SEO + `fetch` cache; client SWR-lite for cart/favs; no Room port — web uses Supabase + local optimistic patch.
- Payments: `create-razorpay-order` → Checkout.js → `verify-razorpay-payment` (HMAC) → `mark_payment_verified`. Webhook `razorpay-webhook` authoritative. Cart cleared only PAY_AT_COUNTER (RPC) or PAID/CAPTURED (verify RPC).

## 3. Conventions

- Zod schemas co-located with forms (`lib/domain/*.schema.ts`); RHF + `zodResolver`; server re-validates.
- `trackEvent({name, entityType, entityId, metadata})` central bus → `analytics_events` (+ `search_events`). No scattered calls.
- Components: `FoodCard, OutletCard, CategoryChip, ReviewCard, RatingBreakdown, OfferCard, SearchBar, FilterBar, QuantitySelector, CartDrawer, OrderTimeline, PickupSlotSelector, QRCodeCard, FavouriteButton, RecommendationRail, CollectionCard, EmptyState, ErrorState, LoadingState` (+ vendor/management sets per spec §45). Every one: loading/loaded/empty/error/disabled/partial/success.
- Motion: `motion/react` only; per-surface timing from brief. 3D lazy (`next/dynamic`, DPR≤2, dispose, pause offscreen, static fallback).
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RAZORPAY_KEY_ID` (public only). Secrets server-only.
