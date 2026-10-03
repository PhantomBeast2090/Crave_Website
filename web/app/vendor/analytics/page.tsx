"use client";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

export default function VendorAnalytics() {
  const { session, loading: authLoading } = useSession();
  const { orders } = useVendor();
  if (!authLoading && !session) return <OpsShell title="Analytics" sub="Sign in."><RequireSignIn action="see analytics" /></OpsShell>;

  const done = (orders ?? []).filter((o) => o.status === "PICKED_UP");
  const revenue = done.reduce((a, o) => a + Number(o.total), 0);
  const byItem = new Map<string, number>();
  done.forEach((o) => o.order_items.forEach((it) => byItem.set(it.food_name, (byItem.get(it.food_name) ?? 0) + it.quantity)));
  const top = [...byItem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = Math.max(1, ...top.map(([, q]) => q));

  return (
    <OpsShell title="Analytics" sub="Computed from your real orders — no sample data.">
      {!orders && <p className="text-ink-2" role="status">Crunching your orders…</p>}
      {orders && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Completed" value={String(done.length)} />
            <Kpi label="Revenue (picked up)" value={`₹${revenue.toLocaleString("en-IN")}`} />
            <Kpi label="Avg order" value={done.length ? `₹${Math.round(revenue / done.length).toLocaleString("en-IN")}` : "—"} />
            <Kpi label="Cancelled / rejected" value={String(orders.filter((o) => ["CANCELLED", "REJECTED"].includes(o.status)).length)} />
          </div>
          <div className="mt-3"><ChartCard title="Top sellers (completed orders)">
            {top.length === 0 ? <p className="text-sm text-ink-2 mt-2">No completed orders yet — this fills in as pickups complete.</p> : (
              <ol className="mt-2 space-y-1.5">
                {top.map(([name, q]) => (
                  <li key={name} className="flex items-center gap-2 text-sm">
                    <span className="w-48 truncate font-bold">{name}</span>
                    <span className="flex-1 h-2.5 rounded-pill bg-surface-2 overflow-hidden"><span className="block h-full bg-accent rounded-pill" style={{ width: `${(q / topMax) * 100}%` }} /></span>
                    <span className="w-10 text-right tabular">{q}</span>
                  </li>
                ))}
              </ol>
            )}
          </ChartCard></div>
        </>
      )}
    </OpsShell>
  );
}
