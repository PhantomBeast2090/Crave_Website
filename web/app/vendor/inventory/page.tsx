"use client";
import { useEffect, useState } from "react";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface Row { food_item_id: string; quantity_available: number; low_stock_threshold: number; food_items: { name: string } | null; }

export default function VendorInventory() {
  const { session, loading: authLoading } = useSession();
  const { outlets } = useVendor();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!outlets?.length) return;
    createClient().from("inventory").select("food_item_id,quantity_available,low_stock_threshold,food_items!inner(name,outlet_id)")
      .in("food_items.outlet_id", outlets.map((o) => o.id)).order("quantity_available").limit(200)
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setRows((data ?? []) as unknown as Row[]);
      });
  }, [outlets]);

  if (!authLoading && !session) return <OpsShell title="Inventory" sub="Sign in."><RequireSignIn action="see inventory" /></OpsShell>;

  const low = rows?.filter((r) => r.quantity_available <= (r.low_stock_threshold ?? 10)) ?? [];
  return (
    <OpsShell title="Inventory" sub={rows ? `${low.length} of ${rows.length} items at or below threshold.` : "Stock levels per dish."}>
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Inventory didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {rows === null && !err && <p className="text-ink-2" role="status">Loading stock…</p>}
      {rows?.length === 0 && <ChartCard title="No inventory rows" empty="New dishes get stock rows automatically from the inventory trigger." />}
      <div className="grid sm:grid-cols-2 gap-2">
        {rows?.map((r) => {
          const state = r.quantity_available <= 0 ? "OUT" : r.quantity_available <= (r.low_stock_threshold ?? 10) ? "LOW" : "OK";
          return (
            <div key={r.food_item_id} className={`bg-surface border rounded-l p-3 text-sm ${state === "OK" ? "border-line" : "border-warning"}`}>
              <p className="font-bold">{r.food_items?.name}</p>
              <p className="tabular">{r.quantity_available} left · threshold {r.low_stock_threshold ?? 10} · <strong>{state === "OK" ? "In stock" : state === "LOW" ? "Low stock" : "Out of stock"}</strong></p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-2">Stock decrements atomically in <code>place_order</code> and restores on cancel/reject. Manual adjustments land with the inventory-write migration.</p>
    </OpsShell>
  );
}
