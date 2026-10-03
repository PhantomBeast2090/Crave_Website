// The backend has no slug columns (future additive migration may add them).
// Until then: outlets resolve by slugified name OR raw UUID; foods by UUID.

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** Display rating honestly: backend has no ratings yet (all 0/0). */
export function hasRating(rating: number, total: number): boolean {
  return total > 0 && rating > 0;
}
