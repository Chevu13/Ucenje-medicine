-- ============================================================================
-- Učenje medicine — 0001_schema.sql
-- Core relational schema for Supabase/PostgreSQL.
-- Run with: supabase db push  (or paste into the SQL editor in order 0001→0003)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('user', 'mentor', 'admin');
create type public.product_type as enum ('course', 'ebook', 'script', 'mentorship', 'challenge');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');
create type public.payment_status as enum ('initiated', 'succeeded', 'failed', 'cancelled');
create type public.mentorship_mode as enum ('purchase', 'application');
create type public.application_status as enum ('pending', 'approved', 'rejected');
create type public.enrollment_status as enum ('active', 'paused', 'completed');
create type public.task_status as enum ('todo', 'done');
create type public.task_priority as enum ('low', 'normal', 'high');
create type public.challenge_status as enum ('draft', 'scheduled', 'active', 'completed', 'archived');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users, created by trigger)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helper functions (security definer, used by RLS)
-- ---------------------------------------------------------------------------
create or replace function public.current_role_is(required public.user_role[])
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(required)
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.current_role_is(array['admin']::public.user_role[]); $$;

create or replace function public.is_mentor_or_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.current_role_is(array['mentor','admin']::public.user_role[]); $$;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  type public.product_type not null,
  category_id uuid references public.product_categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  cover_url text,
  -- price is nullable on purpose: demo/unpriced items show "Cena uskoro"
  price_cents integer check (price_cents is null or price_cents >= 0),
  sale_price_cents integer check (sale_price_cents is null or sale_price_cents >= 0),
  currency text not null default 'RSD',
  is_free boolean not null default false,
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  is_demo boolean not null default false,
  author_name text,
  page_count integer,
  seo_title text,
  seo_description text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_type_status on public.products (type, status);
create index idx_products_featured on public.products (featured) where featured = true;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  level text,          -- e.g. "Pretklinika"
  subject text,        -- e.g. "Anatomija"
  duration_text text   -- e.g. "6 nedelja"
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_modules_course on public.course_modules (course_id, position);

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text,
  youtube_url text,
  duration_minutes int,
  is_free_preview boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (module_id, slug)
);
create index idx_lessons_module on public.course_lessons (module_id, position);

create table public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index idx_progress_user on public.user_lesson_progress (user_id);

-- ---------------------------------------------------------------------------
-- Protected digital files (e-books, scripts, mentorship/challenge materials)
-- Files live in a PRIVATE storage bucket; table stores the path only.
-- ---------------------------------------------------------------------------
create table public.digital_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  bucket text not null default 'protected-files',
  storage_path text not null,
  file_name text not null,
  content_type text not null default 'application/pdf',
  file_size_bytes bigint,
  download_enabled boolean not null default true,
  preview_page_count int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_files_product on public.digital_files (product_id);

-- ---------------------------------------------------------------------------
-- Commerce
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'RSD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_user on public.orders (user_id, created_at desc);
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  title_snapshot text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity int not null default 1 check (quantity > 0)
);
create index idx_order_items_order on public.order_items (order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_ref text,
  status public.payment_status not null default 'initiated',
  amount_cents integer not null check (amount_cents >= 0),
  -- idempotency: a webhook re-delivery with the same key is a no-op
  idempotency_key text unique,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index idx_payments_order on public.payments (order_id);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  granted_by uuid references public.profiles(id) on delete set null, -- manual grants
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, product_id)
);
create index idx_entitlements_user on public.entitlements (user_id);

-- Does the current user own active access to a product?
create or replace function public.owns_product(p_product_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = auth.uid()
      and product_id = p_product_id
      and revoked_at is null
  );
$$;

-- ---------------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  course_id uuid references public.courses(id) on delete set null,
  lesson_id uuid references public.course_lessons(id) on delete set null,
  category text,
  shared_with_mentor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_notes_user on public.notes (user_id, updated_at desc);
create trigger trg_notes_updated before update on public.notes
  for each row execute function public.set_updated_at();

create table public.note_comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index idx_note_comments_note on public.note_comments (note_id);

-- ---------------------------------------------------------------------------
-- Mentorship
-- ---------------------------------------------------------------------------
create table public.mentorship_programs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  mode public.mentorship_mode not null default 'application',
  weekly_session_minutes int not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.mentorship_applications (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.mentorship_programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null
);
create index idx_applications_program on public.mentorship_applications (program_id, status);

create table public.mentorship_enrollments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.mentorship_programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  status public.enrollment_status not null default 'active',
  goals text,
  study_plan text,
  next_session_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, user_id)
);
create index idx_mentorship_user on public.mentorship_enrollments (user_id);
create trigger trg_mentorship_enr_updated before update on public.mentorship_enrollments
  for each row execute function public.set_updated_at();

create table public.mentorship_sessions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.mentorship_enrollments(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 60,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_sessions_enrollment on public.mentorship_sessions (enrollment_id, scheduled_at desc);

create table public.mentorship_tasks (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.mentorship_enrollments(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority public.task_priority not null default 'normal',
  status public.task_status not null default 'todo',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index idx_mtasks_enrollment on public.mentorship_tasks (enrollment_id, status);

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  status public.challenge_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  enroll_opens_at timestamptz,
  enroll_closes_at timestamptz,
  max_participants int,
  created_at timestamptz not null default now()
);

create table public.challenge_tasks (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  day_number int not null default 1,
  title text not null,
  description text,
  position int not null default 0
);
create index idx_ctasks_challenge on public.challenge_tasks (challenge_id, day_number, position);

create table public.challenge_enrollments (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);

create table public.challenge_task_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.challenge_enrollments(id) on delete cascade,
  task_id uuid not null references public.challenge_tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (enrollment_id, task_id)
);

-- ---------------------------------------------------------------------------
-- Site content
-- ---------------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  href text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  content text not null,
  published boolean not null default false,
  is_demo boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'opste',
  position int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null,
  alt_text text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_created on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Storage buckets
--   covers          : public  (product covers, site images)
--   protected-files : private (paid PDFs — accessed only via signed URLs)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true), ('protected-files', 'protected-files', false)
on conflict (id) do nothing;
