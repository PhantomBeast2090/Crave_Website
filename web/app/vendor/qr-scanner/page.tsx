"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OpsShell } from "@/components/ops-shell";
import { createClient } from "@/lib/supabase/client";
import { useSession, RequireSignIn } from "@/lib/data/authed";

declare global { interface Window { BarcodeDetector?: new (opts?: Record<string, string[]>) => { detect: (img: HTMLVideoElement) => Promise<{ rawValue: string }[]> }; } }

export default function QRScanner() {
  const { session, loading } = useSession();
  const [token, setToken] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [camErr, setCamErr] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function verify(t: string) {
    const v = t.trim();
    if (!v) return;
    setBusy(true); setErr(null); setResult(null);
    try {
      const sb = createClient();
      const { data, error } = await sb.rpc("verify_pickup_token", { p_token: v });
      if (error) throw new Error(mapErr(error.message));
      const r = data as { order_number?: string } | null;
      setResult(r?.order_number ? `Picked up — order ${r.order_number}. Inventory and slot released.` : "Picked up. Order marked complete.");
      setToken("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed. Retry.");
    } finally {
      setBusy(false);
    }
  }

  function mapErr(msg: string): string {
    if (/expired/i.test(msg)) return "That token expired (2h window). The student needs a fresh code from their order.";
    if (/used/i.test(msg)) return "That token was already used — this order is complete.";
    if (/READY/i.test(msg)) return "That order isn't READY yet — mark it ready first.";
    return msg || "Verification failed. Retry.";
  }

  useEffect(() => {
    if (!camOn) return;
    let stream: MediaStream | null = null;
    let stop = false;
    (async () => {
      try {
        if (!window.BarcodeDetector) { setCamErr("This browser can't scan QR codes — paste the token instead."); setCamOn(false); return; }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stop) { stream.getTracks().forEach((t) => t.stop()); return; }
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (stop) return;
          try {
            const found = await detector.detect(video);
            if (found.length) { setToken(found[0].rawValue); setCamOn(false); verify(found[0].rawValue); return; }
          } catch { /* keep scanning */ }
          setTimeout(tick, 400);
        };
        tick();
      } catch {
        setCamErr("Camera unavailable — check permission, or paste the token instead.");
        setCamOn(false);
      }
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn]);

  if (!loading && !session) return <OpsShell title="QR scanner" sub="Sign in."><RequireSignIn action="scan pickups" /></OpsShell>;

  return (
    <OpsShell title="QR scanner" sub="READY → PICKED_UP via verify_pickup_token. One scan, one completion.">
      <div className="bg-surface border border-line rounded-l p-4 max-w-lg">
        <label htmlFor="qr-token" className="text-sm font-bold">Pickup token</label>
        <div className="mt-1 flex gap-2">
          <input id="qr-token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the 64-character token"
            className="flex-1 h-12 px-4 rounded-m border border-line bg-base font-mono text-sm min-w-0" autoComplete="off" inputMode="text" />
          <button onClick={() => setCamOn(true)} className="px-4 h-12 rounded-m border border-line font-bold min-h-11" aria-label="Scan with camera">Scan</button>
        </div>
        {camOn && <video ref={videoRef} className="mt-3 w-full aspect-[4/3] object-cover rounded-l bg-ink" aria-label="Camera viewfinder" playsInline muted />}
        {camErr && <p className="mt-2 text-sm text-ink-2">{camErr}</p>}
        {err && <div className="mt-2 border border-red-200 bg-red-50 rounded-m p-3 text-sm" role="alert"><strong>Not verified.</strong> {err}</div>}
        {result && <p className="mt-2 border border-green-200 bg-green-50 rounded-m p-3 text-sm font-bold" role="status">{result}</p>}
        <button onClick={() => verify(token)} disabled={busy || !token.trim()} className="mt-3 w-full h-12 rounded-m bg-ink text-white font-bold disabled:opacity-50 min-h-11">
          {busy ? "Verifying…" : "Verify pickup"}
        </button>
      </div>
      <p className="mt-3 text-sm"><Link href="/vendor/orders" className="underline">← Back to orders</Link></p>
    </OpsShell>
  );
}
