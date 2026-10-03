# CRAVE Search Spec — deterministic, explainable, extensible

> Wraps existing `search_food` RPC (004). No ML claims. All signals in code, tunable.

## 1. Contract

`search_food(p_query, p_outlet_id?, p_category?, p_is_veg?, p_max_price?, p_available_only=true)` → JSONB list (LIMIT 100) with flat `outlet_name, category_name`. Server: `ILIKE name/description/tags`, privileged bypass for vendor/admin, students always availability-filtered, `ORDER BY exact-name → is_popular → rating`. Anon+authed grants.

Web adds a **ranking layer** (`lib/search/rank.ts`) over RPC rows — deterministic weights, all logged:

```
score = 100*nameExact + 40*namePrefix + 25*wordMatch + 15*tagMatch + 10*categoryMatch
      + 8*is_popular + 6*rating_norm + 4*reviewCount_log + 5*outletOpen + 3*available
      - 8*prepSlow_norm - 5*priceHigh_norm(time-adjusted) + userBoosts(fav/outlet history, ≤10)
```

Sorts: relevance (default) · rating · price asc/desc · prep · popularity · newest. Filters: veg/non-veg, price max, rating min, prep max, category, outlet, availability, offers, dietary tags. `minRating/maxPrep` (Android filter fields never sent) are applied client-side until RPC extended.

## 2. Rules

- Server-side only. Never load full catalogue. Debounce 300ms, min 2 chars (or active category). Abort stale.
- URL-synced: `/search?q=&cat=&veg=&sort=` — back/refresh/deep-link safe.
- Availability/outlet-open enforced server-side; client shows closed with reason, never orderable.
- Empty: first-use ("Search cravings, outlets, categories…") vs no-results ("That craving escaped us. ‘{q}’ found nothing. [Clear filters]") vs error (retry, keep query).

## 3. Analytics (`search_events`)

`search_started, search_submitted, search_result_clicked, food_viewed, outlet_viewed, filter_applied, sort_applied, add_to_cart, checkout_started, order_completed` + `zero_result(q, filters)` + `latency_ms`. Management sees: top queries, zero-result gap ("what students want that Crave isn't serving"), CTR, search→cart→order funnel.
