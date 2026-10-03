# CRAVE Analytics Spec — real data, server-aggregated

> Existing `get_management_analytics()` (017) is point-in-time only. This spec adds events + funnels without browser computation.

## 1. Events (one table + views, PII-minimal)

`analytics_events(id, user_id?, session_id, event_name, entity_type?, entity_id?, metadata JSONB, created_at)` + `search_events(query, filters, result_count, latency_ms, clicked_id?)`. Indexed `(event_name, created_at)`, `(entity_type, entity_id)`, GIN metadata. RLS: insert authed, read admin/service only. Central `trackEvent()` bus; sampled client flush (beacon, offline queue).

Funnels: `home → search/discovery → food/outlet view → add_to_cart → checkout → payment_attempt → order_placed → picked_up`. Drop-off = previous − next per session/day.

## 2. Vendor dashboard

KPIs: orders/revenue today, AOV, active/completed, accept/reject/cancel %, avg prep, queue depth, availability %, low-stock, rating, repeat %. Charts: hourly orders/revenue, daily trend, top items, category sales, payment mix, prep trend, rating trend, availability, peak heatmap. Filters today/yesterday/7d/30d/custom + prev-period compare (methodology labelled).

## 3. Management command centre

KPIs: orders, active/completed, revenue/net/AOV, students/vendors/outlets/active, availability, repeat, refunds/cancels/rejects. Charts: revenue/order trends, hourly + dow demand, outlet ranking (revenue + volume), vendor performance, category, payment mix, cancel/reject reasons, pickup congestion, inventory health, search→order conversion, cart abandonment, repeat rate, zero-result gap table.

All via RPC/materialised views (`daily_metrics`, `hourly_demand`, `funnel_daily`), never full-scan in browser. Empty/loading/error states per chart.
