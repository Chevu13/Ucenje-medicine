-- ---------------------------------------------------------------------------
-- 0005 — Guest orders (no account required to buy)
-- Buying no longer needs a user account. Visitors leave their contact info and
-- Darko/Ljubica arrange the payment and delivery off-site. Orders may now have
-- no linked user, so user_id becomes nullable.
-- Run in the Supabase SQL editor after 0001–0004.
-- ---------------------------------------------------------------------------

alter table public.orders
  alter column user_id drop not null;

-- Publish the two demo products that were left as drafts so the full catalog
-- is visible. (Safe no-op if already published.)
update public.products
  set status = 'published'
  where slug in ('ucenje-ucenja', 'odrzivo-mrsavljenje')
    and status = 'draft';
