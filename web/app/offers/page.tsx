import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export const revalidate = 60;

export default async function OffersPage() {
  let coupons: { code: string; description: string | null }[] = [];
  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/coupons?select=code,description&is_active=eq.true&limit=20`,
      { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }, next: { revalidate: 60 } });
    if (r.ok) coupons = await r.json();
  } catch { /* honest empty below */ }
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Offers</h1>
        <p className="text-sm text-ink-2">Live from the coupons table — validated server-side at checkout.</p>
        {coupons.length === 0 ? (
          <div className="mt-6 bg-surface border border-line rounded-l p-8 text-center max-w-md mx-auto">
            <h2 className="font-display text-xl font-bold">No active offers right now.</h2>
            <p className="text-sm text-ink-2">The Under ₹100 shelf is always in budget. <Link href="/" className="underline font-bold text-ink">Browse food →</Link></p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((o) => (
              <article key={o.code} className="rounded-l overflow-hidden border border-line bg-surface">
                <div className="p-5 bg-ink text-white">
                  <p className="font-mono font-bold text-xl tabular">{o.code}</p>
                  <p className="text-sm opacity-80">{o.description}</p>
                </div>
                <div className="p-4">
                  <Link href="/cart" className="px-3 py-2 rounded-m bg-ink text-white text-sm font-bold min-h-11 inline-flex items-center">Apply in cart</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </ConsumerShell>
  );
}
