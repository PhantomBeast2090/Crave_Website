-- 020_growth.sql — AUTHORED, NOT APPLIED.
-- Requires DBA review + staging verify before apply. Additive only:
-- nullable columns, new tables, new indexes. No existing object altered.
--
-- What it enables: stable /outlets/[slug] URLs, curated collections,
-- outlet favourites, analytics/search event pipelines, group ordering.

-- 1. Slugs (stable human URLs; NULL until backfilled, then UNIQUE) -------------
create or replace function public.slugify(t text)
returns text language sql immutable set search_path = public as $$
  select trim(both '-' from regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '-', 'g'));
$$;

alter table public.outlets add column if not exists slug text;
alter table public.food_items add column if not exists slug text;
alter table public.categories add column if not exists slug text;

-- Backfill with collision-safe suffixes (run once; concurrent-safe enough
-- for a catalogue this size, re-runnable).
do $$
declare r record; n int; base text;
begin
  for r in select id, name from public.outlets where slug is null loop
    base := public.slugify(r.name); n := 0;
    loop
      begin
        update public.outlets set slug = base || case when n = 0 then '' else '-' || n::text end where id = r.id;
        exit;
      exception when unique_violation then n := n + 1;
      end;
    end loop;
  end loop;
  for r in select id, name, outlet_id from public.food_items where slug is null loop
    base := public.slugify(r.name); n := 0;
    loop
      begin
        update public.food_items set slug = base || case when n = 0 then '' else '-' || n::text end where id = r.id;
        exit;
      exception when unique_violation then n := n + 1;
      end;
    end loop;
  end loop;
  for r in select id, name from public.categories where slug is null loop
    base := public.slugify(r.name); n := 0;
    loop
      begin
        update public.categories set slug = base || case when n = 0 then '' else '-' || n::text end where id = r.id;
        exit;
      exception when unique_violation then n := n + 1;
      end;
    end loop;
  end loop;
end $$;

alter table public.outlets add constraint outlets_slug_unique unique (slug);
alter table public.food_items add constraint food_items_slug_unique unique (slug);
alter table public.categories add constraint categories_slug_unique unique (slug);

-- Keep slugs fresh on future inserts (only when not explicitly set).
create or replace function public.fill_slug()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.slug is null or new.slug = '' then new.slug := public.slugify(new.name); end if;
  return new;
end $$;
drop trigger if exists trg_fill_slug_outlets on public.outlets;
create trigger trg_fill_slug_outlets before insert on public.outlets for each row execute function public.fill_slug();
drop trigger if exists trg_fill_slug_food on public.food_items;
create trigger trg_fill_slug_food before insert on public.food_items for each row execute function public.fill_slug();
drop trigger if exists trg_fill_slug_categories on public.categories;
create trigger trg_fill_slug_categories before insert on public.categories for each row execute function public.fill_slug();

-- 2. Collections (curated shelves: exam-week fuel, under-100, new…) ------------
create table if not exists public.collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.collection_items (
  collection_id uuid not null references public.collections(id) on delete cascade,
  food_item_id uuid not null references public.food_items(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, food_item_id)
);
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections for select using (is_active = true);
drop policy if exists collection_items_public_read on public.collection_items;
create policy collection_items_public_read on public.collection_items for select using (true);
-- Writes stay admin-only until the promotions migration adds editors.

-- 3. Outlet favourites ----------------------------------------------------------
create table if not exists public.outlet_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, outlet_id)
);
alter table public.outlet_favorites enable row level security;
drop policy if exists outlet_favorites_owner on public.outlet_favorites;
create policy outlet_favorites_owner on public.outlet_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Analytics + search event pipelines (PII-minimal) ---------------------------
create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  event_name text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_events_name_time on public.analytics_events (event_name, created_at desc);
create index if not exists idx_analytics_events_entity on public.analytics_events (entity_type, entity_id);
alter table public.analytics_events enable row level security;
drop policy if exists analytics_events_insert on public.analytics_events;
create policy analytics_events_insert on public.analytics_events
  for insert with check (auth.uid() = user_id or user_id is null);
drop policy if exists analytics_events_admin_read on public.analytics_events;
create policy analytics_events_admin_read on public.analytics_events
  for select using (public.is_admin());

create table if not exists public.search_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  query text not null,
  filters jsonb not null default '{}',
  result_count integer not null default 0,
  latency_ms integer,
  clicked_food_id uuid references public.food_items(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_search_events_query on public.search_events (query);
create index if not exists idx_search_events_time on public.search_events (created_at desc);
alter table public.search_events enable row level security;
drop policy if exists search_events_insert on public.search_events;
create policy search_events_insert on public.search_events
  for insert with check (auth.uid() = user_id or user_id is null);
drop policy if exists search_events_admin_read on public.search_events;
create policy search_events_admin_read on public.search_events
  for select using (public.is_admin());

-- 5. Group ordering (tables only; session RPCs are a follow-up migration) ------
create table if not exists public.group_order_sessions (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  outlet_id uuid not null references public.outlets(id) on delete restrict,
  pickup_slot_id uuid references public.pickup_slots(id) on delete restrict,
  invite_code text not null unique,
  status text not null default 'OPEN',
  created_at timestamptz not null default now()
);
create table if not exists public.group_order_items (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.group_order_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  food_item_id uuid not null references public.food_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);
alter table public.group_order_sessions enable row level security;
alter table public.group_order_items enable row level security;
-- No policies yet: sessions open no access until the session-RPC migration
-- defines invite-code redemption. Default-deny is intentional.
