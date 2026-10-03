import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard } from "@/components/cards";
import { foodsByCategory, listCategories } from "@/lib/data/live";
import { isUuid, slugify } from "@/lib/slug";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listCategories().catch(() => []);
  const cat = isUuid(slug) ? categories.find((c) => c.id === slug) : categories.find((c) => slugify(c.name) === slug);
  if (!cat) return { title: "Category not found · CRAVE" };
  return {
    title: `${cat.name} on campus · CRAVE`,
    description: `Find ${cat.name} across campus outlets. Reserve a pickup slot and skip the queue.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await listCategories();
  const cat = isUuid(slug) ? categories.find((c) => c.id === slug) : categories.find((c) => slugify(c.name) === slug);
  if (!cat) notFound();
  const foods = await foodsByCategory(cat.id, 48);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-ink-2"><Link href="/" className="underline">Home</Link> / Categories</p>
        <h1 className="font-display text-3xl font-bold mt-1">{cat.name}</h1>
        <p className="text-sm text-ink-2" role="status">{foods.length} item{foods.length === 1 ? "" : "s"} in the live catalogue.</p>
        {foods.length === 0 ? (
          <p className="mt-6 text-ink-2">Nothing listed here yet.</p>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{foods.map((f) => <FoodCard key={f.id} food={f} />)}</div>
        )}
      </div>
    </ConsumerShell>
  );
}
