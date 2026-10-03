import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Clock, MapPin } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard } from "@/components/cards";
import { DEMO_FOODS, DEMO_OUTLETS } from "@/lib/domain/demo";

export default async function OutletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const outlet = DEMO_OUTLETS.find((o) => o.slug === slug);
  if (!outlet) notFound();
  const menu = DEMO_FOODS.filter((f) => f.outletId === outlet.id);
  const cats = [...new Set(menu.map((f) => f.category))];
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={outlet.image} alt="" className="w-full aspect-[21/9] object-cover rounded-l" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold">{outlet.name}</h1>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-pill ${outlet.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{outlet.isOpen ? "Open now" : "Closed"}</span>
        </div>
        <p className="text-ink-2">{outlet.description}</p>
        <p className="mt-1 text-sm text-ink-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1"><Star size={13} /> {outlet.rating} ({outlet.totalReviews})</span>
          <span className="inline-flex items-center gap-1"><Clock size={13} /> ~{outlet.pickupEtaMin} min pickup</span>
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {outlet.location}</span>
        </p>
        <nav className="mt-4 flex gap-2 overflow-x-auto no-scrollbar sticky top-16 bg-base py-2" aria-label="Menu categories">
          {cats.map((c) => <a key={c} href={`#cat-${c}`} className="px-3 py-2 rounded-pill bg-surface border border-line text-sm font-bold whitespace-nowrap">{c}</a>)}
        </nav>
        {cats.map((c) => (
          <section key={c} id={`cat-${c}`} className="mt-6 scroll-mt-32">
            <h2 className="font-display text-xl font-bold">{c}</h2>
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.filter((f) => f.category === c).map((f) => <FoodCard key={f.id} food={f} />)}
            </div>
          </section>
        ))}
        <section className="mt-10" aria-label="Reviews preview">
          <h2 className="font-display text-xl font-bold">Reviews</h2>
          <p className="text-sm text-ink-2">Full review system (verified orders, photos, helpful votes) lands with migration 019. <Link href="/reviews" className="underline font-bold text-ink">See review spec demo →</Link></p>
        </section>
      </div>
    </ConsumerShell>
  );
}
