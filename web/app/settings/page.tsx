"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { ConsumerShell } from "@/components/consumer-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";

export default function SettingsPage() {
  const { session, loading, signOut } = useSession();
  const router = useRouter();
  const [reduced, setReduced] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        {loading && <p className="mt-4 text-ink-2" role="status">Loading account…</p>}
        {!loading && !session && (
          <RequireSignIn action="change settings">
            <p className="mt-3 text-sm text-ink-2">Display preferences below work without an account.</p>
          </RequireSignIn>
        )}
        {session && (
          <section className="mt-4 bg-surface border border-line rounded-l p-4 flex items-center gap-3" aria-label="Account">
            <span className="w-12 h-12 rounded-full bg-ink text-white grid place-items-center" aria-hidden>
              <UserRound size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-bold truncate">{session.email}</p>
              <p className="text-xs text-ink-2">Signed in · <Link href="/profile" className="underline">View profile</Link></p>
            </div>
            <button onClick={logout} disabled={busy}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-m bg-ink text-white text-sm font-bold hover:bg-charcoal-2 disabled:opacity-60 min-h-11">
              <LogOut size={15} /> {busy ? "Signing out…" : "Log out"}
            </button>
          </section>
        )}
        <section className="mt-3 bg-surface border border-line rounded-l p-4 space-y-3" aria-label="Display">
          <h2 className="font-bold">Display</h2>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={reduced} onChange={(e) => { setReduced(e.target.checked); document.documentElement.classList.toggle("reduce-motion", e.target.checked); }} className="w-5 h-5" />
            Reduce motion on this device
          </label>
          <p className="text-xs text-ink-2">CRAVE already respects your OS reduce-motion setting everywhere. This toggle is an extra for this browser.</p>
        </section>
      </div>
    </ConsumerShell>
  );
}
