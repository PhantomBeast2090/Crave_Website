import Link from "next/link";

function OpsShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  const base = title.startsWith("Vendor") ? "/vendor" : "/management";
  const links = title.startsWith("Vendor")
    ? [["Command", "/vendor"], ["Orders", "/vendor/orders"], ["QR scan", "/vendor/qr-scanner"], ["Menu", "/vendor/menu"], ["Inventory", "/vendor/inventory"], ["Analytics", "/vendor/analytics"], ["Reviews", "/vendor/reviews"], ["Promotions", "/vendor/promotions"], ["Settings", "/vendor/settings"]]
    : [["Overview", "/management"], ["Analytics", "/management/analytics"], ["Orders", "/management/orders"], ["Outlets", "/management/outlets"], ["Vendors", "/management/vendors"], ["Users", "/management/users"], ["Payments", "/management/payments"], ["Inventory", "/management/inventory"], ["Reviews", "/management/reviews"], ["Promotions", "/management/promotions"], ["Slots", "/management/pickup-slots"], ["Audit", "/management/audit"]];
  return (
    <div className="min-h-dvh bg-surface-2">
      <header className="bg-charcoal text-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <Link href="/" className="font-display font-bold" aria-label="Back to CRAVE">CRAVE<span className="text-accent">.</span></Link>
          <span className="text-xs px-2 py-1 rounded-pill bg-white/10 font-bold">{title}</span>
          <span className="ml-auto text-xs text-white/60">Role-guarded · server re-checks every action</span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <nav className="bg-surface border border-line rounded-l p-2 h-fit md:sticky md:top-20" aria-label={`${title} navigation`}>
          {links.map(([l, h]) => <Link key={h} href={h} className="block px-3 py-2.5 rounded-m text-sm font-bold hover:bg-surface-2 min-h-11">{l}</Link>)}
          <p className="px-3 py-2 text-xs text-ink-2">Base: {base}</p>
        </nav>
        <main>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="text-sm text-ink-2">{sub}</p>
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function Kpi({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="bg-surface border border-line rounded-l p-4">
      <p className="text-xs text-ink-2 font-bold uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl font-bold tabular mt-1">{value}</p>
      {delta && <p className="text-xs text-green-700 font-bold mt-0.5">{delta} vs prev period</p>}
    </div>
  );
}

export function ChartCard({ title, children, empty }: { title: string; children?: React.ReactNode; empty?: string }) {
  return (
    <section className="bg-surface border border-line rounded-l p-4" aria-label={title}>
      <h2 className="font-bold text-sm">{title}</h2>
      {children ?? <p className="text-sm text-ink-2 mt-2">{empty ?? "No data yet — chart shows loading → empty → error distinctly when live."}</p>}
    </section>
  );
}

export { OpsShell };
