"use client";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, EmptyState } from "@/components/cards";
import { DEMO_FOODS } from "@/lib/domain/demo";
import { useApp } from "@/components/providers";

export default function FavoritesPage() {
  const { favs } = useApp();
  const items = DEMO_FOODS.filter((f) => favs.includes(f.id));
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Your shelf</h1>
        <p className="text-ink-2 text-sm">Your staples · your emergency meal · always worth it. Server-synced.</p>
        {items.length === 0 ? (
          <EmptyState title="Nothing here yet. Let's fix that." body="Tap the heart on any dish and it lives here."
            action={<Link href="/" className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Discover food</Link>} />
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        )}
      </div>
    </ConsumerShell>
  );
}
