"use client";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { DEMO_FOODS } from "@/lib/domain/demo";
import { inr } from "@/lib/domain/types";
import { useApp } from "@/components/providers";
import { EmptyState } from "@/components/cards";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, setQty, clearCart } = useApp();
  const lines = cart.map((l) => ({ ...l, food: DEMO_FOODS.find((f) => f.id === l.foodId)! })).filter((l) => l.food);
  const subtotal = lines.reduce((a, l) => a + l.food.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Cart</h1>
        {lines.length === 0 ? (
          <EmptyState title="Your cart is feeling lonely." body="Add something delicious — your usuals are one tap away."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Browse food</Link>} />
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.foodId} className="bg-surface border border-line rounded-l p-3 flex gap-3 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.food.image} alt="" className="w-16 h-16 rounded-m object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{l.food.name}</p>
                    <p className="text-xs text-ink-2">{l.food.outletName} · {inr(l.food.price)} each</p>
                    <div className="mt-1 inline-flex items-center border border-line rounded-m" role="group" aria-label={`Quantity for ${l.food.name}`}>
                      <button onClick={() => setQty(l.foodId, l.qty - 1)} className="p-2 min-w-11 min-h-11" aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-7 text-center font-bold tabular">{l.qty}</span>
                      <button onClick={() => setQty(l.foodId, l.qty + 1)} className="p-2 min-w-11 min-h-11" aria-label="Increase"><Plus size={14} /></button>
                    </div>
                  </div>
                  <p className="font-bold tabular">{inr(l.food.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-surface border border-line rounded-l p-4 text-sm space-y-1">
              <p className="flex justify-between"><span>Item total</span><span className="tabular">{inr(subtotal)}</span></p>
              <p className="flex justify-between"><span>Tax (5% GST)</span><span className="tabular">{inr(tax)}</span></p>
              <p className="flex justify-between font-display font-bold text-lg pt-1 border-t border-line"><span>Total</span><span className="tabular">{inr(subtotal + tax)}</span></p>
              <p className="text-xs text-ink-2">Server re-prices from DB at checkout. Single-outlet carts only.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={clearCart} className="px-4 py-3 rounded-m border border-line font-bold inline-flex items-center gap-1.5 min-h-11"><Trash2 size={15} /> Clear</button>
              <Link href="/checkout" className="flex-1 text-center px-4 py-3 rounded-m bg-accent text-accent-ink font-bold hover:bg-accent-deep min-h-11">Review order →</Link>
            </div>
          </>
        )}
      </div>
    </ConsumerShell>
  );
}
