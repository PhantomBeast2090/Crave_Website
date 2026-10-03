"use client";
import { useEffect, useState } from "react";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { ORDER_COPY } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { one } from "@/lib/utils";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface Row { id: string; order_number: string; status: string; total: number; created_at: string; outletName: string; }

export default function MgmtOrders() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    createClient().from("orders").select("id,order_number,status,total,created_at,outlets(name)").order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows(((data ?? []) as unknown as (Omit<Row, "outletName"> & { outlets: { name: string } | { name: string }[] | null })[]).map((o) => ({ ...o, outletName: one(o.outlets)?.name ?? "" }))); });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Orders" sub="Sign in."><RequireSignIn action="inspect orders" /></OpsShell>;
  return (
    <OpsShell title="Orders" sub="Latest 100 across campus. RLS decides visibility.">
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Orders didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {rows === null && !err && <p className="text-ink-2" role="status">Loading…</p>}
      <div className="space-y-2">
        {rows?.map((o) => (
          <div key={o.id} className="bg-surface border border-line rounded-l p-3 text-sm flex gap-2 flex-wrap items-center">
            <span className="font-bold tabular">{o.order_number}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-surface-2 border border-line">{ORDER_COPY[o.status as keyof typeof ORDER_COPY] ?? o.status}</span>
            <span className="text-ink-2">{o.outletName}</span>
            <span className="ml-auto tabular">₹{Number(o.total).toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
      {rows?.length === 0 && <ChartCard title="No orders" empty="No orders visible to this account." />}
    </OpsShell>
  );
}
