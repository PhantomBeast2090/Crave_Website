"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import type { LiveFood } from "@/lib/data/live";
import { inr } from "@/lib/domain/types";
import { hasRating } from "@/lib/slug";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

export function FoodImage({ food, className }: { food: Pick<LiveFood, "name" | "imageUrl" | "categoryName">; className?: string }) {
  const [err, setErr] = useState(false);
  if (!food.imageUrl || err) {
    return (
      <div className={cn("grid place-items-center bg-surface-2", className)} role="img" aria-label={`${food.name} (photo coming soon)`}>
        <span className="font-display font-bold text-4xl text-ink-3" aria-hidden>{food.name.charAt(0)}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={food.imageUrl} alt={food.name} loading="lazy" onError={() => setErr(true)} className={cn("object-cover", className)} />;
}

export function RatingLine({ rating, total }: { rating: number; total: number }) {
  if (!hasRating(rating, total)) {
    return <span className="text-xs text-ink-3 font-semibold">Not rated yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-ink">
      ★ {rating.toFixed(1)} <span className="font-normal text-ink-2">({total})</span>
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
      aria-label={on ? "Remove from saved" : "Save on this device"}
      title="Saved on this device — sign in to sync across devices"
      className={cn("p-2 rounded-pill min-w-11 min-h-11 grid place-items-center border bg-surface border-line")}
      style={on ? { background: "#FF4D8D", borderColor: "#FF4D8D", color: "#fff" } : undefined}
    >
      <motion.span key={String(on)} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.35 }}>
        <Heart size={16} fill={on ? "currentColor" : "none"} />
      </motion.span>
    </motion.button>
  );
}

export function FoodCard({ food }: { food: LiveFood }) {
  const { addToCart } = useApp();
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      className="bg-surface border border-line rounded-l overflow-hidden shadow-near flex flex-col">
      <div className="relative">
        <Link href={`/food/${food.id}`} aria-label={food.name}>
          <FoodImage food={food} className="w-full aspect-[4/3]" />
        </Link>
        {!food.isAvailable && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-pill bg-error text-white text-[11px] font-bold">Unavailable</span>
        )}
        <div className="absolute top-2 right-2"><FavouriteButton id={food.id} /></div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link href={`/food/${food.id}`} className="font-display font-bold leading-tight hover:underline">{food.name}</Link>
        <p className="text-xs text-ink-2">{food.outletName}{food.categoryName ? ` · ${food.categoryName}` : ""}</p>
        <div className="flex items-center gap-2">
          <RatingLine rating={food.rating} total={food.totalReviews} />
          <span className="text-xs text-ink-2">· {food.prepMin} min</span>
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

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-16 px-6 max-w-md mx-auto" role="alert">
      <h2 className="font-display text-2xl font-bold mt-4">{title}</h2>
      <p className="text-ink-2 mt-1">{body}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11">Retry</button>}
    </div>
  );
}
