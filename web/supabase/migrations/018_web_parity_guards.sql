-- 018_web_parity_guards.sql — ADDITIVE ONLY (expand phase). No destructive changes.
-- (1) get_admin_stats: profiles-based replacement (keeps old name; fixes users->profiles bug from 009).
-- (2) pickup_tokens owner SELECT so students can render their QR (backend REQUIRED for pickup).
-- Verify on restored prod copy before apply. Android app unaffected (additive).

-- (1) Fixed admin stats (admin-only via is_admin())
create or replace function public.get_admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb; begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select jsonb_build_object(
    'totalUsers', (select count(*) from public.profiles where role = 'STUDENT'),
    'totalVendors', (select count(*) from public.profiles where role = 'VENDOR'),
    'totalOutlets', (select count(*) from public.outlets where deleted_at is null),
    'totalOrders', (select count(*) from public.orders),
    'activeOrders', (select count(*) from public.orders where status in ('PLACED','ACCEPTED','PREPARING','READY')),
    'completedOrders', (select count(*) from public.orders where status = 'PICKED_UP'),
    'revenue', (select coalesce(sum(total),0) from public.orders where status = 'PICKED_UP'),
    'ordersToday', (select count(*) from public.orders where created_at >= date_trunc('day', now())),
    'revenueToday', (select coalesce(sum(total),0) from public.orders where status = 'PICKED_UP' and created_at >= date_trunc('day', now()))
  ) into r; return r; end $$;
revoke all on function public.get_admin_stats() from public; grant execute on function public.get_admin_stats() to authenticated;

-- (2) Student can SELECT own pickup tokens (fixes QR denial; vendors/admin keep existing policies)
drop policy if exists pickup_tokens_owner_select on public.pickup_tokens;
create policy pickup_tokens_owner_select on public.pickup_tokens for select
  using (exists (select 1 from public.orders o where o.id = pickup_tokens.order_id and o.user_id = auth.uid()));
