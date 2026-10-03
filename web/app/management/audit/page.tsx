"use client";
import { OpsShell } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function P() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<{ id: string; action: string; table_name: string | null; created_at: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!session) return;
    createClient().from("audit_logs").select("id,action,table_name,created_at").order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as { id: string; action: string; table_name: string | null; created_at: string }[]); });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Audit" sub="Sign in."><RequireSignIn action="inspect the audit log" /></OpsShell>;
  return (
    <OpsShell title="Audit" sub="Server-written trail for orders, inventory and auth events.">
      {err && <p className="text-sm text-error" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      <div className="space-y-1.5">{rows?.map((r) => (
        <div key={r.id} className="bg-surface border border-line rounded-l p-3 text-sm flex gap-2">
          <span className="font-bold">{r.action}</span><span className="text-ink-2">{r.table_name}</span>
          <span className="ml-auto text-xs text-ink-2">{new Date(r.created_at).toLocaleString("en-IN")}</span>
        </div>))}
      </div>
      {rows?.length === 0 && <p className="text-sm text-ink-2 mt-2">No audit rows visible to this account.</p>}
    </OpsShell>
  );
}
