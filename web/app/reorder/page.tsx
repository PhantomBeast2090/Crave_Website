import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
export default function P() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold capitalize">reorder</h1>
        <p className="text-ink-2 mt-2">Campus-native module. Live logic wires to Supabase tables when backend 020 lands (group-order sessions, reorder from order history, campus directory).</p>
        <p className="mt-4"><Link href="/" className="underline font-bold">← Home</Link></p>
      </div>
    </ConsumerShell>
  );
}
