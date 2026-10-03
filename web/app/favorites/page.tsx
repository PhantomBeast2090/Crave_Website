"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, EmptyState } from "@/components/cards";
import type { LiveFood } from "@/lib/data/live";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { useApp } from "@/components/providers";
import { one } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/data/authed";

export default function FavoritesPage() {
  const { favs } = useApp();
  const { session } = useSession();
  const [items, setItems] = useState<LiveFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let ids = [...favs];
        if (session) {
          const sb = createClient();
          const { data } = await sb.from("favorites").select("food_item_id").eq("user_id", session.userId);
          if (data) ids = [...new Set([...ids, ...(data as { food_item_id: string }[]).map((r) => r.food_item_id)])];
        }
        if (!ids.length) { setItems([]); return; }
        const r = await fetch(
          `${supabaseUrl}/rest/v1/food_items?select=id,name,description,price,image_url,is_veg,is_available,prep_time_minutes,rating,total_reviews,outlet_id,category_id,outlets(name),categories(name)&id=in.(${ids.join(",")})`,
          { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
        );
        const d = await r.json();
        setItems((d as Record<string, never>[]).map((x) => ({
          id: String(x.id), name: String(x.name), description: String(x.description ?? ""), price: Number(x.price),
          imageUrl: (x.image_url as string | null) ?? null, isVeg: Boolean(x.is_veg), isAvailable: Boolean(x.is_available),
          prepMin: Number(x.prep_time_minutes ?? 5), rating: Number(x.rating ?? 0), totalReviews: Number(x.total_reviews ?? 0),
          outletId: String(x.outlet_id), outletName: String(one(x.outlets as { name: string } | { name: string }[] | null)?.name ?? ""),
          categoryId: String(x.category_id ?? ""), categoryName: String(one(x.categories as { name: string } | { name: string }[] | null)?.name ?? ""), tags: [],
        })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [favs, session]);

  // Sync device saves to server when signed in (honest merge, never overwrite server)
  useEffect(() => {
    if (!session || !favs.length) return;
    const sb = createClient();
    sb.from("favorites").select("food_item_id").eq("user_id", session.userId).then(({ data }) => {
      const have = new Set((data ?? [] as { food_item_id: string }[]).map((r) => r.food_item_id));
      const missing = favs.filter((id) => !have.has(id)).map((food_item_id) => ({ user_id: session.userId, food_item_id }));
      if (missing.length) sb.from("favorites").insert(missing).then(() => undefined);
    });
  }, [session, favs]);

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Your shelf</h1>
        <p className="text-ink-2 text-sm">{session ? "Device saves merged with your account." : "Saved on this device — sign in to sync across devices."}</p>
        {loading && <p className="mt-4 text-ink-2" role="status">Loading your shelf…</p>}
        {!loading && items.length === 0 && (
          <EmptyState title="Nothing here yet. Let's fix that." body="Tap the heart on any dish and it lives here."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Discover food</Link>} />
        )}
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
      </div>
    </ConsumerShell>
  );
}
