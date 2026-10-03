"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { EmptyState } from "@/components/cards";
import { ORDER_COPY, type OrderStatus } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { one } from "@/lib/utils";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface OrderRow { id: string; order_number: string; status: OrderStatus; total: number; outlet_id: string; created_at: string; outletName: string; }

export default function OrdersPage() {
  const { session, loading } = useSession();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const sb = createClient();
    sb.from("orders").select("id,order_number,status,total,outlet_id,created_at,outlets(name)").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(50)
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setOrders(((data ?? []) as unknown as (Omit<OrderRow, "outletName"> & { outlets: { name: string } | { name: string }[] | null })[]).map((o) => ({ ...o, outletName: one(o.outlets)?.name ?? "Outlet" })));
      });
    const ch = sb.channel("public:orders").on(
      "postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${session.userId}` },
      () => {
        sb.from("orders").select("id,order_number,status,total,outlet_id,created_at,outlets(name)").eq("user_id", session!.userId).order("created_at", { ascending: false }).limit(50)
          .then(({ data }) => { if (data) setOrders((data as unknown as (Omit<OrderRow, "outletName"> & { outlets: { name: string } | { name: string }[] | null })[]).map((o) => ({ ...o, outletName: one(o.outlets)?.name ?? "Outlet" }))); });
      }
    ).subscribe();
    return () => { sb.removeChannel(ch); };
  }, [session]);

  if (!loading && !session) return <ConsumerShell><RequireSignIn action="see your orders" /></ConsumerShell>;

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        {loading && <p className="mt-4 text-ink-2" role="status">Loading your orders…</p>}
        {err && <div className="mt-4 border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Orders didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
        {!loading && !err && orders?.length === 0 && (
          <EmptyState title="Your order history is feeling lonely." body="Order something and track it here, live."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Browse food</Link>} />
        )}
        <div className="mt-4 space-y-2">
          {orders?.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block bg-surface border border-line rounded-l p-4 hover:shadow-far">
              <div className="flex items-center gap-2">
                <p className="font-bold tabular">{o.order_number}</p>
                <span className="text-[11px] font-bold px-2 py-1 rounded-pill bg-surface-2 border border-line">{ORDER_COPY[o.status] ?? o.status}</span>
                <span className="ml-auto text-xs text-ink-2">₹{Number(o.total).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-sm text-ink-2 mt-1">{o.outletName} · {new Date(o.created_at).toLocaleString("en-IN")}</p>
            </Link>
          ))}
        </div>
      </div>
    </ConsumerShell>
  );
}
