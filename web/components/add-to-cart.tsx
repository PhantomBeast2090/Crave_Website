"use client";
import { useApp } from "@/components/providers";
import { inr } from "@/lib/domain/types";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function AddToCart({ foodId, price, available }: { foodId: string; price: number; available: boolean }) {
  const { addToCart } = useApp();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-line rounded-m bg-surface" role="group" aria-label="Quantity">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 min-w-11 min-h-11" aria-label="Decrease quantity"><Minus size={16} /></button>
          <span className="w-8 text-center font-bold tabular" aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="p-3 min-w-11 min-h-11" aria-label="Increase quantity"><Plus size={16} /></button>
        </div>
        <button disabled={!available} onClick={() => { addToCart({ foodId, qty, options: [] }); setAdded(true); }}
          className="flex-1 h-12 rounded-m bg-accent-deep text-white font-bold hover:bg-ink disabled:opacity-50 min-h-11">
          {available ? (added ? "Added ✓ — view cart" : `Add ${qty} · ${inr(price * qty)}`) : "Unavailable"}
        </button>
      </div>
      {added && <Link href="/cart" className="mt-2 inline-block underline font-bold">Go to cart →</Link>}
    </div>
  );
}
