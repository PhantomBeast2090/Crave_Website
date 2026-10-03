"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { EmptyState } from "@/components/cards";
import { inr } from "@/lib/domain/types";
import { useApp } from "@/components/providers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { one } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface Row { id: string; name: string; price: number; image_url: string | null; is_available: boolean; outlet_id: string; outlets: { name: string } | null; }

export default function CartPage() {
  const { cart, setQty, clearCart, removeMany } = useApp();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0) return;
    const ids = [...new Set(cart.map((l) => l.foodId))];
    if (ids.every((id) => id in rows)) return;
    fetch(`${supabaseUrl}/rest/v1/food_items?select=id,name,price,image_url,is_available,outlet_id,outlets(name)&id=in.(${ids.join(",")})`,
      { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } })
      .then(async (r) => { if (!r.ok) throw new Error(`Cart refresh failed (${r.status})`); return r.json(); })
      .then((d: Record<string, unknown>[]) => setRows((prev) => { const m = { ...prev }; d.forEach((x) => { const r = x as unknown as Row & { outlets: { name: string } | { name: string }[] | null }; m[r.id] = { ...r, outlets: one(r.outlets) }; }); return m; }))
      .catch((e) => setErr(e instanceof Error ? e.message : "Couldn't refresh prices."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const lines = cart.map((l) => ({ ...l, food: rows[l.foodId] })).filter((l) => l.food);
  const refreshing = cart.length > 0 && cart.some((l) => !(l.foodId in rows)) && !err;
  const missing = cart.length > 0 && !refreshing && !err && lines.length < cart.length;
  const outletIds = [...new Set(lines.map((l) => l.food!.outlet_id))];
  const conflict = outletIds.length > 1;
  const subtotal = lines.reduce((a, l) => a + l.food!.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.05);

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Cart</h1>
        {refreshing && <p className="mt-4 text-ink-2" role="status">Refreshing live prices…</p>}
        {err && <div className="mt-4 border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Prices didn&apos;t refresh.</p><p className="text-sm text-ink-2">{err} Nothing was lost.</p></div>}
        {!refreshing && lines.length === 0 && !err && (
          <EmptyState title="Your cart is feeling lonely." body="Add something delicious — browse the live catalogue."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Browse food</Link>} />
        )}
        {missing && <p className="mt-3 text-sm text-warning font-bold" role="note">Some items are no longer listed and were skipped — the kitchen may have removed them.</p>}
        {conflict && (
          <div className="mt-3 border border-citrus bg-amber-50 rounded-l p-4" role="alert">
            <p className="font-bold">One outlet per order.</p>
            <p className="text-sm text-ink-2">CRAVE places single-outlet orders (the kitchen confirms one queue at a time). Keep one outlet&apos;s items to check out.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {outletIds.map((oid) => (
                <button key={oid} onClick={() => removeMany(lines.filter((l) => l.food!.outlet_id === oid).map((l) => l.foodId))}
                  className="px-3 py-2 rounded-m border border-line bg-surface text-sm font-bold min-h-11">Remove {rows[lines.find((l) => l.food!.outlet_id === oid)!.foodId]?.outlets?.name ?? "these items"}</button>
              ))}
            </div>
          </div>
        )}
        {lines.length > 0 && (
          <>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.foodId} className="bg-surface border border-line rounded-l p-3 flex gap-3 items-center">
                  {l.food!.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.food!.image_url} alt="" className="w-16 h-16 rounded-m object-cover" />
                  ) : (
                    <span className="w-16 h-16 rounded-m bg-surface-2 grid place-items-center font-display font-bold text-xl text-ink-3" aria-hidden>{l.food!.name.charAt(0)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{l.food!.name}</p>
                    <p className="text-xs text-ink-2">{l.food!.outlets?.name} · {inr(l.food!.price)} each {!l.food!.is_available && "· currently unavailable"}</p>
                    <div className="mt-1 inline-flex items-center border border-line rounded-m" role="group" aria-label={`Quantity for ${l.food!.name}`}>
                      <button onClick={() => setQty(l.foodId, l.qty - 1)} className="p-2 min-w-11 min-h-11" aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-7 text-center font-bold tabular">{l.qty}</span>
                      <button onClick={() => setQty(l.foodId, l.qty + 1)} className="p-2 min-w-11 min-h-11" aria-label="Increase"><Plus size={14} /></button>
                    </div>
                  </div>
                  <p className="font-bold tabular">{inr(l.food!.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-surface border border-line rounded-l p-4 text-sm space-y-1">
              <p className="flex justify-between"><span>Item total</span><span className="tabular">{inr(subtotal)}</span></p>
              <p className="flex justify-between"><span>Tax (5% GST, re-computed server-side)</span><span className="tabular">{inr(tax)}</span></p>
              <p className="flex justify-between font-display font-bold text-lg pt-1 border-t border-line"><span>Total</span><span className="tabular">{inr(subtotal + tax)}</span></p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={clearCart} className="px-4 py-3 rounded-m border border-line font-bold inline-flex items-center gap-1.5 min-h-11"><Trash2 size={15} /> Clear</button>
              {conflict ? (
                <span className="flex-1 text-center px-4 py-3 rounded-m bg-surface-2 text-ink-2 font-bold min-h-11">Resolve the outlet conflict to continue</span>
              ) : (
                <Link href="/checkout" className="flex-1 text-center px-4 py-3 rounded-m bg-accent-deep text-white font-bold hover:bg-ink min-h-11">Review order →</Link>
              )}
            </div>
          </>
        )}
      </div>
    </ConsumerShell>
  );
}
