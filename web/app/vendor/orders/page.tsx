"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { AgeChip, beep, breach, useNow } from "@/components/queue-age";
import { ORDER_COPY, type OrderStatus } from "@/lib/domain/types";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

const FILTERS: ("ALL" | OrderStatus)[] = ["ALL", "PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "REJECTED", "CANCELLED"];

export default function VendorOrders() {
  const { session, loading: authLoading } = useSession();
  const { orders, err, acting, act } = useVendor();
  const [f, setF] = useState<(typeof FILTERS)[number]>("ALL");
  const now = useNow();
  const [sound, setSound] = useState(() => typeof window !== "undefined" && localStorage.getItem("crave-urgent-sound") === "on");
  const prevBreach = useRef(0);

  const breachCount = (orders ?? []).filter((o) => breach(o.status, o.created_at, now)).length;
  useEffect(() => {
    if (sound && breachCount > prevBreach.current) beep();
    prevBreach.current = breachCount;
  }, [breachCount, sound]);
  if (!authLoading && !session) return <OpsShell title="Vendor orders" sub="Sign in."><RequireSignIn action="see orders" /></OpsShell>;
  const list = (orders ?? []).filter((o) => f === "ALL" || o.status === f);
  return (
    <OpsShell title="Vendor orders" sub="Realtime feed for your outlet. Paid-gated by RLS: online orders appear once paid.">
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Orders didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1" role="group" aria-label="Status filter">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)} aria-pressed={f === x}
            className={`px-3 py-2 rounded-pill border text-sm font-bold whitespace-nowrap min-h-11 ${f === x ? "bg-ink text-white border-ink" : "bg-surface border-line"}`}>{x}</button>
        ))}
        </div>
        <label className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap shrink-0">
          <input type="checkbox" checked={sound} onChange={(e) => { setSound(e.target.checked); localStorage.setItem("crave-urgent-sound", e.target.checked ? "on" : "off"); }} className="w-4 h-4" />
          Urgency sound
        </label>
      </div>
      <div className="mt-3 space-y-2">
        {list.length === 0 && !err && <ChartCard title="No orders" empty={orders === null ? "Loading…" : "Nothing in this state. New orders arrive live."} />}
        {list.map((o) => (
          <div key={o.id} className="bg-surface border border-line rounded-l p-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/vendor/orders/${o.id}`} className="font-bold tabular underline">{o.order_number}</Link>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-surface-2 border border-line">{ORDER_COPY[o.status] ?? o.status}</span>
              <AgeChip status={o.status} createdAt={o.created_at} now={now} />
              <span className="text-ink-2">₹{Number(o.total).toLocaleString("en-IN")} · {o.payment_method === "PAY_AT_COUNTER" ? "Counter" : o.payment_status}</span>
              <span className="ml-auto flex gap-1">
                {o.status === "PLACED" && <><button disabled={!!acting} onClick={() => act("vendor_accept_order", o.id)} className="px-2.5 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11">Accept</button><button disabled={!!acting} onClick={() => act("vendor_reject_order", o.id, { p_reason: "Rejected by vendor" })} className="px-2.5 py-2 rounded-m border border-line text-xs font-bold min-h-11">Reject</button></>}
                {o.status === "ACCEPTED" && <button disabled={!!acting} onClick={() => act("vendor_start_preparing", o.id)} className="px-2.5 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11">Start preparing</button>}
                {o.status === "PREPARING" && <button disabled={!!acting} onClick={() => act("vendor_mark_ready", o.id)} className="px-2.5 py-2 rounded-m bg-accent-deep text-white text-xs font-bold min-h-11">Mark ready</button>}
              </span>
            </div>
            <p className="text-ink-2 mt-1">{o.order_items.map((it) => `${it.quantity}× ${it.food_name}`).join(", ")}</p>
          </div>
        ))}
      </div>
    </OpsShell>
  );
}
