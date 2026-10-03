import { ConsumerShell } from "@/components/consumer-shell";

const NOTIFS = [
  { id: "n1", title: "Cooking now", body: "Biryani Blues Cart started your biryani.", time: "2 min ago", unread: true },
  { id: "n2", title: "Beat the queue", body: "Charcoal Bun Co. wait is under 10 min right now.", time: "1 h ago", unread: true },
  { id: "n3", title: "Order picked up", body: "Ghee roast dosa · enjoyed!", time: "Yesterday", unread: false },
];

export default function NotificationsPage() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <div aria-live="polite" className="mt-4 space-y-2">
          {NOTIFS.map((n) => (
            <article key={n.id} className={`bg-surface border rounded-l p-4 ${n.unread ? "border-ink" : "border-line"}`}>
              <div className="flex items-center gap-2">
                <h2 className="font-bold">{n.title}</h2>
                {n.unread && <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-accent text-accent-ink">New</span>}
                <span className="ml-auto text-xs text-ink-2">{n.time}</span>
              </div>
              <p className="text-sm text-ink-2">{n.body}</p>
            </article>
          ))}
        </div>
      </div>
    </ConsumerShell>
  );
}
