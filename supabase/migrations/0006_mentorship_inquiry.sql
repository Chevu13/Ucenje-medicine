-- ---------------------------------------------------------------------------
-- 0006 — Mentorship inquiries
-- Mentorship now uses the same "leave your contact + description" flow as
-- product orders. An inquiry can arrive even when no mentorship product is
-- published, so order items may exist without a linked product.
-- Run in the Supabase SQL editor after 0001–0005.
-- ---------------------------------------------------------------------------

alter table public.order_items
  alter column product_id drop not null;
