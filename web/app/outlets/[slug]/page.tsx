import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { RatingLine } from "@/components/cards";
import { OutletMenu, OutletActions } from "@/components/outlet-client";
import { getCatalogue, listOutlets } from "@/lib/data/live";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { isUuid, slugify } from "@/lib/slug";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const outlets = await listOutlets().catch(() => []);
  const match = isUuid(slug) ? outlets.find((o) => o.id === slug) : outlets.find((o) => slugify(o.name) === slug);
  if (!match) return { title: "Outlet not found · CRAVE" };
  return {
    title: `${match.name} · order pickup on CRAVE`,
    description: match.description ?? `Order from ${match.name} on campus. Reserve a pickup slot, track live, grab and go.`,
    openGraph: { title: match.name, description: match.description ?? undefined, ...(match.imageUrl ? { images: [match.imageUrl] } : {}) },
  };
}

export default async function OutletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const outlets = await listOutlets();
  const match = isUuid(slug) ? outlets.find((o) => o.id === slug) : outlets.find((o) => slugify(o.name) === slug);
  if (!match) notFound();
  const [{ outlet, items }, reviews] = await Promise.all([
    getCatalogue(match.id),
    fetch(`${supabaseUrl}/rest/v1/reviews?select=id,rating,comment,created_at&outlet_id=eq.${match.id}&order=created_at.desc&limit=6`,
      { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }, next: { revalidate: 60 } })
      .then((r) => (r.ok ? r.json() : []) as Promise<{ id: string; rating: number; comment: string | null; created_at: string }[]>)
      .catch(() => []),
  ]);
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
          <span className="ml-auto"><OutletActions outletId={outlet.id} outletName={outlet.name} /></span>
        </div>
        <p className="text-ink-2">{outlet.description || "Campus food outlet."}</p>
        <p className="mt-1 text-sm text-ink-2 flex flex-wrap gap-x-4 gap-y-1">
          <RatingLine rating={outlet.rating} total={outlet.totalReviews} />
          {outlet.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {outlet.location}</span>}
          {outlet.hours && <span className="inline-flex items-center gap-1"><Clock size={13} /> {outlet.hours.openTime}–{outlet.hours.closeTime}</span>}
          <span>{available} of {items.length} items available</span>
        </p>
        {items.length === 0 ? (
          <p className="mt-8 text-ink-2">No menu published for this outlet yet.</p>
        ) : (
          <OutletMenu items={items} />
        )}
        <section className="mt-10" aria-label={`Reviews for ${outlet.name}`}>
          <h2 className="font-display text-xl font-bold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-2">No reviews for this outlet yet — verified reviews unlock after picked-up orders. <Link href="/reviews" className="underline font-bold text-ink">How reviews work →</Link></p>
          ) : (
            <div className="mt-3 space-y-2">
              {reviews.map((r) => (
                <article key={r.id} className="bg-surface border border-line rounded-l p-4 text-sm">
                  <p aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span> <span className="text-xs text-ink-2">· {new Date(r.created_at).toLocaleDateString("en-IN")} · verified order</span></p>
                  <p className="mt-1">{r.comment || "(no comment)"}</p>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="mt-8 text-sm text-ink-2"><Link href="/" className="underline">← All outlets</Link></p>
      </div>
    </ConsumerShell>
  );
}
