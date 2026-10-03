import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { FoodCard, RatingLine } from "@/components/cards";
import { getCatalogue, listOutlets } from "@/lib/data/live";
import { isUuid, slugify } from "@/lib/slug";

export const revalidate = 60;

export default async function OutletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const outlets = await listOutlets();
  const match = isUuid(slug) ? outlets.find((o) => o.id === slug) : outlets.find((o) => slugify(o.name) === slug);
  if (!match) notFound();
  const { outlet, items } = await getCatalogue(match.id);
  const cats = [...new Set(items.map((f) => f.categoryName).filter(Boolean))];
  const available = items.filter((f) => f.isAvailable).length;
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {outlet.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={outlet.imageUrl} alt="" className="w-full aspect-[21/9] object-cover rounded-l" />
        ) : (
          <div className="w-full aspect-[21/9] rounded-l bg-surface-2 grid place-items-center" role="img" aria-label={`${outlet.name} (photo coming soon)`}>
            <span className="font-display font-bold text-7xl text-ink-3" aria-hidden>{outlet.name.charAt(0)}</span>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold">{outlet.name}</h1>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-pill ${outlet.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{outlet.isOpen ? "Open now" : "Closed"}</span>
        </div>
        <p className="text-ink-2">{outlet.description || "Campus food outlet."}</p>
        <p className="mt-1 text-sm text-ink-2 flex flex-wrap gap-x-4 gap-y-1">
          <RatingLine rating={outlet.rating} total={outlet.totalReviews} />
          {outlet.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {outlet.location}</span>}
          {outlet.hours && <span className="inline-flex items-center gap-1"><Clock size={13} /> {outlet.hours.openTime}–{outlet.hours.closeTime}</span>}
          <span>{available} of {items.length} items available</span>
        </p>
        {cats.length > 0 && (
          <nav className="mt-4 flex gap-2 overflow-x-auto no-scrollbar sticky top-16 bg-base py-2" aria-label="Menu categories">
            {cats.map((c) => <a key={c} href={`#cat-${slugify(c)}`} className="px-3 py-2 rounded-pill bg-surface border border-line text-sm font-bold whitespace-nowrap">{c}</a>)}
          </nav>
        )}
        {items.length === 0 ? (
          <p className="mt-8 text-ink-2">No menu published for this outlet yet.</p>
        ) : cats.map((c) => (
          <section key={c} id={`cat-${slugify(c)}`} className="mt-6 scroll-mt-32">
            <h2 className="font-display text-xl font-bold">{c}</h2>
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.filter((f) => f.categoryName === c).map((f) => <FoodCard key={f.id} food={f} />)}
            </div>
          </section>
        ))}
        <p className="mt-8 text-sm text-ink-2"><Link href="/" className="underline">← All outlets</Link></p>
      </div>
    </ConsumerShell>
  );
}
