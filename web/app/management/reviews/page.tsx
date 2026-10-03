"use client";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function P() {
  const { session, loading } = useSession();
  const [rows, setRows] = useState<{ id: string; rating: number; comment: string | null; created_at: string }[] | null>(null);
  useEffect(() => { if (!session) return;
    createClient().from("reviews").select("id,rating,comment,created_at").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setRows((data ?? []) as { id: string; rating: number; comment: string | null; created_at: string }[]));
  }, [session]);
  if (!loading && !session) return <OpsShell title="Reviews" sub="Sign in."><RequireSignIn action="moderate reviews" /></OpsShell>;
  return (
    <OpsShell title="Reviews" sub="Latest 100. Hide/report moderation lands with the reviews upgrade.">
      {rows === null && <p className="text-sm text-ink-2" role="status">Loading…</p>}
      {rows?.length === 0 && <ChartCard title="No reviews" empty="Campus hasn't reviewed anything yet." />}
      <div className="space-y-2">{rows?.map((r) => (
        <article key={r.id} className="bg-surface border border-line rounded-l p-3 text-sm">
          <p aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
          <p className="mt-1">{r.comment || "(no comment)"}</p>
        </article>))}
      </div>
    </OpsShell>
  );
}
