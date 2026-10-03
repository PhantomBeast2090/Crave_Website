"use client";
// Queue urgency primitives: live age timers + SLA breach flags.
// Thresholds are documented here so ops can tune them in one place.

import { useEffect, useState } from "react";
import type { OrderStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/** Minutes an order may sit in a state before it's flagged. */
export const SLA_MIN: Partial<Record<OrderStatus, number>> = {
  PLACED: 5, ACCEPTED: 10, PREPARING: 15, READY: 10,
};

export function ageMin(createdAt: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60000));
}

export function breach(status: OrderStatus, createdAt: string, now: number): boolean {
  const limit = SLA_MIN[status];
  return limit != null && ageMin(createdAt, now) > limit;
}

/** Ticks every 30s so ages stay live without re-fetching. */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function AgeChip({ status, createdAt, now }: { status: OrderStatus; createdAt: string; now: number }) {
  const mins = ageMin(createdAt, now);
  const bad = breach(status, createdAt, now);
  const label = mins < 1 ? "just now" : `${mins} min in queue`;
  return (
    <span className={cn(
      "text-[11px] font-bold px-2 py-0.5 rounded-pill border",
      bad ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-surface-2 text-ink-2 border-line"
    )} title={bad ? `Over the ${SLA_MIN[status]}-minute target for ${status}` : label}>
      {bad ? `⚠ ${label} — over target` : label}
    </span>
  );
}

/** Soft urgency beep (WebAudio, no assets). Off unless explicitly enabled. */
export function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; gain.gain.value = 0.06;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* audio unavailable — visual cues carry it */ }
}
