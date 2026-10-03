"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, EmptyState } from "@/components/cards";
import type { LiveFood } from "@/lib/data/live";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

type Sort = "relevance" | "price-asc" | "price-desc";

function mapSearchRows(rows: Record<string, never>[]): LiveFood[] {
  return rows.map((x) => ({
    id: String(x.id), name: String(x.name), description: String(x.description ?? ""), price: Number(x.price),
    imageUrl: (x.image_url as string | null) ?? null, isVeg: Boolean(x.is_veg), isAvailable: Boolean(x.is_available),
    prepMin: Number(x.prep_time_minutes ?? 5), rating: Number(x.rating ?? 0), totalReviews: Number(x.total_reviews ?? 0),
    outletId: String(x.outlet_id), outletName: String(x.outlet_name ?? ""), categoryId: (x.category_id as string | null) ?? null,
    categoryName: String(x.category_name ?? ""), tags: [],
  }));
}

function score(f: LiveFood, words: string[]): number {
  const name = f.name.toLowerCase();
  let s = 0;
  for (const w of words) {
    if (name.includes(w)) s += 25;
    if (f.tags.some((t) => t.toLowerCase().includes(w))) s += 15;
    if (f.categoryName.toLowerCase().includes(w)) s += 10;
    if (f.description.toLowerCase().includes(w)) s += 5;
  }
  if (f.outletName) s += 1;
  return s;
}

function SearchBody() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [committed, setCommitted] = useState(initial);
  const [items, setItems] = useState<LiveFood[] | null>(initial ? null : []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!initial);
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<Sort>("relevance");

  async function run(query: string) {
    const qq = query.trim();
    if (qq.length < 2) { setItems([]); return; }
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/rpc/search_food`, {
        method: "POST",
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_query: qq }),
      });
      if (!r.ok) throw new Error(`Search failed (${r.status})`);
      setItems(mapSearchRows(await r.json()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed. Check your connection and retry — your query is kept.");
    } finally {
      setLoading(false);
    }
  }

  // Run initial ?q= on mount (query param is fixed for the page lifetime).
  // loading is already initialised to !!initial, so the effect only resolves.
  useEffect(() => {
    const qq = initial.trim();
    if (qq.length < 2) return;
    let on = true;
    (async () => {
      try {
        const r = await fetch(`${supabaseUrl}/rest/v1/rpc/search_food`, {
          method: "POST",
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ p_query: qq }),
        });
        if (!r.ok) throw new Error(`Search failed (${r.status})`);
        const rows = await r.json();
        if (on) setItems(mapSearchRows(rows));
      } catch (e) {
        if (on) setError(e instanceof Error ? e.message : "Search failed. Check your connection and retry — your query is kept.");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => {
    let list = items ?? [];
    const cap = Number(maxPrice);
    if (maxPrice.trim() && !Number.isNaN(cap)) list = list.filter((f) => f.price <= cap);
    const words = committed.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let ranked = sort === "relevance" && words.length
      ? [...list].sort((a, b) => score(b, words) - score(a, words))
      : [...list];
    if (sort === "price-asc") ranked = [...ranked].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") ranked = [...ranked].sort((a, b) => b.price - a.price);
    return ranked;
  }, [items, maxPrice, sort, committed]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Search</h1>
      <p className="text-ink-2 text-sm">Live catalogue search — food, tags, categories. Veg data is being verified, so dietary filters stay off until then.</p>
      <form role="search" className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); setCommitted(q); run(q); }}>
        <label htmlFor="sq" className="sr-only">Search food</label>
        <input id="sq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try ‘biryani’ or ‘juice’ (2+ letters)"
          className="flex-1 h-12 px-4 rounded-m border border-line bg-surface min-w-0" autoComplete="off" />
        <button className="h-12 px-5 rounded-m bg-ink text-white font-bold min-h-11">Search</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <label className="text-sm font-bold inline-flex items-center gap-2">Max price ₹
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="numeric" placeholder="100"
            className="w-20 h-11 px-3 rounded-m border border-line bg-surface" aria-label="Maximum price" />
        </label>
        <label className="ml-auto text-sm font-bold">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-2 h-11 px-3 rounded-m border border-line bg-surface" aria-label="Sort results">
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: low</option>
            <option value="price-desc">Price: high</option>
          </select>
        </label>
      </div>
      {loading && <p className="mt-6 text-ink-2" role="status">Searching the live catalogue…</p>}
      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 rounded-l p-4" role="alert">
          <p className="font-bold">Search didn&apos;t go through.</p>
          <p className="text-sm text-ink-2">{error}</p>
          <button onClick={() => run(committed)} className="mt-2 px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11">Retry</button>
        </div>
      )}
      {!loading && !error && committed.trim().length >= 2 && results.length === 0 && (
        <EmptyState title="That craving escaped us." body={`‘${committed}’ found nothing in the live catalogue. Try fewer words or clear the price cap.`}
          action={<button onClick={() => { setQ(""); setCommitted(""); setMaxPrice(""); setItems([]); }} className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11">Clear search</button>} />
      )}
      {!loading && !error && results.length > 0 && (
        <>
          <p className="mt-4 text-sm text-ink-2" role="status">{results.length} result{results.length === 1 ? "" : "s"} for ‘<strong className="text-ink">{committed}</strong>’</p>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </>
      )}
      {!loading && !committed && (
        <p className="mt-6 text-sm text-ink-2">Tip: rankings blend name → tags → category matches. Signals live in <code>lib/search/rank.ts</code>.</p>
      )}
      <p className="mt-8 text-sm"><Link href="/" className="underline">← Home</Link></p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <ConsumerShell>
      <Suspense fallback={<div className="p-8">Loading search…</div>}><SearchBody /></Suspense>
    </ConsumerShell>
  );
}
