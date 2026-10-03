"use client";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function P() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<{ code: string; description: string | null; is_active: boolean; times_used: number }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!session) return;
    createClient().from("coupons").select("code,description,is_active,times_used").order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as { code: string; description: string | null; is_active: boolean; times_used: number }[]); });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Promotions" sub="Sign in."><RequireSignIn action="manage promotions" /></OpsShell>;
  return (
    <OpsShell title="Promotions" sub="All coupon codes + usage. Creation UI lands with the promotions migration.">
      {err && <p className="text-sm text-error" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      {rows?.length === 0 && <ChartCard title="No coupons" empty="No coupon codes exist yet." />}
      <div className="grid sm:grid-cols-2 gap-2">{rows?.map((c) => (
        <div key={c.code} className="bg-surface border border-line rounded-l p-4">
          <p className="font-mono font-bold tabular">{c.code}</p>
          <p className="text-sm text-ink-2">{c.description}</p>
          <p className="text-xs font-bold mt-1">{c.is_active ? "Active" : "Paused"} · used {c.times_used ?? 0}×</p>
        </div>))}
      </div>
    </OpsShell>
  );
}
