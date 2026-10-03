import Link from "next/link";
import { QrCode, Bell } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { ORDER_COPY, ORDER_FLOW, type OrderStatus } from "@/lib/domain/types";

const STATUS = "READY" as OrderStatus;

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = ORDER_FLOW.indexOf(STATUS);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-ink-2"><Link href="/orders" className="underline">Orders</Link> / <span className="tabular">{id}</span></p>
        <h1 className="font-display text-3xl font-bold mt-1 tabular">{id}</h1>
        <ol className="mt-6 space-y-0" aria-label="Order timeline">
          {ORDER_FLOW.map((s, i) => (
            <li key={s} className="flex gap-3">
              <div className="flex flex-col items-center" aria-hidden>
                <span className={`w-4 h-4 rounded-full border-2 ${i <= idx ? "bg-green-600 border-green-600" : "bg-surface border-line"}`} />
                {i < ORDER_FLOW.length - 1 && <span className={`w-0.5 flex-1 min-h-6 ${i < idx ? "bg-green-600" : "bg-line"}`} />}
              </div>
              <div className="pb-6">
                <p className={`font-bold ${i <= idx ? "" : "text-ink-3"}`}>{ORDER_COPY[s]}</p>
                <p className="text-xs text-ink-2">{s === "READY" ? "Show the QR below at the counter." : s === "PICKED_UP" ? "Enjoy!" : s === "PLACED" ? "Order received" : "Kitchen update"}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="bg-ink text-white rounded-l p-5 flex gap-4 items-center" role="img" aria-label="Pickup QR token card (demo)">
          <span className="w-20 h-20 rounded-m bg-white grid place-items-center text-ink"><QrCode size={44} /></span>
          <div>
            <p className="font-display font-bold text-lg">Ready to grab</p>
            <p className="text-sm text-white/70 tabular">Token 9f2c…a41b · expires in 2h · Biryani Blues Cart</p>
            <p className="text-xs text-white/50">Real QR renders <code>pickup_tokens.token_value</code>; verified by <code>verify_pickup_token</code>.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-2 inline-flex items-center gap-1.5"><Bell size={14} /> Status + pickup reminders arrive in <Link href="/notifications" className="underline font-bold text-ink">Notifications</Link>.</p>
      </div>
    </ConsumerShell>
  );
}
