"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, EmptyState } from "@/components/cards";
import { DEMO_FOODS } from "@/lib/domain/demo";
import { rankFoods } from "@/lib/search/rank";
import { trackEvent } from "@/lib/analytics/events";

type Sort = "relevance" | "rating" | "price-asc" | "price-desc" | "prep";

function SearchBody() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [veg, setVeg] = useState<"all" | "veg" | "nonveg">("all");
  const [sort, setSort] = useState<Sort>("relevance");

  const results = useMemo(() => {
    let items = DEMO_FOODS.map((f) => ({ ...f, outletOpen: true }));
    if (veg === "veg") items = items.filter((f) => f.isVeg);
    if (veg === "nonveg") items = items.filter((f) => !f.isVeg);
    let ranked = q.trim().length >= 1 ? rankFoods(items, q) : items;
    if (sort === "rating") ranked = [...ranked].sort((a, b) => b.rating - a.rating);
    if (sort === "price-asc") ranked = [...ranked].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") ranked = [...ranked].sort((a, b) => b.price - a.price);
    if (sort === "prep") ranked = [...ranked].sort((a, b) => a.prepMin - b.prepMin);
    return ranked;
  }, [q, veg, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Search</h1>
      <p className="text-ink-2 text-sm">Food, outlets, categories, tags — server-side when Supabase is live.</p>
      <form role="search" className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); trackEvent({ name: "search_submitted", metadata: { q } }); }}>
        <label htmlFor="sq" className="sr-only">Search food</label>
        <input id="sq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try ‘biryani’ or ‘coffee’"
          className="flex-1 h-12 px-4 rounded-m border border-line bg-surface min-w-0" autoComplete="off" />
      </form>
      <div className="mt-3 flex flex-wrap gap-2 items-center" role="group" aria-label="Filters">
        {(["all", "veg", "nonveg"] as const).map((v) => (
          <button key={v} onClick={() => { setVeg(v); trackEvent({ name: "filter_applied", metadata: { veg: v } }); }}
            aria-pressed={veg === v} className={`px-3 py-2 rounded-pill border text-sm font-bold min-h-11 ${veg === v ? "bg-ink text-white border-ink" : "bg-surface border-line"}`}>
            {v === "all" ? "All" : v === "veg" ? "Veg" : "Non-veg"}
          </button>
        ))}
        <label className="ml-auto text-sm font-bold">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-2 h-11 px-3 rounded-m border border-line bg-surface" aria-label="Sort results">
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="price-asc">Price: low</option>
            <option value="price-desc">Price: high</option>
            <option value="prep">Fastest</option>
          </select>
        </label>
      </div>
      {results.length === 0 ? (
        <EmptyState title="That craving escaped us." body={q ? `‘${q}’ found nothing. Try fewer words or clear filters.` : "Try a craving above."}
          action={<button onClick={() => { setQ(""); setVeg("all"); }} className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11">Clear filters</button>} />
      ) : (
        <>
          <p className="mt-4 text-sm text-ink-2" role="status">{results.length} result{results.length === 1 ? "" : "s"}{q && <> for ‘<strong className="text-ink">{q}</strong>’</>}</p>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </>
      )}
      <p className="mt-8 text-xs text-ink-2">Ranking signals (tunable in <code>lib/search/rank.ts</code>): name → tags → category → popularity → rating → open/available → prep/price → favourites/history.</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <ConsumerShell>
      <Suspense fallback={<div className="p-8">Loading search…</div>}><SearchBody /></Suspense>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-sm"><Link href="/" className="underline">← Home</Link></div>
    </ConsumerShell>
  );
}
