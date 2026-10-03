import { OpsShell, ChartCard } from "@/components/ops-shell";

const PAGES: Record<string, { t: string; s: string; b: string }> = {
  orders: { t: "Vendor orders", s: "New → accepted → preparing → ready → completed. Minimal clicks.", b: "Queue columns with age + SLA warnings render here; actions call vendor_accept/reject/start_preparing/mark_ready RPCs." },
  menu: { t: "Menu management", s: "Prices, availability, variants, prep time — inline edit + preview.", b: "Food list with availability toggles (live) and price editor (wires UpdateFoodPriceUseCase equivalent)." },
  inventory: { t: "Inventory", s: "Stock levels, thresholds, low-stock alerts.", b: "Per-item cards: qty, threshold, IN_STOCK / LOW / OUT. Adjust flow writes via RPC when backend 020 lands." },
  analytics: { t: "Vendor analytics", s: "Demand, revenue, prep, ratings — with prev-period compare.", b: "Hourly revenue, top items, payment mix, prep trend, rating trend, peak heatmap. Server-aggregated; methodology labelled." },
  reviews: { t: "Vendor reviews", s: "Ratings, replies, complaint themes.", b: "Distribution + trend + reply composer (1 per review). No invented sentiment." },
  promotions: { t: "Promotions", s: "Outlet offers on coupons infra.", b: "Create time-boxed codes with min-order / max-discount / usage limits." },
  settings: { t: "Vendor settings", s: "Hours, pickup capacity, profile.", b: "Operating hours editor + slot capacity defaults." },
};

export default async function VendorSub() {
  return <OpsShell title="Vendor command" sub="Select a section from the sidebar."><ChartCard title="Vendor module" empty="This demo route renders the shell + KPIs. Full CRUD wires to Supabase when env is set." /></OpsShell>;
}

export function VendorSubPage({ slug }: { slug: keyof typeof PAGES }) {
  const p = PAGES[slug];
  return (
    <OpsShell title={p.t} sub={p.s}>
      <ChartCard title={p.t} empty={p.b} />
    </OpsShell>
  );
}
