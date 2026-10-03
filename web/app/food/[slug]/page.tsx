"use client";
import { useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Star, Clock, Minus, Plus } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, VegMark, FavouriteButton } from "@/components/cards";
import { DEMO_FOODS } from "@/lib/domain/demo";
import { inr } from "@/lib/domain/types";
import { useApp } from "@/components/providers";

export default function FoodPage() {
  const { slug } = useParams<{ slug: string }>();
  const food = DEMO_FOODS.find((f) => f.slug === slug);
  const { addToCart } = useApp();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (!food) notFound();
  const related = DEMO_FOODS.filter((f) => f.id !== food.id && (f.category === food.category || f.outletId === food.outletId)).slice(0, 3);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-8">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={food.image} alt={food.name} className="w-full aspect-[4/3] object-cover rounded-l shadow-near" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <VegMark veg={food.isVeg} />
            <h1 className="font-display text-3xl font-bold">{food.name}</h1>
          </div>
          <p className="text-ink-2 mt-1">{food.description}</p>
          <p className="mt-2 text-sm"><Link href={`/outlets/${food.outletId === "o1" ? "annapurna-mess" : food.outletId === "o2" ? "charcoal-bun" : food.outletId === "o3" ? "biryani-blues" : food.outletId === "o4" ? "chai-sutta" : food.outletId === "o5" ? "green-bowl" : "midnight-momos"}`} className="underline font-bold">{food.outletName}</Link>
            <span className="text-ink-2"> · <Star size={12} className="inline" /> {food.rating} ({food.totalReviews}) · <Clock size={12} className="inline" /> {food.prepMin} min</span></p>
          <p className="mt-3 font-display text-3xl font-bold tabular">{inr(food.price)}</p>
          {food.variants?.map((v) => (
            <fieldset key={v.id} className="mt-4 border border-line rounded-l p-3">
              <legend className="px-2 text-sm font-bold">{v.name}{v.required && " (required)"}</legend>
              {v.options.map((o) => (
                <label key={o.id} className="flex items-center gap-2 py-1.5 text-sm">
                  <input type="radio" name={v.id} defaultChecked={o.extraPrice === 0} className="accent-[#FF4D2E]" />
                  {o.name} {o.extraPrice > 0 && <span className="text-ink-2">+{inr(o.extraPrice)}</span>}
                </label>
              ))}
            </fieldset>
          ))}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center border border-line rounded-m" role="group" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 min-w-11 min-h-11" aria-label="Decrease quantity"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold tabular" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 min-w-11 min-h-11" aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
            <button disabled={!food.isAvailable} onClick={() => { addToCart({ foodId: food.id, qty, options: [] }); setAdded(true); }}
              className="flex-1 h-12 rounded-m bg-accent text-accent-ink font-bold hover:bg-accent-deep disabled:opacity-50 min-h-11">
              {food.isAvailable ? (added ? "Added ✓ — view cart" : `Add ${qty} · ${inr(food.price * qty)}`) : "Unavailable"}
            </button>
            <FavouriteButton id={food.id} />
          </div>
          {added && <Link href="/cart" className="mt-2 inline-block underline font-bold">Go to cart →</Link>}
          {food.ingredients && <p className="mt-4 text-sm text-ink-2">Ingredients: {food.ingredients.join(", ")}{food.calories ? ` · ${food.calories} kcal` : ""}</p>}
          <p className="mt-1 text-xs text-ink-2">Tags: {food.tags.join(" · ")}</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="font-display text-xl font-bold">Frequently ordered together</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {related.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
      </div>
    </ConsumerShell>
  );
}
