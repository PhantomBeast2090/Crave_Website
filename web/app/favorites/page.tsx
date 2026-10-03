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
import { slugify } from "@/lib/slug";

interface SavedOutlet { id: string; name: string; is_open: boolean; }

export default function FavoritesPage() {
  const { favs, favOutlets } = useApp();
  const { session } = useSession();
  const [items, setItems] = useState<LiveFood[]>([]);
  const [outlets, setOutlets] = useState<SavedOutlet[]>([]);
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
        if (ids.length) {
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
        } else {
          setItems([]);
        }
        if (favOutlets.length) {
          const ro = await fetch(
            `${supabaseUrl}/rest/v1/outlets?select=id,name,is_open&id=in.(${favOutlets.join(",")})`,
            { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
          );
          setOutlets(ro.ok ? ((await ro.json()) as SavedOutlet[]) : []);
        } else {
          setOutlets([]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [favs, favOutlets, session]);

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

  const empty = !loading && items.length === 0 && outlets.length === 0;

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Your shelf</h1>
        <p className="text-ink-2 text-sm">{session ? "Device saves merged with your account." : "Saved on this device — sign in to sync across devices."}</p>
        {loading && <p className="mt-4 text-ink-2" role="status">Loading your shelf…</p>}
        {empty && (
          <EmptyState title="Nothing here yet. Let's fix that." body="Tap the heart on any dish or outlet and it lives here."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Discover food</Link>} />
        )}
        {outlets.length > 0 && (
          <>
            <h2 className="font-display text-xl font-bold mt-6">Saved outlets</h2>
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {outlets.map((o) => (
                <Link key={o.id} href={`/outlets/${slugify(o.name)}`} className="bg-surface border border-line rounded-l p-4 hover:shadow-far">
                  <p className="font-display font-bold">{o.name}</p>
                  <p className={`mt-1 text-[11px] font-bold inline-block px-2 py-0.5 rounded-pill ${o.is_open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{o.is_open ? "Open" : "Closed"}</p>
                </Link>
              ))}
            </div>
          </>
        )}
        {items.length > 0 && (
          <>
            <h2 className="font-display text-xl font-bold mt-6">Saved dishes</h2>
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((f) => <FoodCard key={f.id} food={f} />)}
            </div>
          </>
        )}
      </div>
    </ConsumerShell>
  );
}
