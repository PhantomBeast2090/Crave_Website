"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, Plus, Star, Clock } from "lucide-react";
import type { FoodItem } from "@/lib/domain/types";
import { inr } from "@/lib/domain/types";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

export function VegMark({ veg }: { veg: boolean }) {
  return (
    <span role="img" aria-label={veg ? "Veg" : "Non-veg"}
      className={cn("inline-grid place-items-center w-4 h-4 rounded-[4px] border-2", veg ? "border-green-700" : "border-red-700")}>
      <span className={cn("w-1.5 h-1.5 rounded-full", veg ? "bg-green-700" : "bg-red-700")} />
    </span>
  );
}

export function FavouriteButton({ id }: { id: string }) {
  const { favs, toggleFav } = useApp();
  const on = favs.includes(id);
  return (
    <motion.button
      whileTap={{ scale: 0.75 }}
      onClick={() => toggleFav(id)}
      aria-pressed={on}
      aria-label={on ? "Remove from favourites" : "Add to favourites"}
      className={cn("p-2 rounded-pill min-w-11 min-h-11 grid place-items-center border", on ? "bg-pink text-white border-pink" : "bg-surface border-line")}
      style={on ? { background: "#FF4D8D", borderColor: "#FF4D8D" } : undefined}
    >
      <motion.span key={String(on)} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.35 }}>
        <Heart size={16} fill={on ? "currentColor" : "none"} />
      </motion.span>
    </motion.button>
  );
}

export function FoodCard({ food }: { food: FoodItem }) {
  const { addToCart } = useApp();
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      className="bg-surface border border-line rounded-l overflow-hidden shadow-near flex flex-col">
      <div className="relative">
        <Link href={`/food/${food.slug}`} aria-label={food.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={food.image} alt={food.name} loading="lazy" className="w-full aspect-[4/3] object-cover" />
        </Link>
        <div className="absolute top-2 left-2 flex gap-1.5">
          {food.isPopular && <span className="px-2 py-1 rounded-pill bg-ink text-white text-[11px] font-bold">Popular on campus</span>}
          {!food.isAvailable && <span className="px-2 py-1 rounded-pill bg-error text-white text-[11px] font-bold">Unavailable</span>}
        </div>
        <div className="absolute top-2 right-2"><FavouriteButton id={food.id} /></div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5">
          <VegMark veg={food.isVeg} />
          <Link href={`/food/${food.slug}`} className="font-display font-bold leading-tight hover:underline">{food.name}</Link>
        </div>
        <p className="text-xs text-ink-2">{food.outletName}</p>
        <div className="flex items-center gap-2 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1 font-bold text-ink"><Star size={12} fill="#FF9E0B" strokeWidth={0} />{food.rating}</span>
          <span>({food.totalReviews})</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} />{food.prepMin} min</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-bold tabular">{inr(food.price)}</span>
          <button disabled={!food.isAvailable} onClick={() => addToCart({ foodId: food.id, qty: 1, options: [] })}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-m bg-ink text-white text-sm font-bold hover:bg-charcoal-2 disabled:opacity-50 min-h-11">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-6 max-w-md mx-auto">
      <div className="mx-auto w-16 h-16 rounded-l bg-accent-soft grid place-items-center text-2xl" aria-hidden>🍱</div>
      <h2 className="font-display text-2xl font-bold mt-4">{title}</h2>
      <p className="text-ink-2 mt-1">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
