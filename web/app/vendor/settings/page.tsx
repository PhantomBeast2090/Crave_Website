"use client";
import { useState } from "react";
import { OpsShell } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useVendor } from "@/lib/data/vendor";
import { useSession, RequireSignIn } from "@/lib/data/authed";

export default function VendorSettings() {
  const { session, loading: authLoading } = useSession();
  const { outlets, load } = useVendor();
  const [msg, setMsg] = useState<string | null>(null);
  if (!authLoading && !session) return <OpsShell title="Settings" sub="Sign in."><RequireSignIn action="change settings" /></OpsShell>;

  async function setOpen(id: string, v: boolean) {
    setMsg(null);
    const { error } = await createClient().from("outlets").update({ is_open: v }).eq("id", id);
    if (error) setMsg(error.message);
    else { setMsg(v ? "Outlet opened." : "Outlet closed — new orders pause, existing queue stays."); load(); }
  }

  return (
    <OpsShell title="Settings" sub="Open/close state applies immediately.">
      {outlets?.map((o) => (
        <div key={o.id} className="bg-surface border border-line rounded-l p-4 flex items-center gap-3">
          <p className="font-bold">{o.name}</p>
          <label className="ml-auto inline-flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={o.is_open} onChange={(e) => setOpen(o.id, e.target.checked)} className="w-5 h-5 accent-[#1F9D55]" aria-label={`Open: ${o.name}`} />
            {o.is_open ? "Open" : "Closed"}
          </label>
        </div>
      ))}
      {msg && <p className="mt-2 text-sm font-bold" role="status">{msg}</p>}
    </OpsShell>
  );
}
