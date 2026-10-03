"use client";
// Shared vendor data hook: my outlet(s) → orders → actions via SECURITY DEFINER RPCs.

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/data/authed";
import type { OrderStatus } from "@/lib/domain/types";

export interface VOutlet { id: string; name: string; is_open: boolean; }
export interface VOrder {
  id: string; order_number: string; status: OrderStatus; total: number; created_at: string;
  payment_method: string; payment_status: string;
  order_items: { food_name: string; quantity: number }[];
}

export function useVendor() {
  const { session, loading: authLoading } = useSession();
  const [outlets, setOutlets] = useState<VOutlet[] | null>(null);
  const [orders, setOrders] = useState<VOrder[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    const sb = createClient();
    const { data: ol, error: oErr } = await sb.from("outlets").select("id,name,is_open").order("name");
    if (oErr) { setErr(oErr.message); return; }
    setOutlets((ol ?? []) as VOutlet[]);
    const { data: od, error: dErr } = await sb.from("orders")
      .select("id,order_number,status,total,created_at,payment_method,payment_status,order_items(food_name,quantity)")
      .order("created_at", { ascending: false }).limit(100);
    if (dErr) { setErr(dErr.message); return; }
    setOrders((od ?? []) as unknown as VOrder[]);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let on = true;
    (async () => {
      const sb = createClient();
      const { data: ol, error: oErr } = await sb.from("outlets").select("id,name,is_open").order("name");
      if (!on) return;
      if (oErr) { setErr(oErr.message); return; }
      setOutlets((ol ?? []) as VOutlet[]);
      const { data: od, error: dErr } = await sb.from("orders")
        .select("id,order_number,status,total,created_at,payment_method,payment_status,order_items(food_name,quantity)")
        .order("created_at", { ascending: false }).limit(100);
      if (!on) return;
      if (dErr) { setErr(dErr.message); return; }
      setOrders((od ?? []) as unknown as VOrder[]);
    })();
    const sb = createClient();
    const ch = sb.channel("vendor:orders").on(
      "postgres_changes", { event: "*", schema: "public", table: "orders" }, () => { if (on) load(); }
    ).subscribe();
    return () => { on = false; sb.removeChannel(ch); };
  }, [session, load]);

  async function act(rpc: string, orderId: string, extra?: Record<string, unknown>) {
    setActing(orderId + rpc); setErr(null);
    try {
      const sb = createClient();
      const { error } = await sb.rpc(rpc, { p_order_id: orderId, ...(extra ?? {}) });
      if (error) throw new Error(error.message);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed. Retry.");
    } finally {
      setActing(null);
    }
  }

  return { session, authLoading, outlets, orders, err, acting, load, act };
}
