"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { ORDER_COPY, ORDER_FLOW, type OrderStatus } from "@/lib/domain/types";
import { inr } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface Detail {
  id: string; order_number: string; status: OrderStatus; subtotal: number; tax: number; total: number;
  payment_status: string; payment_method: string; special_instructions: string | null;
  outlets: { name: string } | null;
  pickup_slots: { slot_date: string; start_time: string; end_time: string } | null;
  order_items: { food_name: string; quantity: number; unit_price: number; total_price: number }[];
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, loading } = useSession();
  const [o, setO] = useState<Detail | null>(null);
  const [qr, setQr] = useState<{ token: string; expires: string } | null>(null);
  const [qrErr, setQrErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    const sb = createClient();
    sb.from("orders")
      .select("id,order_number,status,subtotal,tax,total,payment_status,payment_method,special_instructions,outlets(name),pickup_slots(slot_date,start_time,end_time),order_items(food_name,quantity,unit_price,total_price)")
      .eq("id", id).maybeSingle()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else if (!data) setErr("Order not found — it may belong to a different account.");
        else setO(data as unknown as Detail);
      });
    const ch = sb.channel(`order:${id}`).on(
      "postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
      (payload) => setO((prev) => (prev && payload.new ? { ...prev, status: (payload.new as { status: OrderStatus }).status } : prev))
    ).subscribe();
    // QR token: needs the 018 owner SELECT policy; without it this 403s honestly.
    sb.from("pickup_tokens").select("token_value,expires_at").eq("order_id", id).maybeSingle()
      .then(({ data, error }) => {
        if (error) setQrErr("QR unavailable right now.");
        else if (data) setQr({ token: (data as { token_value: string }).token_value, expires: (data as { expires_at: string }).expires_at });
      });
    return () => { sb.removeChannel(ch); };
  }, [session, id]);

  if (!loading && !session) return <ConsumerShell><RequireSignIn action="track this order" /></ConsumerShell>;

  const idx = o ? ORDER_FLOW.indexOf(o.status) : -1;

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading && <p className="text-ink-2" role="status">Loading order…</p>}
        {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Order didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
        {o && (
          <>
            <p className="text-sm text-ink-2"><Link href="/orders" className="underline">Orders</Link> / <span className="tabular">{o.order_number}</span></p>
            <h1 className="font-display text-3xl font-bold mt-1 tabular">{o.order_number}</h1>
            <p className="text-sm text-ink-2">{o.outlets?.name} · {o.pickup_slots ? `${o.pickup_slots.slot_date} ${o.pickup_slots.start_time.slice(0, 5)}` : ""} · {inr(Number(o.total))} · {o.payment_method === "PAY_AT_COUNTER" ? "Pay at counter" : o.payment_status}</p>
            <ol className="mt-6" aria-label="Order timeline">
              {ORDER_FLOW.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <div className="flex flex-col items-center" aria-hidden>
                    <span className={`w-4 h-4 rounded-full border-2 ${idx >= 0 && i <= idx ? "bg-green-600 border-green-600" : "bg-surface border-line"}`} />
                    {i < ORDER_FLOW.length - 1 && <span className={`w-0.5 flex-1 min-h-6 ${idx > i ? "bg-green-600" : "bg-line"}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`font-bold ${idx >= 0 && i <= idx ? "" : "text-ink-3"}`}>{ORDER_COPY[s]}</p>
                  </div>
                </li>
              ))}
            </ol>
            {!ORDER_FLOW.includes(o.status) && <p className="font-bold" role="status">Status: {ORDER_COPY[o.status] ?? o.status}</p>}
            <div className="mt-2 bg-surface border border-line rounded-l p-4 text-sm space-y-1">
              {o.order_items.map((it, i) => <p key={i} className="flex justify-between"><span>{it.quantity}× {it.food_name}</span><span className="tabular">{inr(Number(it.total_price))}</span></p>)}
              <p className="flex justify-between pt-1 border-t border-line font-bold"><span>Total</span><span className="tabular">{inr(Number(o.total))}</span></p>
            </div>
            {o.status === "READY" && (
              <div className="mt-3 bg-ink text-white rounded-l p-5 flex gap-4 items-center">
                <span className="w-20 h-20 rounded-m bg-white grid place-items-center text-ink shrink-0" aria-hidden><QrCode size={44} /></span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg">Ready to grab</p>
                  {qr ? (
                    <p className="text-sm text-white/70 tabular break-all">Token {qr.token.slice(0, 12)}…{qr.token.slice(-6)} · show this screen at the counter</p>
                  ) : (
                    <p className="text-sm text-white/70">{qrErr ?? "Fetching your pickup token…"}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ConsumerShell>
  );
}
