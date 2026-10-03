import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { listOutlets } from "@/lib/data/live";
import { slugify } from "@/lib/slug";
export const revalidate = 120;
export default async function P() {
  const outlets = await listOutlets();
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Campus</h1>
        <p className="text-sm text-ink-2">Every outlet CRAVE serves, live from the directory.</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outlets.map((o) => (
            <Link key={o.id} href={`/outlets/${slugify(o.name)}`} className="bg-surface border border-line rounded-l p-4 hover:shadow-far">
              <p className="font-display font-bold">{o.name}</p>
              <p className="text-xs text-ink-2 mt-0.5">{o.location ?? "SRM KTR campus"}{o.hours ? ` · ${o.hours.openTime}–${o.hours.closeTime}` : ""}</p>
              <p className={`mt-1 text-[11px] font-bold inline-block px-2 py-0.5 rounded-pill ${o.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{o.isOpen ? "Open" : "Closed"}</p>
            </Link>
          ))}
        </div>
      </div>
    </ConsumerShell>
  );
}
