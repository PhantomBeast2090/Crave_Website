"use client";
import Link from "next/link";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
import { AgeChip, useNow } from "@/components/queue-age";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

function todayIST(): string {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).toISOString().slice(0, 10);
}

export default function VendorHome() {
  const { session, loading: authLoading } = useSession();
  const { outlets, orders, err, acting, act } = useVendor();
  const now = useNow();
  if (!authLoading && !session) return <OpsShell title="Vendor command" sub="Sign in as a vendor."><RequireSignIn action="run your outlet" /></OpsShell>;

  const today = todayIST();
  const todays = orders?.filter((o) => o.created_at.slice(0, 10) === today) ?? [];
  const revenue = todays.filter((o) => o.status === "PICKED_UP").reduce((a, o) => a + Number(o.total), 0);
  const active = orders?.filter((o) => ["PLACED", "ACCEPTED", "PREPARING", "READY"].includes(o.status)) ?? [];
  const decided = orders?.filter((o) => ["ACCEPTED", "PREPARING", "READY", "PICKED_UP", "REJECTED"].includes(o.status)) ?? [];
  const accepted = decided.filter((o) => o.status !== "REJECTED").length;
  const hours = new Array(12).fill(0);
  todays.forEach((o) => { const h = new Date(o.created_at).getHours(); const i = Math.min(11, Math.max(0, h - 8)); hours[i]++; });
  const max = Math.max(1, ...hours);

  return (
    <OpsShell title="Vendor command" sub={outlets?.length ? outlets.map((o) => o.name).join(" · ") : "Your outlets, queue and revenue."}>
      {!outlets && !err && <p className="text-ink-2" role="status">Loading your outlets…</p>}
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Vendor data didn&apos;t load.</p><p className="text-sm text-ink-2">{err} (Vendor accounts see only their own outlet&apos;s orders.)</p></div>}
      {outlets?.length === 0 && !err && (
        <ChartCard title="No outlet assigned" empty="This account isn't linked to an outlet yet (profiles → outlets.vendor_id). Ask management to link you, then this dashboard lights up." />
      )}
      {(outlets?.length ?? 0) > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Orders today" value={String(todays.length)} />
            <Kpi label="Revenue today (picked up)" value={`₹${revenue.toLocaleString("en-IN")}`} />
            <Kpi label="Active orders" value={String(active.length)} />
            <Kpi label="Acceptance" value={decided.length ? `${Math.round((accepted / decided.length) * 100)}%` : "—"} />
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <ChartCard title="Hourly orders today (8 AM → 8 PM)">
              <div className="mt-2 flex items-end gap-1 h-24" role="img" aria-label={`Orders per hour today, total ${todays.length}`}>
                {hours.map((h, i) => <span key={i} className="flex-1 rounded-sm bg-accent" style={{ height: `${Math.max(4, (h / max) * 100)}%`, opacity: h ? 0.5 + (h / max) * 0.5 : 0.2 }} />)}
              </div>
            </ChartCard>
            <ChartCard title="Live queue — one tap per state">
              <div className="mt-2 space-y-2">
                {active.length === 0 && <p className="text-sm text-ink-2">Queue clear. New orders arrive here live.</p>}
                {active.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center gap-2 text-sm border border-line rounded-m p-2.5">
                    <span className="font-bold tabular">{o.order_number}</span>
                    <span className="text-ink-2 truncate">{o.order_items.map((it) => `${it.quantity}× ${it.food_name}`).join(", ")}</span>
                    <AgeChip status={o.status} createdAt={o.created_at} now={now} />
                    <span className="ml-auto flex gap-1">
                      {o.status === "PLACED" && <><button disabled={!!acting} onClick={() => act("vendor_accept_order", o.id)} className="px-2.5 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11">Accept</button><button disabled={!!acting} onClick={() => act("vendor_reject_order", o.id, { p_reason: "Rejected by vendor" })} className="px-2.5 py-2 rounded-m border border-line text-xs font-bold min-h-11">Reject</button></>}
                      {o.status === "ACCEPTED" && <button disabled={!!acting} onClick={() => act("vendor_start_preparing", o.id)} className="px-2.5 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11">Start preparing</button>}
                      {o.status === "PREPARING" && <button disabled={!!acting} onClick={() => act("vendor_mark_ready", o.id)} className="px-2.5 py-2 rounded-m bg-accent-deep text-white text-xs font-bold min-h-11">Mark ready</button>}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/vendor/orders" className="mt-2 inline-block text-sm underline font-bold">All orders →</Link>
            </ChartCard>
          </div>
        </>
      )}
    </OpsShell>
  );
}
