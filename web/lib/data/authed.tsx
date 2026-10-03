"use client";
// Authenticated data helpers (browser session). RLS enforces everything;
// these helpers never bypass it and never touch service_role.

import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import { isDemoMode } from "../supabase/env";

export interface Session { userId: string; email: string; }

export function useSession(): { session: Session | null; loading: boolean; signOut: () => Promise<void> } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => !isDemoMode);
  useEffect(() => {
    if (isDemoMode) return;
    const sb = createClient();
    sb.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s ? { userId: s.user.id, email: s.user.email ?? "" } : null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s ? { userId: s.user.id, email: s.user.email ?? "" } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return {
    session, loading,
    signOut: async () => { await createClient().auth.signOut(); setSession(null); },
  };
}

export function RequireSignIn({ children, action }: { children?: React.ReactNode; action: string }) {
  return (
    <div className="text-center py-16 px-6 max-w-md mx-auto">
      <h2 className="font-display text-2xl font-bold">Sign in to {action}.</h2>
      <p className="text-ink-2 mt-1">Your data lives in your account — never in this browser alone.</p>
      <div className="mt-4 flex gap-2 justify-center">
        <a href={`/auth/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`} className="px-4 py-2.5 rounded-m bg-ink text-white font-bold min-h-11 inline-flex items-center">Sign in</a>
        <a href="/auth/register" className="px-4 py-2.5 rounded-m border border-line font-bold min-h-11 inline-flex items-center">Register</a>
      </div>
      {children}
    </div>
  );
}
