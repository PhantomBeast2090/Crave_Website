"use client";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function P() {
  const { session, loading } = useSession();
  const [s, setS] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [funnel, setFunnel] = useState<{ placed: number; accepted: number; ready: number; picked: number; rejected: number; cancelled: number } | null>(null);
  useEffect(() => { if (!session) return;
    createClient().rpc("get_management_analytics").then(({ data, error }) => {
      if (error) setErr(error.message); else setS(data as Record<string, number>);
    });
    // Order-state funnel from the latest 1000 orders (server-aggregated RPCs
    // would replace this once the events migration lands).
    createClient().from("orders").select("status").order("created_at", { ascending: false }).limit(1000)
      .then(({ data, error }) => {
        if (error || !data) return;
        const has = (st: string) => (data as { status: string }[]).filter((o) => o.status === st).length;
        const placed = has("PLACED"), accepted = has("ACCEPTED"), preparing = has("PREPARING"), ready = has("READY"), picked = has("PICKED_UP");
        setFunnel({
          placed: placed + accepted + preparing + ready + picked,
          accepted: accepted + preparing + ready + picked,
          ready: ready + picked,
          picked,
          rejected: has("REJECTED"),
          cancelled: has("CANCELLED") + has("EXPIRED"),
        });
      });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Analytics" sub="Sign in."><RequireSignIn action="see analytics" /></OpsShell>;
  return (
    <OpsShell title="Analytics" sub="get_management_analytics · IST day/week/month. Funnels + search analytics land with the events migration.">
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Analytics need an admin account.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {!s && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      {s && (<>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Orders today" value={String(s.ordersToday ?? 0)} />
          <Kpi label="Revenue today" value={`₹${Number(s.revenueToday ?? 0).toLocaleString("en-IN")}`} />
          <Kpi label="Cash revenue" value={`₹${Number(s.cashRevenue ?? 0).toLocaleString("en-IN")}`} />
          <Kpi label="Razorpay revenue" value={`₹${Number(s.razorpayRevenue ?? 0).toLocaleString("en-IN")}`} />
          <Kpi label="Completed" value={String(s.completedOrders ?? 0)} />
          <Kpi label="Cancelled" value={String(s.cancelledOrders ?? 0)} />
          <Kpi label="Rejected" value={String(s.rejectedOrders ?? 0)} />
          <Kpi label="Refunded ₹" value={`₹${Number(s.refundedAmount ?? 0).toLocaleString("en-IN")}`} />
        </div>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <ChartCard title="Order-state funnel (latest 1000 orders)">
            {!funnel && <p className="text-sm text-ink-2 mt-2">Deriving from order states…</p>}
            {funnel && (
              <ol className="mt-2 space-y-1.5">
                {[["Placed", funnel.placed], ["Accepted+", funnel.accepted], ["Ready+", funnel.ready], ["Picked up", funnel.picked]].map(([label, v]) => (
                  <li key={label as string} className="flex items-center gap-2 text-sm">
                    <span className="w-24 font-bold">{label}</span>
                    <span className="flex-1 h-3 rounded-pill bg-surface-2 overflow-hidden">
                      <span className="block h-full bg-cobalt rounded-pill" style={{ width: funnel.placed ? `${(Number(v) / funnel.placed) * 100}%` : "0%" }} />
                    </span>
                    <span className="w-12 text-right tabular">{v}</span>
                    <span className="w-12 text-right tabular text-ink-2">{funnel.placed ? `${Math.round((Number(v) / funnel.placed) * 100)}%` : "—"}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm pt-1 border-t border-line">
                  <span className="w-24 font-bold">Lost</span>
                  <span className="text-ink-2">{funnel.rejected} rejected · {funnel.cancelled} cancelled/expired</span>
                </li>
              </ol>
            )}
          </ChartCard>
          <ChartCard title="What it doesn't show (yet)" empty="Home → search → view → cart → checkout steps need the analytics-events migration. This funnel starts at order placement — the kitchen half of the story." />
        </div>
      </>)}
    </OpsShell>
  );
}
