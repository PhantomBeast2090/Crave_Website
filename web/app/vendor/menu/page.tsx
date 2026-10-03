"use client";
import { useEffect, useState } from "react";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { inr } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface Item { id: string; name: string; price: number; is_available: boolean; outlet_id: string; }

export default function VendorMenu() {
  const { session, loading: authLoading } = useSession();
  const { outlets } = useVendor();
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!outlets?.length) return;
    createClient().from("food_items")
      .select("id,name,price,is_available,outlet_id").in("outlet_id", outlets.map((o) => o.id)).order("name").limit(200)
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setItems((data ?? []) as Item[]);
      });
  }, [outlets]);

  async function toggle(id: string, v: boolean) {
    setErr(null);
    const { error } = await createClient().from("food_items").update({ is_available: v }).eq("id", id);
    if (error) setErr(error.message);
    else setItems((prev) => prev?.map((it) => (it.id === id ? { ...it, is_available: v } : it)) ?? null);
  }

  async function savePrice(id: string) {
    const v = Number(priceEdits[id]);
    if (!Number.isFinite(v) || v <= 0) { setErr("Price must be above ₹0 — the database enforces it."); return; }
    const { error } = await createClient().from("food_items").update({ price: v }).eq("id", id);
    if (error) setErr(error.message);
    else { setItems((prev) => prev?.map((it) => (it.id === id ? { ...it, price: v } : it)) ?? null); setPriceEdits((p) => { const n = { ...p }; delete n[id]; return n; }); }
  }

  if (!authLoading && !session) return <OpsShell title="Menu" sub="Sign in."><RequireSignIn action="manage your menu" /></OpsShell>;

  return (
    <OpsShell title="Menu" sub="Availability toggles apply instantly. Prices save per item.">
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Menu update failed.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {items === null && !err && <p className="text-ink-2" role="status">Loading menu…</p>}
      {items?.length === 0 && <ChartCard title="Empty menu" empty="No food items for your outlet yet." />}
      <div className="space-y-2">
        {items?.map((it) => (
          <div key={it.id} className="bg-surface border border-line rounded-l p-3 text-sm flex items-center gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate">{it.name}</p>
              <p className="tabular text-ink-2">{inr(Number(it.price))}</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={it.is_available} onChange={(e) => toggle(it.id, e.target.checked)} className="w-5 h-5 accent-[#1F9D55]" aria-label={`Available: ${it.name}`} />
              Available
            </label>
            <span className="inline-flex items-center gap-1">
              <label htmlFor={`p-${it.id}`} className="sr-only">Price for {it.name}</label>
              <input id={`p-${it.id}`} value={priceEdits[it.id] ?? ""} onChange={(e) => setPriceEdits((p) => ({ ...p, [it.id]: e.target.value }))} inputMode="decimal" placeholder={String(it.price)}
                className="w-20 h-11 px-2 rounded-m border border-line bg-base tabular" />
              <button onClick={() => savePrice(it.id)} className="px-3 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11">Save</button>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-2">New dishes, variants and photos are added by management onboarding today — inline creation lands with the menu-upgrade migration.</p>
    </OpsShell>
  );
}
