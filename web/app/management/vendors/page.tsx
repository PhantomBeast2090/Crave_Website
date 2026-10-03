"use client";
import { OpsShell } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MgmtVendors() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<{ id: string; name: string; email: string; role: string; is_active: boolean }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    createClient().from("profiles").select("id,name,email,role,is_active").in("role", ["VENDOR", "PENDING_VENDOR"]).order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as { id: string; name: string; email: string; role: string; is_active: boolean }[]); });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Vendors" sub="Sign in."><RequireSignIn action="manage vendors" /></OpsShell>;
  return (
    <OpsShell title="Vendors" sub="Vendor + pending approvals. Promotion to VENDOR is an admin server action.">
      {err && <p className="text-sm text-error" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      <div className="mt-2 space-y-1.5">
        {rows?.map((p) => (
          <div key={p.id} className="bg-surface border border-line rounded-l p-3 text-sm flex gap-2 flex-wrap">
            <span className="font-bold">{p.name}</span><span className="text-ink-2">{p.email}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-surface-2 border border-line">{p.role}</span>
          </div>
        ))}
      </div>
      {rows?.length === 0 && <p className="text-sm text-ink-2 mt-2">No vendor accounts yet.</p>}
    </OpsShell>
  );
}
