import type { FoodItem } from "../domain/types";

// Deterministic, explainable ranking over search_food RPC rows.
// Weights are tunable here — see docs/CRAVE_SEARCH_SPEC.md.

export interface RankInput extends FoodItem { outletOpen: boolean; favBoost?: number; historyBoost?: number; }

export function rankFoods(items: RankInput[], query: string): RankInput[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const words = q.split(/\s+/);
  const scored = items.map((f) => {
    const name = f.name.toLowerCase();
    let s = 0;
    if (name === q) s += 100;
    if (name.startsWith(q)) s += 40;
    for (const w of words) {
      if (name.includes(w)) s += 25;
      if (f.tags.some((t) => t.toLowerCase().includes(w))) s += 15;
      if (f.category.toLowerCase().includes(w)) s += 10;
      if (f.description.toLowerCase().includes(w)) s += 5;
    }
    if (f.isPopular) s += 8;
    s += Math.min(6, f.rating); // rating_norm
    s += Math.min(4, Math.log10(1 + f.totalReviews) * 2);
    if (f.outletOpen) s += 5;
    if (f.isAvailable) s += 3;
    if (f.prepMin > 20) s -= 8;
    if (f.price > 250) s -= 3;
    s += Math.min(10, (f.favBoost ?? 0) + (f.historyBoost ?? 0));
    return { f, s };
  });
  return scored.sort((a, b) => b.s - a.s).map((x) => x.f);
}
