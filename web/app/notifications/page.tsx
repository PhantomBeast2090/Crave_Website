"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { EmptyState } from "@/components/cards";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface N { id: string; title: string; body: string; order_id: string | null; is_read: boolean; created_at: string; }

export default function NotificationsPage() {
  const { session, loading } = useSession();
  const [items, setItems] = useState<N[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const sb = createClient();
    const load = () => sb.from("notifications").select("id,title,body,order_id,is_read,created_at").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(50)
      .then(({ data, error }) => { if (error) setErr(error.message); else setItems((data ?? []) as N[]); });
    load();
    const ch = sb.channel("public:notifications").on(
      "postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.userId}` }, load
    ).subscribe();
    return () => { sb.removeChannel(ch); };
  }, [session]);

  async function markRead(id: string) {
    const sb = createClient();
    await sb.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((prev) => prev?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? null);
  }

  if (!loading && !session) return <ConsumerShell><RequireSignIn action="see notifications" /></ConsumerShell>;

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        {loading && <p className="mt-4 text-ink-2" role="status">Loading…</p>}
        {err && <div className="mt-4 border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Notifications didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
        {!loading && !err && items?.length === 0 && (
          <EmptyState title="All quiet." body="Order updates, pickup reminders and offers land here."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Browse food</Link>} />
        )}
        <div aria-live="polite" className="mt-4 space-y-2">
          {items?.map((n) => (
            <article key={n.id} className={`bg-surface border rounded-l p-4 ${n.is_read ? "border-line" : "border-ink"}`}>
              <div className="flex items-center gap-2">
                <h2 className="font-bold">{n.title}</h2>
                {!n.is_read && <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-accent-deep text-white">New</span>}
                <span className="ml-auto text-xs text-ink-2">{new Date(n.created_at).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-sm text-ink-2">{n.body}</p>
              <div className="mt-1 flex gap-3 text-sm">
                {n.order_id && <Link href={`/orders/${n.order_id}`} className="underline font-bold">View order</Link>}
                {!n.is_read && <button onClick={() => markRead(n.id)} className="underline">Mark read</button>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </ConsumerShell>
  );
}
