import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard } from "@/components/cards";
import { cheapFoods, searchFoods } from "@/lib/data/live";
export const revalidate = 120;
export default async function P() {
  const [cheap, biryani] = await Promise.all([cheapFoods(6), searchFoods("biryani").then((r) => r.slice(0, 6)).catch(() => [])]);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Collections</h1>
        <p className="text-sm text-ink-2">Curated from the live catalogue — never staged.</p>
        <h2 className="font-display text-xl font-bold mt-6">Under ₹100 rescue menu</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{cheap.map((f) => <FoodCard key={f.id} food={f} />)}</div>
        <h2 className="font-display text-xl font-bold mt-8">Biryani files</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{biryani.map((f) => <FoodCard key={f.id} food={f} />)}</div>
        <p className="mt-6 text-sm"><Link href="/" className="underline">← Home</Link></p>
      </div>
    </ConsumerShell>
  );
}
