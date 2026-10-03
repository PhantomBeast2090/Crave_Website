import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";

const OFFERS = [
  { code: "CAMPUS20", title: "20% off your between-class lunch", desc: "Min ₹149 · max ₹60 · 12–3 PM", color: "#FF4D2E" },
  { code: "UNDER100", title: "Under ₹100 rescue menu", desc: "Dosa, chai, maggi lab picks", color: "#A8E10C" },
  { code: "NIGHTOWL", title: "Late-night momo run", desc: "Free dip after 10 PM at Night Canteen", color: "#7C5CFF" },
];

export default function OffersPage() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Offers</h1>
        <p className="text-sm text-ink-2">Striking, not spammy. Coupons validate server-side.</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFERS.map((o) => (
            <article key={o.code} className="rounded-l overflow-hidden border border-line bg-surface">
              <div className="p-5 text-white" style={{ background: o.color }}>
                <p className="font-display font-bold text-xl">{o.title}</p>
                <p className="text-sm opacity-90">{o.desc}</p>
              </div>
              <div className="p-4 flex items-center gap-2">
                <code className="px-2.5 py-1.5 rounded-m bg-surface-2 border border-dashed border-ink-3 font-bold tabular">{o.code}</code>
                <Link href="/cart" className="ml-auto px-3 py-2 rounded-m bg-ink text-white text-sm font-bold min-h-11 inline-flex items-center">Apply in cart</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ConsumerShell>
  );
}
