"use client";
import { useEffect, useState } from "react";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

export default function VendorPromos() {
  const { session, loading: authLoading } = useSession();
  const { outlets } = useVendor();
  const [items, setItems] = useState<{ code: string; description: string | null; is_active: boolean }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!outlets?.length) return;
    createClient().from("coupons").select("code,description,is_active").in("outlet_id", outlets.map((o) => o.id)).limit(50)
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setItems((data ?? []) as { code: string; description: string | null; is_active: boolean }[]);
      });
  }, [outlets]);
  if (!authLoading && !session) return <OpsShell title="Promotions" sub="Sign in."><RequireSignIn action="manage promotions" /></OpsShell>;
  return (
    <OpsShell title="Promotions" sub="Outlet coupons on the shared coupons infrastructure.">
      {err && <div className="border border-red-200 bg-red-50 rounded-l p-4" role="alert"><p className="font-bold">Promotions didn&apos;t load.</p><p className="text-sm text-ink-2">{err}</p></div>}
      {items === null && !err && <p className="text-ink-2" role="status">Loading promotions…</p>}
      {items?.length === 0 && <ChartCard title="No promotions" empty="No coupon codes for your outlet yet. Creation UI lands with the promotions migration (usage limits + time windows enforced server-side)." />}
      <div className="grid sm:grid-cols-2 gap-2">
        {items?.map((c) => (
          <div key={c.code} className="bg-surface border border-line rounded-l p-4">
            <p className="font-mono font-bold tabular">{c.code}</p>
            <p className="text-sm text-ink-2">{c.description}</p>
            <p className="text-xs font-bold mt-1">{c.is_active ? "Active" : "Paused"}</p>
          </div>
        ))}
      </div>
    </OpsShell>
  );
}
