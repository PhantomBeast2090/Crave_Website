"use client";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function P() {
  const { session, loading } = useSession();
  const [s, setS] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!session) return;
    createClient().rpc("get_management_analytics").then(({ data, error }) => {
      if (error) setErr(error.message); else setS(data as Record<string, number>);
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
        <div className="mt-3"><ChartCard title="Conversion funnel" empty="Home → search → view → cart → checkout → paid → picked up. Event tracking lands with the analytics-events migration — today's funnel is derived from order states only." /></div>
      </>)}
    </OpsShell>
  );
}
