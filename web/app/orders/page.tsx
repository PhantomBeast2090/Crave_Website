import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { ORDER_COPY, type OrderStatus } from "@/lib/domain/types";

const DEMO_ORDER = {
  id: "GAG-7K2Q9A", number: "GAG-7K2Q9A", outlet: "Biryani Blues Cart",
  status: "PREPARING" as OrderStatus, slot: "1:00 PM", eta: "10 min",
  items: "1× Hyderabadi Chicken Biryani, 1× Cold Coffee",
};

const STEPS: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP"];

export default function OrdersPage() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <Link href={`/orders/${DEMO_ORDER.id}`} className="mt-4 block bg-surface border border-line rounded-l p-4 hover:shadow-far">
          <div className="flex items-center gap-2">
            <p className="font-bold tabular">{DEMO_ORDER.number}</p>
            <span className="text-[11px] font-bold px-2 py-1 rounded-pill bg-amber-100 text-amber-800">{ORDER_COPY[DEMO_ORDER.status]}</span>
            <span className="ml-auto text-xs text-ink-2">{DEMO_ORDER.slot}</span>
          </div>
          <p className="text-sm text-ink-2 mt-1">{DEMO_ORDER.outlet} · {DEMO_ORDER.items}</p>
          <div className="mt-3 flex gap-1" aria-hidden>
            {STEPS.map((s, i) => {
              const active = STEPS.indexOf(DEMO_ORDER.status) >= i;
              return <span key={s} className={`h-1.5 flex-1 rounded-pill ${active ? "bg-green-600" : "bg-line"}`} />;
            })}
          </div>
        </Link>
        <p className="mt-4 text-sm text-ink-2">Live status streams over Supabase Realtime (<code>public:orders</code>) when env is configured.</p>
      </div>
    </ConsumerShell>
  );
}
