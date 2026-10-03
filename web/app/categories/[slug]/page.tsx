import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { CATEGORIES, DEMO_FOODS } from "@/lib/domain/demo";
import { FoodCard } from "@/components/cards";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();
  const foods = slug === "under-100" ? DEMO_FOODS.filter((f) => f.price < 100) : DEMO_FOODS.filter((f) => f.category.toLowerCase().includes(cat.name.toLowerCase().split(" ")[0]) || f.tags.includes(slug));
  const list = foods.length ? foods : DEMO_FOODS.slice(0, 3);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-ink-2"><Link href="/" className="underline">Home</Link> / Categories</p>
        <h1 className="font-display text-3xl font-bold mt-1 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: cat.color }} aria-hidden />{cat.name}
        </h1>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{list.map((f) => <FoodCard key={f.id} food={f} />)}</div>
      </div>
    </ConsumerShell>
  );
}
