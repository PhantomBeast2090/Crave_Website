"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Heart, Share2 } from "lucide-react";
import { FoodCard } from "@/components/cards";
import { useApp } from "@/components/providers";
import type { LiveFood } from "@/lib/data/live";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

export function OutletMenu({ items }: { items: LiveFood[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((f) => `${f.name} ${f.description} ${f.tags.join(" ")}`.toLowerCase().includes(qq));
  }, [items, q]);
  const cats = useMemo(() => [...new Set(filtered.map((f) => f.categoryName).filter(Boolean))], [filtered]);
  return (
    <div>
      <div className="mt-4 flex gap-2">
        <label htmlFor="menu-q" className="sr-only">Search this menu</label>
        <input id="menu-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this menu…"
          className="flex-1 h-11 px-4 rounded-m border border-line bg-surface min-w-0" autoComplete="off" />
      </div>
      {filtered.length === 0 && (
        <p className="mt-6 text-ink-2">Nothing on this menu matches ‘{q}’. <button onClick={() => setQ("")} className="underline font-bold">Clear</button></p>
      )}
      {cats.length > 0 && (
        <nav className="mt-3 flex gap-2 overflow-x-auto no-scrollbar sticky top-16 bg-base py-2" aria-label="Menu categories">
          {cats.map((c) => <a key={c} href={`#cat-${slugify(c)}`} className="px-3 py-2 rounded-pill bg-surface border border-line text-sm font-bold whitespace-nowrap">{c}</a>)}
        </nav>
      )}
      {cats.map((c) => (
        <section key={c} id={`cat-${slugify(c)}`} className="mt-6 scroll-mt-32">
          <h2 className="font-display text-xl font-bold">{c}</h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter((f) => f.categoryName === c).map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

export function OutletActions({ outletId, outletName }: { outletId: string; outletName: string }) {
  const { favOutlets, toggleOutletFav } = useApp();
  const on = favOutlets.includes(outletId);
  const [shared, setShared] = useState(false);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: outletName, url }); return; }
      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch { /* dismissed — no error UI needed */ }
  }
  return (
    <div className="flex items-center gap-2">
      <motion.button whileTap={{ scale: 0.75 }} onClick={() => toggleOutletFav(outletId)} aria-pressed={on}
        aria-label={on ? `Remove ${outletName} from saved outlets` : `Save ${outletName}`}
        className={cn("p-2 rounded-pill min-w-11 min-h-11 grid place-items-center border bg-surface border-line")}
        style={on ? { background: "#FF4D8D", borderColor: "#FF4D8D", color: "#fff" } : undefined}>
        <Heart size={16} fill={on ? "currentColor" : "none"} />
      </motion.button>
      <button onClick={share} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-m border border-line bg-surface text-sm font-bold min-h-11" aria-label={`Share ${outletName}`}>
        <Share2 size={15} /> {shared ? "Link copied" : "Share"}
      </button>
    </div>
  );
}
