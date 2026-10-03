"use client";
import Link from "next/link";
import { ConsumerShell } from "@/components/consumer-shell";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { session, loading, signOut } = useSession();
  const [profile, setProfile] = useState<{ name: string; phone: string | null; role: string } | null>(null);

  useEffect(() => {
    if (!session) return;
    createClient().from("profiles").select("name,phone,role").eq("id", session.userId).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data as { name: string; phone: string | null; role: string }); });
  }, [session]);

  if (!loading && !session) return <ConsumerShell><RequireSignIn action="see your profile" /></ConsumerShell>;

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading ? <p className="text-ink-2" role="status">Loading profile…</p> : (
          <>
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-full bg-ink text-white grid place-items-center font-display font-bold text-xl" aria-hidden>
                {(profile?.name ?? session?.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold">{profile?.name ?? "Student"}</h1>
                <p className="text-sm text-ink-2">{session?.email}{profile?.role ? ` · ${profile.role}` : ""}{profile?.phone ? ` · ${profile.phone}` : ""}</p>
              </div>
              <button onClick={signOut} className="ml-auto px-4 py-2.5 rounded-m border border-line font-bold min-h-11">Sign out</button>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[["Orders", "/orders"], ["Your shelf", "/favorites"], ["Notifications", "/notifications"]].map(([l, h]) => (
                <Link key={h} href={h} className="bg-surface border border-line rounded-l p-4 font-bold hover:shadow-far">{l} →</Link>
              ))}
            </div>
          </>
        )}
      </div>
    </ConsumerShell>
  );
}
