"use client";
import { useEffect, useState } from "react";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

export default function VendorReviews() {
  const { session, loading: authLoading } = useSession();
  const { outlets } = useVendor();
  const [items, setItems] = useState<{ id: string; rating: number; comment: string | null; created_at: string }[] | null>(null);
  useEffect(() => {
    if (!outlets?.length) return;
    createClient().from("reviews").select("id,rating,comment,created_at").in("outlet_id", outlets.map((o) => o.id)).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setItems((data ?? []) as { id: string; rating: number; comment: string | null; created_at: string }[]));
  }, [outlets]);
  if (!authLoading && !session) return <OpsShell title="Reviews" sub="Sign in."><RequireSignIn action="see reviews" /></OpsShell>;
  return (
    <OpsShell title="Reviews" sub="What students really think. Replies land with the reviews upgrade.">
      {items === null && <p className="text-ink-2" role="status">Loading reviews…</p>}
      {items?.length === 0 && <ChartCard title="No reviews yet" empty="Reviews unlock for students after picked-up orders. They'll appear here with rating distribution." />}
      <div className="space-y-2">
        {items?.map((r) => (
          <article key={r.id} className="bg-surface border border-line rounded-l p-4 text-sm">
            <p aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span> <span className="text-xs text-ink-2">· {new Date(r.created_at).toLocaleDateString("en-IN")}</span></p>
            <p className="mt-1">{r.comment || "(no comment)"}</p>
          </article>
        ))}
      </div>
    </OpsShell>
  );
}
