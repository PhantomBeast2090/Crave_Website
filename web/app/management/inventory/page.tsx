"use client";
import { OpsShell } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { one } from "@/lib/utils";
export default function P() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<{ food_item_id: string; quantity_available: number; low_stock_threshold: number; foodName: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!session) return;
    createClient().from("inventory").select("food_item_id,quantity_available,low_stock_threshold,food_items(name)").order("quantity_available").limit(200)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows(((data ?? []) as unknown as { food_item_id: string; quantity_available: number; low_stock_threshold: number; food_items: { name: string } | { name: string }[] | null }[]).map((r) => ({ ...r, foodName: one(r.food_items)?.name ?? r.food_item_id.slice(0, 8) }))); });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Inventory" sub="Sign in."><RequireSignIn action="inspect inventory" /></OpsShell>;
  const low = (rows ?? []).filter((r) => r.quantity_available <= (r.low_stock_threshold ?? 10)).length;
  return (
    <OpsShell title="Inventory" sub={rows ? `${low} of ${rows.length} items at/below threshold.` : "Campus stock health."}>
      {err && <p className="text-sm text-error" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      <div className="grid sm:grid-cols-2 gap-2">{rows?.map((r) => (
        <div key={r.food_item_id} className="bg-surface border border-line rounded-l p-3 text-sm">
          <p className="font-bold">{r.foodName}</p>
          <p className="tabular">{r.quantity_available} left · threshold {r.low_stock_threshold ?? 10}</p>
        </div>))}
      </div>
    </OpsShell>
  );
}
