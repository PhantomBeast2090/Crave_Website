import { ConsumerShell } from "@/components/consumer-shell";
import { Star } from "lucide-react";

const DIST = [68, 21, 7, 2, 2];
const REVIEWS = [
  { user: "Ananya · verified order", date: "2 days ago", rating: 5, text: "Dum flavour is real. Mirchi ka salan on point.", helpful: 41 },
  { user: "Rohit · verified order", date: "1 week ago", rating: 4, text: "Long queue at 1 PM, worth it. Raita portion could be bigger.", helpful: 18 },
];

export default function ReviewsPage() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Reviews</h1>
        <p className="text-sm text-ink-2">Verified orders only · server aggregates · photos + helpful votes with migration 019.</p>
        <div className="mt-4 bg-surface border border-line rounded-l p-4">
          <p className="font-display text-4xl font-bold">4.5 <span className="text-base font-sans font-normal text-ink-2">· 2,310 ratings</span></p>
          <div className="mt-2 space-y-1" role="img" aria-label="Rating distribution: mostly 5 stars">
            {DIST.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-6 inline-flex items-center gap-0.5"><Star size={11} />{5 - i}</span>
                <span className="flex-1 h-2 rounded-pill bg-surface-2 overflow-hidden"><span className="block h-full bg-citrus rounded-pill" style={{ width: `${p}%` }} /></span>
                <span className="w-8 text-ink-2 tabular">{p}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {REVIEWS.map((r, i) => (
            <article key={i} className="bg-surface border border-line rounded-l p-4">
              <p className="text-sm font-bold">{r.user} <span className="font-normal text-ink-2">· {r.date}</span></p>
              <p className="text-sm" aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
              <p className="text-sm mt-1">{r.text}</p>
              <button className="mt-2 text-xs font-bold border border-line rounded-pill px-3 py-2 min-h-11">Helpful ({r.helpful})</button>
            </article>
          ))}
        </div>
      </div>
    </ConsumerShell>
  );
}
