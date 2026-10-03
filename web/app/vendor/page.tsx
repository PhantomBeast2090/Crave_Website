import Link from "next/link";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";

export default function VendorHome() {
  return (
    <OpsShell title="Vendor command" sub="Today's queue, revenue and prep performance — Biryani Blues Cart (demo).">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Orders today" value="84" delta="+12%" />
        <Kpi label="Revenue today" value="₹11,240" delta="+8%" />
        <Kpi label="Active orders" value="9" />
        <Kpi label="Avg prep" value="14 min" delta="−2 min" />
        <Kpi label="Acceptance" value="96%" />
        <Kpi label="Rating" value="4.5 ★" />
        <Kpi label="Low stock" value="3 items" />
        <Kpi label="Queue" value="Medium" />
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <ChartCard title="Hourly orders (live RPC when configured)">
          <div className="mt-2 flex items-end gap-1 h-24" role="img" aria-label="Hourly orders bar chart, peak at 1 PM">
            {[3, 5, 9, 18, 24, 16, 10, 7].map((h, i) => <span key={i} className="flex-1 rounded-sm bg-accent" style={{ height: `${(h / 24) * 100}%`, opacity: 0.45 + (h / 24) * 0.55 }} />)}
          </div>
        </ChartCard>
        <ChartCard title="Live queue — 1-click transitions">
          <div className="mt-2 space-y-2">
            {[["#GAG-7K2Q9A", "2× Biryani", "6 min", "Start preparing"], ["#GAG-7K2P11", "3× Momos", "11 min", "Mark ready"]].map(([id, items, age, action]) => (
              <div key={id} className="flex items-center gap-2 text-sm border border-line rounded-m p-2.5">
                <span className="font-bold tabular">{id}</span>
                <span className="text-ink-2">{items} · {age} in queue</span>
                <Link href="/vendor/orders" className="ml-auto px-3 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11 inline-flex items-center">{action}</Link>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </OpsShell>
  );
}
