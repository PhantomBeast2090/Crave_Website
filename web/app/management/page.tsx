"use client";
import Link from "next/link";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";

type Stats = Record<string, number>;

export default function ManagementHome() {
  const { session, loading } = useSession();
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    createClient().rpc("get_management_analytics").then(({ data, error }) => {
      if (error) setErr(error.message);
      else setS(data as Stats);
    });
  }, [session]);

  if (!loading && !session) return <OpsShell title="Management overview" sub="Sign in as admin."><RequireSignIn action="command the campus" /></OpsShell>;

  return (
    <OpsShell title="Management overview" sub="The entire campus in one command centre. Server-aggregated, admin-gated.">
      {loading && <p className="text-ink-2" role="status">Loading campus stats…</p>}
      {err && (
        <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert">
          <p className="font-bold">Campus stats need an admin account.</p>
          <p className="text-sm text-ink-2">{err}</p>
        </div>
      )}
      {s && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Orders today" value={String(s.ordersToday ?? 0)} />
            <Kpi label="Revenue today" value={`₹${Number(s.revenueToday ?? 0).toLocaleString("en-IN")}`} />
            <Kpi label="Active orders" value={String(s.activeOrders ?? 0)} />
            <Kpi label="Students" value={String(s.totalStudents ?? 0)} />
            <Kpi label="Vendors" value={String(s.totalVendors ?? 0)} />
            <Kpi label="Active outlets" value={`${s.activeOutlets ?? 0}/${s.totalOutlets ?? 0}`} />
            <Kpi label="Available items" value={`${s.availableFoodItems ?? 0}/${s.totalFoodItems ?? 0}`} />
            <Kpi label="Completed" value={String(s.completedOrders ?? 0)} />
          </div>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <ChartCard title="This week">
              <p className="mt-2 text-sm tabular">{s.ordersThisWeek ?? 0} orders · ₹{Number(s.revenueThisWeek ?? 0).toLocaleString("en-IN")}</p>
            </ChartCard>
            <ChartCard title="This month">
              <p className="mt-2 text-sm tabular">{s.ordersThisMonth ?? 0} orders · ₹{Number(s.revenueThisMonth ?? 0).toLocaleString("en-IN")}</p>
            </ChartCard>
          </div>
          <p className="mt-3 text-sm"><Link href="/management/analytics" className="underline font-bold">Open analytics →</Link></p>
        </>
      )}
    </OpsShell>
  );
}
