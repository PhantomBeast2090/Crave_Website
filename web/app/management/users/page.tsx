"use client";
import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface P { id: string; name: string; email: string; role: string; is_active: boolean; created_at: string; }

function Table({ title, role }: { title: string; role?: string }) {
  const { session } = useSession();
  const [rows, setRows] = useState<P[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    let q = createClient().from("profiles").select("id,name,email,role,is_active,created_at").order("created_at", { ascending: false }).limit(100);
    if (role) q = q.eq("role", role);
    q.then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as P[]); });
  }, [session, role]);
  return (
    <div>
      <h2 className="font-bold mt-4">{title}</h2>
      {err && <p className="text-sm text-error" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      <div className="mt-2 space-y-1.5">
        {rows?.map((p) => (
          <div key={p.id} className="bg-surface border border-line rounded-l p-3 text-sm flex gap-2 flex-wrap">
            <span className="font-bold">{p.name}</span>
            <span className="text-ink-2">{p.email}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-surface-2 border border-line">{p.role}</span>
            {!p.is_active && <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-red-100 text-red-800">disabled</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MgmtUsers() {
  const { session, loading } = useSession();
  if (!loading && !session) return <OpsShell title="Users" sub="Sign in."><RequireSignIn action="manage users" /></OpsShell>;
  return <OpsShell title="Users" sub="Latest 100 profiles. Role changes stay admin-only server-side."><Table title="All accounts" /></OpsShell>;
}
