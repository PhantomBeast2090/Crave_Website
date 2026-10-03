"use client";
import { ConsumerShell } from "@/components/consumer-shell";
import { useState } from "react";
export default function P() {
  const [reduced, setReduced] = useState(false);
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <div className="mt-4 bg-surface border border-line rounded-l p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={reduced} onChange={(e) => { setReduced(e.target.checked); document.documentElement.classList.toggle("reduce-motion", e.target.checked); }} className="w-5 h-5" />
            Reduce motion on this device
          </label>
          <p className="text-xs text-ink-2">CRAVE already respects your OS reduce-motion setting everywhere. This toggle is a demo-local extra.</p>
        </div>
      </div>
    </ConsumerShell>
  );
}
