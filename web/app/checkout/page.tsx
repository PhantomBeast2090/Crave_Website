"use client";
import { useState } from "react";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { DEMO_FOODS } from "@/lib/domain/demo";
import { inr } from "@/lib/domain/types";
import { useApp } from "@/components/providers";
import { isDemoMode } from "@/lib/supabase/env";

const SLOTS = ["12:30 PM", "1:00 PM", "1:30 PM", "7:00 PM"];

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const [slot, setSlot] = useState(SLOTS[0]);
  const [method, setMethod] = useState<"PAY_AT_COUNTER" | "ONLINE">("PAY_AT_COUNTER");
  const [placed, setPlaced] = useState<string | null>(null);
  const lines = cart.map((l) => ({ ...l, food: DEMO_FOODS.find((f) => f.id === l.foodId)! })).filter((l) => l.food);
  const subtotal = lines.reduce((a, l) => a + l.food.price * l.qty, 0);
  const total = subtotal + Math.round(subtotal * 0.05);

  if (placed) {
    return (
      <ConsumerShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 grid place-items-center text-2xl" aria-hidden>✓</div>
          <h1 className="font-display text-3xl font-bold mt-4">Order placed!</h1>
          <p className="text-ink-2">Order <strong className="text-ink tabular">{placed}</strong> · {slot} pickup.</p>
          <p className="text-sm text-ink-2 mt-1">{isDemoMode ? "Demo mode: no Supabase write happened. Connect env for live place_order RPC." : "Track it live from Orders."}</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Link href={`/orders/${placed}`} className="px-4 py-3 rounded-m bg-ink text-white font-bold min-h-11">Track order</Link>
            <Link href="/" className="px-4 py-3 rounded-m border border-line font-bold min-h-11">Home</Link>
          </div>
        </div>
      </ConsumerShell>
    );
  }

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <p className="text-sm text-ink-2">Review → slot → payment. Calm, deliberate, no surprises.</p>
        <section className="mt-4 bg-surface border border-line rounded-l p-4" aria-label="Items">
          <h2 className="font-bold">1 · Items ({lines.length})</h2>
          {lines.map((l) => <p key={l.foodId} className="text-sm flex justify-between py-1"><span>{l.qty}× {l.food.name}</span><span className="tabular">{inr(l.food.price * l.qty)}</span></p>)}
        </section>
        <section className="mt-3 bg-surface border border-line rounded-l p-4" aria-label="Pickup slot">
          <h2 className="font-bold">2 · Pickup slot</h2>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Pickup slot">
            {SLOTS.map((s) => (
              <button key={s} role="radio" aria-checked={slot === s} onClick={() => setSlot(s)}
                className={`px-3 py-3 rounded-m border text-sm font-bold min-h-11 ${slot === s ? "bg-ink text-white border-ink" : "bg-base border-line"}`}>{s}</button>
            ))}
          </div>
        </section>
        <section className="mt-3 bg-surface border border-line rounded-l p-4" aria-label="Payment">
          <h2 className="font-bold">3 · Payment · <span className="tabular">{inr(total)}</span></h2>
          <div className="mt-2 grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
            {(["PAY_AT_COUNTER", "ONLINE"] as const).map((m) => (
              <button key={m} role="radio" aria-checked={method === m} onClick={() => setMethod(m)}
                className={`px-3 py-3 rounded-m border text-sm font-bold min-h-11 text-left ${method === m ? "border-accent bg-accent-soft" : "border-line bg-base"}`}>
                {m === "PAY_AT_COUNTER" ? "Pay at counter" : "Online (Razorpay)"}
                <span className="block text-xs font-normal text-ink-2">{m === "PAY_AT_COUNTER" ? "Cash/UPI at pickup" : "Cards, UPI, netbanking via Checkout.js"}</span>
              </button>
            ))}
          </div>
          {method === "ONLINE" && isDemoMode && <p className="mt-2 text-xs text-ink-2">Demo: Razorpay Checkout.js loads with live keys. No charge happens here.</p>}
        </section>
        <button disabled={lines.length === 0} onClick={() => { const id = "GAG-" + Math.random().toString(36).slice(2, 8).toUpperCase(); setPlaced(id); clearCart(); }}
          className="mt-4 w-full h-12 rounded-m bg-accent text-accent-ink font-bold hover:bg-accent-deep disabled:opacity-50 min-h-11">
          Place pickup order · {inr(total)}
        </button>
      </div>
    </ConsumerShell>
  );
}
