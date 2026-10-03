// Central analytics bus — never scatter raw calls in components.

export interface TrackInput {
  name: string; entityType?: string; entityId?: string; metadata?: Record<string, unknown>;
}

const queue: TrackInput[] = [];

export function trackEvent(e: TrackInput) {
  queue.push({ ...e, metadata: { ...(e.metadata ?? {}), ts: Date.now() } });
  // Flush path: POST /api/events (Supabase analytics_events) — added when backend 020 lands.
  // Demo mode: retained in-memory only; no PII collected.
  if (queue.length > 50) queue.shift();
}

export function getQueuedEvents(): TrackInput[] { return [...queue]; }
