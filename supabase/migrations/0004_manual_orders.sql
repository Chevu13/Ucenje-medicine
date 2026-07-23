-- ---------------------------------------------------------------------------
-- 0004 — Manual order flow (no online payments)
-- Orders now carry the buyer's contact info; Darko arranges payment via
-- DM/email and marks the order as paid in the admin panel, which grants
-- entitlements.
-- Run this in the Supabase SQL editor after 0001–0003.
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_instagram text,
  add column if not exists customer_note text;

comment on column public.orders.contact_instagram is
  'Instagram handle the buyer wants to be contacted on (without @).';
