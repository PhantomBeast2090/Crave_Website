"use client";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { EmptyState } from "@/components/cards";
import { inr } from "@/lib/domain/types";
import { useApp } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
export default function P() {
  const { session, loading } = useSession();
  const { addToCart } = useApp();
  const [last, setLast] = useState<{ id: string; order_number: string; order_items: { food_name: string; quantity: number; food_item_id: string | null }[] } | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => { if (!session) return;
    createClient().from("orders").select("id,order_number,order_items(food_name,quantity,food_item_id)").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.length) setLast(data[0] as { id: string; order_number: string; order_items: { food_name: string; quantity: number; food_item_id: string | null }[] }); });
  }, [session]);
  if (!loading && !session) return <ConsumerShell><RequireSignIn action="reorder" /></ConsumerShell>;
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Your usual?</h1>
        {!last && !loading && <EmptyState title="No previous orders." body="Your last order will appear here for one-tap reorder." action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Browse food</Link>} />}
        {last && (
          <div className="mt-4 bg-surface border border-line rounded-l p-4">
            <p className="font-bold tabular">{last.order_number}</p>
            {last.order_items.map((it, i) => <p key={i} className="text-sm text-ink-2">{it.quantity}× {it.food_name}</p>)}
            <button disabled={done} onClick={() => { last.order_items.forEach((it) => { if (it.food_item_id) addToCart({ foodId: it.food_item_id, qty: it.quantity, options: [] }); }); setDone(true); }}
              className="mt-3 px-4 py-3 rounded-m bg-accent-deep text-white font-bold disabled:opacity-60 min-h-11">
              {done ? "Added — review in cart" : "Reorder these items"}
            </button>
            {done && <Link href="/cart" className="ml-3 underline font-bold text-sm">Go to cart →</Link>}
            <p className="mt-2 text-xs text-ink-2">Prices refresh live — {inr(0).slice(0, 1)} totals are recomputed, never copied from history.</p>
          </div>
        )}
      </div>
    </ConsumerShell>
  );
}
