import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { ChartCard } from "@/components/ops-shell";
export default function P() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Group order</h1>
        <p className="text-sm text-ink-2">One host, one link, everyone adds their own items.</p>
        <div className="mt-4"><ChartCard title="Coming with the group-orders migration" empty="Shared carts need new tables (sessions, participants, per-person items) plus payment-split rules. The architecture is specced; the tables don't exist yet — so there's no mock button here." /></div>
        <p className="mt-4 text-sm"><Link href="/" className="underline">← Home</Link></p>
      </div>
    </ConsumerShell>
  );
}
