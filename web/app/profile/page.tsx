import { ConsumerShell } from "@/components/consumer-shell";
import { Stub } from "../collections/page";

export default function ProfilePage() {
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-ink text-white grid place-items-center font-display font-bold text-xl" aria-hidden>R</span>
          <div>
            <h1 className="font-display text-2xl font-bold">Rakshan · Student</h1>
            <p className="text-sm text-ink-2">rakshan@campus.edu · Hostel B · Demo profile (Supabase live when configured)</p>
          </div>
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-center">
          {[["18", "Orders"], ["9", "Favourites"], ["4.8", "Avg rating given"]].map(([v, l]) => (
            <div key={l} className="bg-surface border border-line rounded-l p-4">
              <p className="font-display text-2xl font-bold tabular">{v}</p>
              <p className="text-xs text-ink-2">{l}</p>
            </div>
          ))}
        </div>
        <Stub title="Preferences" body="Dietary prefs · notification settings · saved campus context · help/support live in /settings." />
      </div>
    </ConsumerShell>
  );
}
