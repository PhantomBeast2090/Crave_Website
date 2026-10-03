// Live public reads against Supabase PostgREST + RPCs (anon/publishable key).
// No demo data. No invented values. Empty/error states surface honestly.
// Works in server components (NEXT_PUBLIC_* inlined) and client components.

import { supabaseAnonKey, supabaseUrl } from "../supabase/env";
import { one } from "../utils";

export interface LiveOutlet {
  id: string; name: string; description: string | null; imageUrl: string | null;
  isOpen: boolean; isActive: boolean; rating: number; totalReviews: number;
  location: string | null; hours: { openTime: string; closeTime: string; daysOpen: string[] } | null;
}

export interface LiveFood {
  id: string; name: string; description: string; price: number;
  imageUrl: string | null; isVeg: boolean; isAvailable: boolean; prepMin: number;
  rating: number; totalReviews: number; outletId: string; outletName: string;
  categoryId: string | null; categoryName: string; tags: string[];
}

export interface LiveCategory { id: string; name: string; }

function headers(): HeadersInit {
  return { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, "Content-Type": "application/json" };
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers: headers(), next: { revalidate: 60 } });
  if (!r.ok) throw new Error(`Supabase ${r.status} on ${path}`);
  return r.json() as Promise<T>;
}

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: headers(), body: JSON.stringify(body), next: { revalidate: 30 },
  });
  if (!r.ok) throw new Error(`RPC ${fn} → ${r.status}`);
  return r.json() as Promise<T>;
}

interface OutletRow {
  id: string; name: string; description: string | null; image_url: string | null;
  is_open: boolean; is_active: boolean; rating: number; total_reviews: number;
  location_description: string | null; building: string | null; operating_hours: LiveOutlet["hours"];
}

export async function listOutlets(): Promise<LiveOutlet[]> {
  const rows = await get<OutletRow[]>(
    "outlets?select=id,name,description,image_url,is_open,is_active,rating,total_reviews,location_description,building,operating_hours&is_active=eq.true&deleted_at=is.null&order=name&limit=50"
  );
  return rows.map((o) => ({
    id: o.id, name: o.name, description: o.description, imageUrl: o.image_url,
    isOpen: o.is_open, isActive: o.is_active, rating: Number(o.rating), totalReviews: o.total_reviews,
    location: o.location_description ?? o.building, hours: o.operating_hours,
  }));
}

export async function listCategories(): Promise<LiveCategory[]> {
  const rows = await get<{ id: string; name: string }[]>("categories?select=id,name&order=name&limit=100");
  return rows;
}

interface SearchRow {
  id: string; name: string; description: string; price: number; image_url: string | null;
  is_veg: boolean; is_available: boolean; prep_time_minutes: number; rating: number; total_reviews: number;
  outlet_id: string; outlet_name: string; category_id: string | null; category_name: string;
}

function toFood(r: SearchRow): LiveFood {
  return {
    id: r.id, name: r.name, description: r.description ?? "", price: Number(r.price),
    imageUrl: r.image_url, isVeg: r.is_veg, isAvailable: r.is_available, prepMin: r.prep_time_minutes ?? 5,
    rating: Number(r.rating), totalReviews: r.total_reviews ?? 0, outletId: r.outlet_id,
    outletName: r.outlet_name ?? "", categoryId: r.category_id, categoryName: r.category_name ?? "", tags: [],
  };
}

export async function searchFoods(query: string, limit = 24): Promise<LiveFood[]> {
  if (!query.trim()) return [];
  const rows = await rpc<SearchRow[]>("search_food", { p_query: query.trim() });
  return rows.slice(0, limit).map(toFood);
}

interface CatalogueResponse {
  outlet: OutletRow & { total_reviews: number };
  food_items: (SearchRow & { tags: string[]; calories: number | null; ingredients: string[]; variants: unknown[] })[];
}

export async function getCatalogue(outletId: string): Promise<{ outlet: LiveOutlet; items: LiveFood[] }> {
  const res = await rpc<CatalogueResponse>("get_catalogue_for_outlet", { p_outlet_id: outletId });
  const o = res.outlet;
  return {
    outlet: {
      id: o.id, name: o.name, description: o.description, imageUrl: o.image_url,
      isOpen: o.is_open, isActive: o.is_active, rating: Number(o.rating), totalReviews: o.total_reviews,
      location: o.location_description ?? o.building, hours: o.operating_hours,
    },
    items: (res.food_items ?? []).map((r) => ({ ...toFood(r), tags: r.tags ?? [] })),
  };
}

interface FoodRow extends SearchRow { calories: number | null; ingredients: string[]; tags: string[]; }

export async function getFood(id: string): Promise<LiveFood | null> {
  const rows = await get<(FoodRow & { outlets: { name: string } | null; categories: { name: string } | null })[]>(
    `food_items?select=*,outlets(name),categories(name)&id=eq.${id}&limit=1`
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    ...toFood({ ...r, outlet_name: one<{ name: string }>(r.outlets as unknown as { name: string } | { name: string }[])?.name ?? "", category_name: one<{ name: string }>(r.categories as unknown as { name: string } | { name: string }[])?.name ?? "" }),
    tags: r.tags ?? [],
  };
}

export async function foodsByCategory(categoryId: string, limit = 24): Promise<LiveFood[]> {
  const rows = await get<(FoodRow & { outlets: { name: string } | null })[]>(
    `food_items?select=*,outlets(name)&category_id=eq.${categoryId}&deleted_at=is.null&order=name&limit=${limit}`
  );
  const cat = await get<{ name: string }[]>(`categories?select=name&id=eq.${categoryId}&limit=1`);
  const catName = cat[0]?.name ?? "";
  return rows.map((r) => ({ ...toFood({ ...r, outlet_name: one<{ name: string }>(r.outlets as unknown as { name: string } | { name: string }[])?.name ?? "", category_name: catName }), tags: r.tags ?? [] }));
}

export async function cheapFoods(limit = 12): Promise<LiveFood[]> {
  const rows = await get<(FoodRow & { outlets: { name: string } | null; categories: { name: string } | null })[]>(
    `food_items?select=*,outlets(name),categories(name)&deleted_at=is.null&price=lt.100&order=price.asc&limit=${limit}`
  );
  return rows.map((r) => ({ ...toFood({ ...r, outlet_name: one<{ name: string }>(r.outlets as unknown as { name: string } | { name: string }[])?.name ?? "", category_name: one<{ name: string }>(r.categories as unknown as { name: string } | { name: string }[])?.name ?? "" }), tags: r.tags ?? [] }));
}

export async function outletFoods(outletId: string, limit = 8): Promise<LiveFood[]> {
  const { items } = await getCatalogue(outletId);
  return items.slice(0, limit);
}

export interface LiveSlot {
  id: string; outletId: string; date: string; start: string; end: string;
  capacity: number; booked: number; status: "AVAILABLE" | "LIMITED" | "FULL";
}

export async function listSlots(outletId: string, date: string): Promise<LiveSlot[]> {
  const rows = await get<{ id: string; outlet_id: string; slot_date: string; start_time: string; end_time: string; capacity: number; booked_count: number; status: LiveSlot["status"] }[]>(
    `pickup_slots?select=id,outlet_id,slot_date,start_time,end_time,capacity,booked_count,status&outlet_id=eq.${outletId}&slot_date=eq.${date}&order=start_time&limit=60`
  );
  return rows.map((s) => ({ id: s.id, outletId: s.outlet_id, date: s.slot_date, start: s.start_time, end: s.end_time, capacity: s.capacity, booked: s.booked_count, status: s.status }));
}
