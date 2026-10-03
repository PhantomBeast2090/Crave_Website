"use client";
import { useEffect, useState } from "react";
import { ConsumerShell } from "@/components/consumer-shell";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/data/authed";

interface R { id: string; rating: number; comment: string | null; created_at: string; user_id: string; order_id: string | null; }

export default function ReviewsPage() {
  const { session } = useSession();
  const [items, setItems] = useState<R[] | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${supabaseUrl}/rest/v1/reviews?select=id,rating,comment,created_at,user_id,order_id&order=created_at.desc&limit=30`,
      { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } })
      .then((r) => r.json()).then((d) => setItems(d as R[])).catch(() => setItems([]));
  }, []);

  async function submit() {
    if (!session) { setMsg("Sign in to write a review."); return; }
    if (!comment.trim()) { setMsg("Write a line or two first."); return; }
    setBusy(true); setMsg(null);
    try {
      const sb = createClient();
      // Eligibility: one picked-up order required (server-enforced via RLS + UNIQUE(user,order) when 019 lands;
      // today the base table accepts owner writes — we check eligibility client-side and state it).
      const { data: orders } = await sb.from("orders").select("id").eq("user_id", session.userId).eq("status", "PICKED_UP").limit(1);
      if (!orders?.length) throw new Error("Reviews unlock after your first picked-up order — order something and come back.");
      const { error } = await sb.from("reviews").insert({
        user_id: session.userId, rating, comment: comment.trim(),
        order_id: (orders as { id: string }[])[0].id,
      });
      if (error) throw new Error(error.message);
      setComment("");
      setMsg("Published. Thanks for saying what you really think.");
      const r = await fetch(`${supabaseUrl}/rest/v1/reviews?select=id,rating,comment,created_at,user_id,order_id&order=created_at.desc&limit=30`,
        { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } });
      setItems(await r.json());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Review didn't post. Your text is kept — retry.");
    } finally {
      setBusy(false);
    }
  }

  const dist = [0, 0, 0, 0, 0];
  items?.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) dist[5 - r.rating]++; });
  const total = items?.length ?? 0;

  return (
    <ConsumerShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Reviews</h1>
        <p className="text-sm text-ink-2">Verified picked-up orders only. Photos, helpful votes and moderation arrive with the reviews upgrade.</p>
        {items === null && <p className="mt-4 text-ink-2" role="status">Loading reviews…</p>}
        {items !== null && total === 0 && (
          <div className="mt-4 bg-surface border border-line rounded-l p-6 text-center">
            <h2 className="font-display text-xl font-bold">No reviews yet.</h2>
            <p className="text-sm text-ink-2">Be the first person to say what you really think — after a picked-up order.</p>
          </div>
        )}
        {total > 0 && (
          <div className="mt-4 bg-surface border border-line rounded-l p-4">
            <p className="font-display text-2xl font-bold tabular">{(items!.reduce((a, r) => a + r.rating, 0) / total).toFixed(1)} <span className="text-base font-sans font-normal text-ink-2">· {total} ratings</span></p>
            <div className="mt-2 space-y-1" role="img" aria-label="Rating distribution">
              {dist.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-6">★{5 - i}</span>
                  <span className="flex-1 h-2 rounded-pill bg-surface-2 overflow-hidden"><span className="block h-full bg-citrus rounded-pill" style={{ width: total ? `${(c / total) * 100}%` : "0%" }} /></span>
                  <span className="w-8 text-ink-2 tabular">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-3 space-y-2">
          {items?.map((r) => (
            <article key={r.id} className="bg-surface border border-line rounded-l p-4">
              <p className="text-sm" aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span> <span className="text-xs text-ink-2">· {new Date(r.created_at).toLocaleDateString("en-IN")} · verified order</span></p>
              <p className="text-sm mt-1">{r.comment || "(no comment)"}</p>
            </article>
          ))}
        </div>
        <section className="mt-6 bg-surface border border-line rounded-l p-4" aria-label="Write a review">
          <h2 className="font-bold">Write a review</h2>
          <label className="mt-2 block text-sm font-bold">Rating
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="ml-2 h-11 px-3 rounded-m border border-line bg-base" aria-label="Star rating">
              {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} stars</option>)}
            </select>
          </label>
          <label htmlFor="rc" className="mt-2 block text-sm font-bold">Comment</label>
          <textarea id="rc" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={280} rows={3}
            placeholder="What should the next student know?" className="mt-1 w-full p-3 rounded-m border border-line bg-base" />
          {msg && <p className="mt-2 text-sm font-bold" role="status">{msg}</p>}
          <button onClick={submit} disabled={busy} className="mt-2 px-4 py-3 rounded-m bg-ink text-white font-bold disabled:opacity-60 min-h-11">
            {session ? (busy ? "Posting…" : "Post review") : "Sign in to post"}
          </button>
        </section>
      </div>
    </ConsumerShell>
  );
}
