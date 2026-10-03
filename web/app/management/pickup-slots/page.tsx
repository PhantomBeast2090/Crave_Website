"use client";
import { OpsShell } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { one } from "@/lib/utils";
export default function P() {
  const { session, loading } = useSession();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ date: string; rows: { id: string; start_time: string; end_time: string; status: string; booked_count: number; capacity: number; outletName: string }[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!session) return;
    createClient().from("pickup_slots").select("id,start_time,end_time,status,booked_count,capacity,outlets(name)").eq("slot_date", date).order("start_time").limit(200)
      .then(({ data: d, error }) => { if (error) setErr(error.message); else setData({ date, rows: ((d ?? []) as unknown as { id: string; start_time: string; end_time: string; status: string; booked_count: number; capacity: number; outlets: { name: string } | { name: string }[] | null }[]).map((s) => ({ ...s, outletName: one(s.outlets)?.name ?? "" })) }); });
  }, [session, date]);
  if (!loading && !session) return <OpsShell title="Pickup slots" sub="Sign in."><RequireSignIn action="inspect slots" /></OpsShell>;
  const rows = data?.date === date ? data.rows : null;
  if (!loading && !session) return <OpsShell title="Pickup slots" sub="Sign in."><RequireSignIn action="inspect slots" /></OpsShell>;
  return (
    <OpsShell title="Pickup slots" sub="Congestion per day across outlets.">
      <label className="text-sm font-bold">Day <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ml-2 h-11 px-3 rounded-m border border-line bg-surface" /></label>
      {err && <p className="text-sm text-error mt-2" role="alert">{err}</p>}
      {rows === null && !err && <p className="text-sm text-ink-2 mt-2" role="status">Loading…</p>}
      <div className="mt-2 space-y-1.5">{rows?.map((s) => (
        <div key={s.id} className="bg-surface border border-line rounded-l p-3 text-sm flex gap-2 flex-wrap">
          <span className="font-bold tabular">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</span>
          <span className="text-ink-2">{s.outletName}</span>
          <span className="ml-auto tabular">{s.booked_count}/{s.capacity} · {s.status}</span>
        </div>))}
      </div>
      {rows?.length === 0 && <p className="text-sm text-ink-2 mt-2">No slots published for this day.</p>}
    </OpsShell>
  );
}
