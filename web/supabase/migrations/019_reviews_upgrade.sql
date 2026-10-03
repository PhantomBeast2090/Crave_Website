-- 019_reviews_upgrade.sql — AUTHORED, NOT APPLIED.
-- Requires DBA review + staging verify before apply. Additive only:
-- new tables, new columns with defaults, one new RPC. No existing
-- policy/trigger/RPC is altered, so the Android app is unaffected.
--
-- What it enables: review photos, helpful votes, reports, vendor replies,
-- server-computed aggregates, verified-order-gated writes via RPC.

-- 1. Status + counters on reviews -------------------------------------------
alter table public.reviews
  add column if not exists status text not null default 'published',
  add column if not exists helpful_count integer not null default 0,
  add column if not exists reports_count integer not null default 0;

-- 2. Helpful votes (one per user per review) ----------------------------------
create table if not exists public.review_helpful_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);
alter table public.review_helpful_votes enable row level security;
drop policy if exists helpful_votes_owner_all on public.review_helpful_votes;
create policy helpful_votes_owner_all on public.review_helpful_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists helpful_votes_public_read on public.review_helpful_votes;
create policy helpful_votes_public_read on public.review_helpful_votes
  for select using (true);

create or replace function public.bump_helpful_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.reviews set helpful_count = helpful_count + 1 where id = new.review_id;
    return new;
  else
    update public.reviews set helpful_count = greatest(helpful_count - 1, 0) where id = old.review_id;
    return old;
  end if;
end $$;
drop trigger if exists trg_bump_helpful_count on public.review_helpful_votes;
create trigger trg_bump_helpful_count
  after insert or delete on public.review_helpful_votes
  for each row execute function public.bump_helpful_count();

-- 3. Reports ------------------------------------------------------------------
create table if not exists public.review_reports (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);
alter table public.review_reports enable row level security;
drop policy if exists review_reports_reporter on public.review_reports;
create policy review_reports_reporter on public.review_reports
  for insert with check (auth.uid() = reporter_id);
drop policy if exists review_reports_admin_read on public.review_reports;
create policy review_reports_admin_read on public.review_reports
  for select using (public.is_admin());

create or replace function public.bump_reports_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.reviews set reports_count = reports_count + 1, status = 'reported' where id = new.review_id;
  return new;
end $$;
drop trigger if exists trg_bump_reports_count on public.review_reports;
create trigger trg_bump_reports_count
  after insert on public.review_reports
  for each row execute function public.bump_reports_count();

-- 4. Vendor replies (one per review, outlet-owned) -----------------------------
create table if not exists public.review_replies (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null unique references public.reviews(id) on delete cascade,
  vendor_id uuid not null references public.profiles(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.review_replies enable row level security;
drop policy if exists review_replies_public_read on public.review_replies;
create policy review_replies_public_read on public.review_replies
  for select using (true);
drop policy if exists review_replies_vendor_write on public.review_replies;
create policy review_replies_vendor_write on public.review_replies
  for all using (
    auth.uid() = vendor_id and exists (
      select 1 from public.reviews r
      join public.outlets o on o.id = r.outlet_id
      where r.id = review_replies.review_id and o.vendor_id = auth.uid()
    )
  ) with check (auth.uid() = vendor_id);

-- 5. Server aggregates (never client-averaged) ---------------------------------
-- Maintains outlets.rating/total_reviews and food_items.rating/total_reviews
-- over published reviews only.
create or replace function public.refresh_review_aggregates()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_outlet uuid; v_food uuid;
begin
  v_outlet := coalesce(new.outlet_id, old.outlet_id);
  v_food := coalesce(new.food_item_id, old.food_item_id);
  if v_outlet is not null then
    update public.outlets o set
      rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where outlet_id = v_outlet and status = 'published'), 0),
      total_reviews = (select count(*) from public.reviews where outlet_id = v_outlet and status = 'published')
    where o.id = v_outlet;
  end if;
  if v_food is not null then
    update public.food_items f set
      rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where food_item_id = v_food and status = 'published'), 0),
      total_reviews = (select count(*) from public.reviews where food_item_id = v_food and status = 'published')
    where f.id = v_food;
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists trg_refresh_review_aggregates on public.reviews;
create trigger trg_refresh_review_aggregates
  after insert or update of rating, status or delete on public.reviews
  for each row execute function public.refresh_review_aggregates();

-- 6. Verified-order-gated write RPC --------------------------------------------
-- Eligibility: caller's own order, PICKED_UP, within 30 days. The web app
-- must use this RPC; direct INSERT RLS is intentionally left as-is so
-- existing clients keep working.
create or replace function public.submit_review(
  p_order_id uuid, p_rating integer, p_comment text default null, p_food_item_id uuid default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_outlet uuid;
  v_food uuid;
  v_review uuid;
begin
  if v_uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'BAD_RATING'; end if;
  select outlet_id into v_outlet from public.orders
   where id = p_order_id and user_id = v_uid and status = 'PICKED_UP'
     and coalesce(picked_up_at, created_at) >= now() - interval '30 days';
  if v_outlet is null then raise exception 'NOT_ELIGIBLE'; end if;
  if p_food_item_id is not null then
    select food_item_id into v_food from public.order_items
     where order_id = p_order_id and food_item_id = p_food_item_id limit 1;
    if v_food is null then raise exception 'FOOD_NOT_IN_ORDER'; end if;
  end if;
  insert into public.reviews (user_id, outlet_id, food_item_id, order_id, rating, comment, status)
  values (v_uid, v_outlet, v_food, p_order_id, p_rating, nullif(trim(p_comment), ''), 'published')
  on conflict (user_id, order_id) do update set rating = excluded.rating, comment = excluded.comment, updated_at = now()
  returning id into v_review;
  return v_review;
end $$;
revoke all on function public.submit_review(uuid, integer, text, uuid) from public;
grant execute on function public.submit_review(uuid, integer, text, uuid) to authenticated;
