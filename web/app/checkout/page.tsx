"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { inr } from "@/lib/domain/types";
import { useApp } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { one } from "@/lib/utils";
import { listSlots, type LiveSlot } from "@/lib/data/live";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface Row { id: string; name: string; price: number; is_veg: boolean; is_available: boolean; outlet_id: string; outlets: { name: string } | null; }

function istDate(offsetDays: number): string {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

declare global { interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, cb: (r: Record<string, string>) => void) => void }; } }

function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { cart, clearCart } = useApp();
  const { session, loading: authLoading } = useSession();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [dateIdx, setDateIdx] = useState(0);
  const [slots, setSlots] = useState<LiveSlot[]>([]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [method, setMethod] = useState<"PAY_AT_COUNTER" | "ONLINE">("PAY_AT_COUNTER");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);

  const dates = useMemo(() => [0, 1, 2, 3].map(istDate), []);
  const lines = cart.map((l) => ({ ...l, food: rows[l.foodId] })).filter((l) => l.food);
  const outletIds = [...new Set(lines.map((l) => l.food!.outlet_id))];
  const outletId = outletIds.length === 1 ? outletIds[0] : null;
  const subtotal = lines.reduce((a, l) => a + l.food!.price * l.qty, 0);
  const total = subtotal + Math.round(subtotal * 0.05);
  const activeSlotId = slots.some((s) => s.id === slotId) ? slotId : null;

  useEffect(() => {
    if (!cart.length) return;
    const ids = [...new Set(cart.map((l) => l.foodId))];
    fetch(`${supabaseUrl}/rest/v1/food_items?select=id,name,price,is_veg,is_available,outlet_id,outlets(name)&id=in.(${ids.join(",")})`,
      { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } })
      .then((r) => r.json()).then((d: Record<string, unknown>[]) => { const m: Record<string, Row> = {}; d.forEach((x) => { const r2 = x as unknown as Row & { outlets: { name: string } | { name: string }[] | null }; m[r2.id] = { ...r2, outlets: one(r2.outlets) }; }); setRows(m); })
      .catch(() => setErr("Couldn't load your items. Retry."));
  }, [cart]);

  useEffect(() => {
    if (!outletId) return;
    const day = dates[dateIdx];
    listSlots(outletId, day).then((s) => {
      setSlots(s);
      setSlotId((cur) => (s.some((x) => x.id === cur) ? cur : null));
    }).catch(() => setErr("Couldn't load pickup slots for that day."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletId, dateIdx]);

  async function syncServerCart(sb: ReturnType<typeof createClient>, userId: string, oid: string): Promise<string> {
    const { data: existing } = await sb.from("carts").select("id").eq("user_id", userId).limit(1).maybeSingle();
    let cartId: string;
    if (existing) {
      cartId = (existing as { id: string }).id;
      await sb.from("carts").update({ outlet_id: oid }).eq("id", cartId);
      await sb.from("cart_items").delete().eq("cart_id", cartId);
    } else {
      const { data, error } = await sb.from("carts").insert({ user_id: userId, outlet_id: oid }).select("id").single();
      if (error) throw new Error("Couldn't prepare your order. " + error.message);
      cartId = (data as { id: string }).id;
    }
    const payload = lines.map((l) => ({ cart_id: cartId, food_item_id: l.foodId, quantity: l.qty, price: l.food!.price, is_veg: l.food!.is_veg }));
    const { error } = await sb.from("cart_items").insert(payload);
    if (error) throw new Error("Couldn't prepare your items. " + error.message);
    return cartId;
  }

  async function submit() {
    if (!session || !outletId || !activeSlotId) return;
    setBusy(true); setErr(null);
    const { trackEvent } = await import("@/lib/analytics/events");
    trackEvent({ name: "checkout_started", metadata: { outletId, items: lines.length, total } });
    try {
      const sb = createClient();
      const cartId = await syncServerCart(sb, session.userId, outletId);
      const { data, error } = await sb.rpc("place_order", { p_cart_id: cartId, p_pickup_slot_id: activeSlotId, p_payment_method: method });
      if (error) throw new Error(mapRpcError(error.message));
      const orderId = data as string;
      if (method === "ONLINE") {
        await payOnline(sb, orderId);
      }
      trackEvent({ name: "order_completed", entityType: "order", entityId: orderId, metadata: { method, total } });
      clearCart();
      setPlaced(orderId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Order placement failed. Your items are kept — retry.");
    } finally {
      setBusy(false);
    }
  }

  function mapRpcError(msg: string): string {
    if (/slot|capacity|FULL/i.test(msg)) return "That slot just filled — pick the next one. Your items are kept.";
    if (/stock|inventory/i.test(msg)) return "Something in your cart just sold out — remove it and retry.";
    if (/closed|outlet/i.test(msg)) return "That outlet just closed — try a later slot or another outlet.";
    return msg || "Order placement failed. Your items are kept — retry.";
  }

  async function payOnline(sb: ReturnType<typeof createClient>, orderId: string) {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) throw new Error("Online payment isn't configured for this outlet yet — switch to pay at counter. Nothing was charged.");
    const ok = await loadRazorpay();
    if (!ok || !window.Razorpay) throw new Error("Couldn't load the payment window. Retry, or pay at counter. Nothing was charged.");
    const { data, error } = await sb.functions.invoke("create-razorpay-order", { body: { order_id: orderId } });
    if (error) throw new Error("Couldn't start online payment. Retry, or pay at counter. Nothing was charged.");
    const details = data as { razorpay_order_id: string; amount: number; key_id: string; currency: string };
    await new Promise<void>((resolve, reject) => {
      const rz = new window.Razorpay!({
        key: details.key_id || keyId, amount: details.amount, currency: details.currency ?? "INR",
        order_id: details.razorpay_order_id, name: "CRAVE",
        handler: (resp: Record<string, string>) => {
          sb.functions.invoke("verify-razorpay-payment", {
            body: { order_id: orderId, razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature },
          }).then(({ error: vErr }) => (vErr ? reject(new Error("Payment verification failed — if you were charged, it will auto-refund. Contact support with order " + orderId + ".")) : resolve()));
        },
        modal: { ondismiss: () => reject(new Error("Payment window closed. No amount was charged — retry or pay at counter.")) },
      });
      rz.open();
    });
  }

  if (!authLoading && !session) {
    return <ConsumerShell><RequireSignIn action="check out" /></ConsumerShell>;
  }

  if (placed) {
    return (
      <ConsumerShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 grid place-items-center text-2xl" aria-hidden>✓</div>
          <h1 className="font-display text-3xl font-bold mt-4">Order placed!</h1>
          <p className="text-ink-2 text-sm tabular">Order {placed.slice(0, 8)}…</p>
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
        <p className="text-sm text-ink-2">Review → slot → payment. Server re-prices everything; this total is a preview.</p>
        {outletIds.length > 1 && (
          <div className="mt-3 border border-citrus bg-amber-50 rounded-l p-4" role="alert">
            <p className="font-bold">Your cart spans {outletIds.length} outlets.</p>
            <p className="text-sm text-ink-2">Checkout handles one outlet at a time. <Link href="/cart" className="underline font-bold">Fix this in your cart →</Link></p>
          </div>
        )}
        <section className="mt-4 bg-surface border border-line rounded-l p-4" aria-label="Items">
          <h2 className="font-bold">1 · Items ({lines.length}) · {lines[0]?.food?.outlets?.name ?? ""}</h2>
          {lines.map((l) => <p key={l.foodId} className="text-sm flex justify-between py-1"><span>{l.qty}× {l.food!.name}</span><span className="tabular">{inr(l.food!.price * l.qty)}</span></p>)}
          <p className="text-sm flex justify-between pt-2 border-t border-line font-bold"><span>Total (preview)</span><span className="tabular">{inr(total)}</span></p>
        </section>
        <section className="mt-3 bg-surface border border-line rounded-l p-4" aria-label="Pickup slot">
          <h2 className="font-bold">2 · Pickup slot</h2>
          <div className="mt-2 flex gap-2" role="group" aria-label="Day">
            {dates.map((d, i) => (
              <button key={d} onClick={() => setDateIdx(i)} aria-pressed={dateIdx === i}
                className={`px-3 py-2.5 rounded-m border text-sm font-bold min-h-11 ${dateIdx === i ? "bg-ink text-white border-ink" : "border-line bg-base"}`}>
                {i === 0 ? "Today" : d.slice(5)}
              </button>
            ))}
          </div>
          {slots.length === 0 ? (
            <p className="mt-2 text-sm text-ink-2">No slots published for this day yet — the outlet releases them daily. Try another day.</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Time slot">
              {slots.map((s) => (
                <button key={s.id} role="radio" aria-checked={activeSlotId === s.id} disabled={s.status === "FULL"}
                  onClick={() => setSlotId(s.id)}
                  className={`px-2 py-3 rounded-m border text-sm font-bold min-h-11 ${activeSlotId === s.id ? "bg-ink text-white border-ink" : "border-line bg-base"} disabled:opacity-40`}>
                  {s.start.slice(0, 5)}
                  <span className="block text-[11px] font-semibold opacity-70">{s.status === "FULL" ? "Full" : s.status === "LIMITED" ? "Filling fast" : "Available"}</span>
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="mt-3 bg-surface border border-line rounded-l p-4" aria-label="Payment">
          <h2 className="font-bold">3 · Payment</h2>
          <div className="mt-2 grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
            {(["PAY_AT_COUNTER", "ONLINE"] as const).map((m) => (
              <button key={m} role="radio" aria-checked={method === m} onClick={() => setMethod(m)}
                className={`px-3 py-3 rounded-m border text-sm font-bold min-h-11 text-left ${method === m ? "border-accent bg-accent-soft" : "border-line bg-base"}`}>
                {m === "PAY_AT_COUNTER" ? "Pay at counter" : "Online (Razorpay)"}
              </button>
            ))}
          </div>
        </section>
        {err && <div className="mt-3 border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Something didn&apos;t go through.</p><p className="text-sm text-ink-2">{err}</p></div>}
        <button disabled={!outletId || !activeSlotId || busy || lines.length === 0} onClick={submit}
          className="mt-4 w-full h-12 rounded-m bg-accent-deep text-white font-bold hover:bg-ink disabled:opacity-50 min-h-11">
          {busy ? "Placing…" : `Place pickup order · ${inr(total)}`}
        </button>
      </div>
    </ConsumerShell>
  );
}
