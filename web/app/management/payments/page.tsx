"use client";
import { OpsShell } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function P() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<{ id: string; amount: number; status: string; razorpay_order_id: string | null }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!session) return;
    createClient().from("payments").select("id,amount,status,razorpay_order_id").order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as { id: string; amount: number; status: string; razorpay_order_id: string | null }[]); });
  }, [session]);
  if (!loading && !session) return <OpsShell title="Payments" sub="Sign in."><RequireSignIn action="inspect payments" /></OpsShell>;
  const paid = (rows ?? []).filter((r) => ["PAID", "CAPTURED"].includes(r.status)).reduce((a, r) => a + Number(r.amount), 0);
  return (
    <OpsShell title="Payments" sub={`Latest 100 · collected (PAID/CAPTURED): ₹${paid.toLocaleString("en-IN")}. Refunds stay a server action.`}>
      {err && <p className="text-sm text-error" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      <div className="space-y-1.5">{rows?.map((r) => (
        <div key={r.id} className="bg-surface border border-line rounded-l p-3 text-sm flex gap-2 flex-wrap">
          <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill bg-surface-2 border border-line">{r.status}</span>
          <span className="ml-auto tabular">₹{Number(r.amount).toLocaleString("en-IN")}</span>
        </div>))}
      </div>
    </OpsShell>
  );
}
