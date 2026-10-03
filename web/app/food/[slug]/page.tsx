import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, FoodImage, RatingLine } from "@/components/cards";
import { AddToCart } from "@/components/add-to-cart";
import { foodsByCategory, getCatalogue, getFood } from "@/lib/data/live";
import { inr } from "@/lib/domain/types";
import { slugify } from "@/lib/slug";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFood(slug).catch(() => null);
  if (!food) return { title: "Dish not found · CRAVE" };
  return {
    title: `${food.name} · ${food.outletName} on CRAVE`,
    description: `${food.name} at ${food.outletName} — ${inr(food.price)}. Reserve a pickup slot and skip the queue.`,
    openGraph: { title: food.name, description: food.description || undefined, ...(food.imageUrl ? { images: [food.imageUrl] } : {}) },
  };
}

export default async function FoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const food = await getFood(slug);
  if (!food) notFound();
  const related = food.categoryId
    ? (await foodsByCategory(food.categoryId, 7)).filter((f) => f.id !== food.id).slice(0, 3)
    : [];
  const outletMenu = (await getCatalogue(food.outletId).catch(() => null))?.items.filter((f) => f.id !== food.id).slice(0, 3) ?? [];
  const more = related.length ? related : outletMenu;
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-8">
        <div>
          <FoodImage food={food} className="w-full aspect-[4/3] rounded-l shadow-near" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">{food.name}</h1>
          {food.description && <p className="text-ink-2 mt-1">{food.description}</p>}
          <p className="mt-2 text-sm">
            <Link href={`/outlets/${slugify(food.outletName)}`} className="underline font-bold">{food.outletName}</Link>
            <span className="text-ink-2"> · <RatingLine rating={food.rating} total={food.totalReviews} /> · <Clock size={12} className="inline" /> {food.prepMin} min</span>
          </p>
          <p className="mt-3 font-display text-3xl font-bold tabular">{inr(food.price)}</p>
          <AddToCart foodId={food.id} price={food.price} available={food.isAvailable} />
          {food.tags.length > 0 && <p className="mt-4 text-sm text-ink-2">Tags: {food.tags.join(" · ")}</p>}
          {food.categoryName && <p className="mt-1 text-sm"><Link href={`/categories/${slugify(food.categoryName)}`} className="underline">More {food.categoryName} →</Link></p>}
        </div>
      </div>
      {more.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="font-display text-xl font-bold">You may also like</h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {more.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </div>
      )}
    </ConsumerShell>
  );
}
