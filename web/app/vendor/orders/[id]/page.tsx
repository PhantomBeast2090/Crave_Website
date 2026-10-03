"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OpsShell } from "@/components/ops-shell";
import { ORDER_COPY, type OrderStatus } from "@/lib/domain/types";
import { inr } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface Detail {
  id: string; order_number: string; status: OrderStatus; subtotal: number; tax: number; total: number;
  payment_status: string; payment_method: string; special_instructions: string | null; created_at: string;
  user_id: string;
  pickup_slots: { slot_date: string; start_time: string; end_time: string } | { slot_date: string; start_time: string; end_time: string }[] | null;
  order_items: { food_name: string; quantity: number; unit_price: number; total_price: number }[];
}

export default function VendorOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { session, loading } = useSession();
  const [o, setO] = useState<Detail | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  async function load() {
    const sb = createClient();
    const { data, error } = await sb.from("orders")
      .select("id,order_number,status,subtotal,tax,total,payment_status,payment_method,special_instructions,created_at,user_id,pickup_slots(slot_date,start_time,end_time),order_items(food_name,quantity,unit_price,total_price)")
      .eq("id", id).maybeSingle();
    if (error) { setErr(error.message); return; }
    if (!data) { setErr("Order not found or not visible to this account."); return; }
    setO(data as unknown as Detail);
    const { data: prof } = await sb.from("profiles").select("name").eq("id", (data as unknown as Detail).user_id).maybeSingle();
    if (prof) setCustomer((prof as { name: string }).name);
  }

  useEffect(() => {
    if (!session || !id) return;
    // External subscription (Supabase realtime) + initial load; the
    // synchronous setState this rule targets does not apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const sb = createClient();
    const ch = sb.channel(`vendor:order:${id}`).on(
      "postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, load
    ).subscribe();
    return () => { sb.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  async function act(rpc: string, extra?: Record<string, unknown>) {
    setActing(true); setErr(null);
    try {
      const sb = createClient();
      const { error } = await sb.rpc(rpc, { p_order_id: id, ...(extra ?? {}) });
      if (error) throw new Error(error.message);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed. Retry.");
    } finally {
      setActing(false);
    }
  }

  if (!loading && !session) return <OpsShell title="Order detail" sub="Sign in."><RequireSignIn action="inspect orders" /></OpsShell>;

  const slot = Array.isArray(o?.pickup_slots) ? o?.pickup_slots[0] : o?.pickup_slots;

  return (
    <OpsShell title={o ? `Order ${o.order_number}` : "Order detail"} sub={o ? `${customer ?? "Customer"} · ${new Date(o.created_at).toLocaleString("en-IN")} · ${o.payment_method === "PAY_AT_COUNTER" ? "Pay at counter" : o.payment_status}` : "Live order detail."}>
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Couldn&apos;t complete that.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {!o && !err && <p className="text-ink-2" role="status">Loading order…</p>}
      {o && (
        <>
          <p className="inline-block text-sm font-bold px-3 py-1.5 rounded-pill bg-surface border border-line" role="status">{ORDER_COPY[o.status] ?? o.status}</p>
          <div className="mt-3 bg-surface border border-line rounded-l p-4 text-sm space-y-1">
            {o.order_items.map((it, i) => <p key={i} className="flex justify-between"><span>{it.quantity}× {it.food_name}</span><span className="tabular">{inr(Number(it.total_price))}</span></p>)}
            <p className="flex justify-between pt-1 border-t border-line font-bold"><span>Total</span><span className="tabular">{inr(Number(o.total))}</span></p>
            {slot && <p className="text-ink-2">Pickup {slot.slot_date} · {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}</p>}
            {o.special_instructions && <p className="text-ink-2">Note: {o.special_instructions}</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {o.status === "PLACED" && (<>
              <button disabled={acting} onClick={() => act("vendor_accept_order")} className="px-4 py-3 rounded-m bg-ink text-white text-sm font-bold min-h-11">Accept order</button>
              <button disabled={acting} onClick={() => act("vendor_reject_order", { p_reason: "Rejected by vendor" })} className="px-4 py-3 rounded-m border border-error text-error text-sm font-bold min-h-11">Reject</button>
            </>)}
            {o.status === "ACCEPTED" && <button disabled={acting} onClick={() => act("vendor_start_preparing")} className="px-4 py-3 rounded-m bg-ink text-white text-sm font-bold min-h-11">Start preparing</button>}
            {o.status === "PREPARING" && <button disabled={acting} onClick={() => act("vendor_mark_ready")} className="px-4 py-3 rounded-m bg-accent-deep text-white text-sm font-bold min-h-11">Mark ready</button>}
            {o.status === "READY" && <p className="text-sm text-ink-2">Waiting for pickup scan — use the QR scanner when the student arrives.</p>}
          </div>
          <p className="mt-4 text-sm"><Link href="/vendor/orders" className="underline">← All orders</Link> · <Link href="/vendor/qr-scanner" className="underline font-bold">Open QR scanner →</Link></p>
        </>
      )}
    </OpsShell>
  );
}
