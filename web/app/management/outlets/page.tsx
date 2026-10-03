"use client";
import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";

interface O { id: string; name: string; is_open: boolean; is_active: boolean; }

export default function MgmtOutlets() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<O[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = () => {
    createClient().from("outlets").select("id,name,is_open,is_active").order("name").limit(50)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as O[]); });
  };
  useEffect(() => { if (session) load(); }, [session]);
  async function toggle(o: O) {
    setErr(null);
    const { error } = await createClient().rpc("admin_toggle_outlet_status", { p_outlet_id: o.id, p_is_open: !o.is_open });
    if (error) setErr(error.message + " (Known backend issue: this RPC reads a legacy table — use vendor settings as fallback.)");
    else load();
  }
  if (!loading && !session) return <OpsShell title="Outlets" sub="Sign in."><RequireSignIn action="manage outlets" /></OpsShell>;
  return (
    <OpsShell title="Outlets" sub="Open/close via admin RPC.">
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Action failed.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {rows === null && !err && <p className="text-ink-2" role="status">Loading…</p>}
      <div className="space-y-2">
        {rows?.map((o) => (
          <div key={o.id} className="bg-surface border border-line rounded-l p-3 text-sm flex items-center gap-3">
            <p className="font-bold">{o.name}</p>
            <span className="text-xs text-ink-2">{o.is_active ? "active" : "inactive"}</span>
            <button onClick={() => toggle(o)} className="ml-auto px-3 py-2 rounded-m bg-ink text-white text-xs font-bold min-h-11">{o.is_open ? "Close" : "Open"}</button>
          </div>
        ))}
      </div>
    </OpsShell>
  );
}
