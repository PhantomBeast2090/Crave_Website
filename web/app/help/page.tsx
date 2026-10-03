import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
const FAQS = [
  ["How do I pick up my order?", "Pay (or choose pay-at-counter), watch live status, and show the QR screen when it says Ready to grab. Tokens expire 2 hours after they're issued."],
  ["A slot just filled. What now?", "Pick the next one — your items stay in the cart and nothing is charged until the order is placed."],
  ["How do reviews work?", "After a picked-up order you can rate it. Only verified orders count, and averages are computed server-side."],
  ["I paid online but the order failed.", "Verification is server-side. If money left your account and no order exists, it auto-refunds — contact support with your payment ID."],
];
export default function P() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Help</h1>
        <div className="mt-4 space-y-2">
          {FAQS.map(([q, a]) => (
            <details key={q} className="bg-surface border border-line rounded-l p-4">
              <summary className="font-bold cursor-pointer min-h-11">{q}</summary>
              <p className="text-sm text-ink-2 mt-1">{a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm"><Link href="/" className="underline">← Home</Link></p>
      </div>
    </ConsumerShell>
  );
}
