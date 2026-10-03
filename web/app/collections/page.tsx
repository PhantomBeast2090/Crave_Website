import { ConsumerShell } from "@/components/consumer-shell";

export default function Page() { return <ConsumerShell><Stub title="Collections" body="Campus collections — exam-week fuel, hostel nights, under ₹100. Curated sets land with migration 020." /></ConsumerShell>; }
export function Stub({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="text-ink-2 mt-2">{body}</p>
    </div>
  );
}
