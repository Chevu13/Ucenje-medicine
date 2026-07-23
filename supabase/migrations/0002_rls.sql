-- ============================================================================
-- Učenje medicine — 0002_rls.sql
-- Row Level Security. Deny-by-default: enabling RLS with no matching policy
-- blocks access. The service-role key (server only) bypasses RLS.
-- ============================================================================

-- Enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.digital_files enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;
alter table public.notes enable row level security;
alter table public.note_comments enable row level security;
alter table public.mentorship_programs enable row level security;
alter table public.mentorship_applications enable row level security;
alter table public.mentorship_enrollments enable row level security;
alter table public.mentorship_sessions enable row level security;
alter table public.mentorship_tasks enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_tasks enable row level security;
alter table public.challenge_enrollments enable row level security;
alter table public.challenge_task_progress enable row level security;
alter table public.announcements enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_mentor_or_admin());
create policy "profiles: update own (not role)" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy "profiles: admin manage" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public catalog: anyone may read PUBLISHED content; admins manage everything
-- ---------------------------------------------------------------------------
create policy "categories: public read" on public.product_categories
  for select using (true);
create policy "categories: admin write" on public.product_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "products: public read published" on public.products
  for select using (status = 'published' or public.is_admin());
-- Buyers keep access to metadata of owned products even if later unpublished
create policy "products: entitled read" on public.products
  for select using (public.owns_product(id));
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "courses: public read" on public.courses
  for select using (
    public.is_admin() or exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'published'
    )
  );
create policy "courses: admin write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

create policy "modules: public read" on public.course_modules
  for select using (
    public.is_admin() or exists (
      select 1 from public.courses c
      join public.products p on p.id = c.product_id
      where c.id = course_id and p.status = 'published'
    )
  );
create policy "modules: admin write" on public.course_modules
  for all using (public.is_admin()) with check (public.is_admin());

-- Lesson METADATA is readable for published courses (needed for the curriculum
-- list). The actual video URL is delivered server-side only after an
-- entitlement check — see src/app/kursevi/[slug]/lekcija/.
create policy "lessons: public read" on public.course_lessons
  for select using (
    public.is_admin() or exists (
      select 1 from public.course_modules m
      join public.courses c on c.id = m.course_id
      join public.products p on p.id = c.product_id
      where m.id = module_id and p.status = 'published'
    )
  );
create policy "lessons: admin write" on public.course_lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Progress: strictly per-user
-- ---------------------------------------------------------------------------
create policy "progress: own" on public.user_lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress: mentor read" on public.user_lesson_progress
  for select using (public.is_mentor_or_admin());

-- ---------------------------------------------------------------------------
-- Digital files: metadata readable by owners/admin only. The file itself is in
-- a private bucket; only the server (service role) issues signed URLs.
-- ---------------------------------------------------------------------------
create policy "files: owner read" on public.digital_files
  for select using (
    public.is_admin()
    or (product_id is not null and public.owns_product(product_id))
  );
create policy "files: admin write" on public.digital_files
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Commerce: users see their own; writes happen server-side (service role)
-- ---------------------------------------------------------------------------
create policy "orders: own read" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "order_items: own read" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );
create policy "payments: own read" on public.payments
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );
create policy "entitlements: own read" on public.entitlements
  for select using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Notes: owner full control; mentors read/comment only when shared
-- ---------------------------------------------------------------------------
create policy "notes: owner" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes: mentor read shared" on public.notes
  for select using (shared_with_mentor = true and public.is_mentor_or_admin());

create policy "note_comments: participants read" on public.note_comments
  for select using (
    author_id = auth.uid()
    or exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
    or public.is_mentor_or_admin()
  );
create policy "note_comments: mentor write on shared" on public.note_comments
  for insert with check (
    author_id = auth.uid()
    and public.is_mentor_or_admin()
    and exists (select 1 from public.notes n where n.id = note_id and n.shared_with_mentor = true)
  );

-- ---------------------------------------------------------------------------
-- Mentorship
-- ---------------------------------------------------------------------------
create policy "programs: public read active" on public.mentorship_programs
  for select using (active = true or public.is_admin());
create policy "programs: admin write" on public.mentorship_programs
  for all using (public.is_admin()) with check (public.is_admin());

create policy "applications: own" on public.mentorship_applications
  for select using (user_id = auth.uid() or public.is_mentor_or_admin());
create policy "applications: user create" on public.mentorship_applications
  for insert with check (user_id = auth.uid());
create policy "applications: admin manage" on public.mentorship_applications
  for update using (public.is_mentor_or_admin()) with check (public.is_mentor_or_admin());

create policy "enrollments: own or mentor" on public.mentorship_enrollments
  for select using (user_id = auth.uid() or public.is_mentor_or_admin());
create policy "enrollments: user update own workspace" on public.mentorship_enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "enrollments: mentor manage" on public.mentorship_enrollments
  for all using (public.is_mentor_or_admin()) with check (public.is_mentor_or_admin());

create policy "sessions: own or mentor" on public.mentorship_sessions
  for select using (
    public.is_mentor_or_admin() or exists (
      select 1 from public.mentorship_enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  );
create policy "sessions: mentor write" on public.mentorship_sessions
  for all using (public.is_mentor_or_admin()) with check (public.is_mentor_or_admin());

create policy "mtasks: own read" on public.mentorship_tasks
  for select using (
    public.is_mentor_or_admin() or exists (
      select 1 from public.mentorship_enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  );
create policy "mtasks: user complete own" on public.mentorship_tasks
  for update using (
    exists (
      select 1 from public.mentorship_enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.mentorship_enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  );
create policy "mtasks: mentor manage" on public.mentorship_tasks
  for all using (public.is_mentor_or_admin()) with check (public.is_mentor_or_admin());

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------
create policy "challenges: public read" on public.challenges
  for select using (
    public.is_admin() or (status in ('scheduled','active','completed') and exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'
    ))
  );
create policy "challenges: admin write" on public.challenges
  for all using (public.is_admin()) with check (public.is_admin());

-- Task CONTENT only for enrolled users (or admin).
-- NOTE: outer column must be table-qualified to avoid self-comparison.
create policy "ctasks: enrolled read" on public.challenge_tasks
  for select using (
    public.is_admin() or exists (
      select 1 from public.challenge_enrollments e
      where e.challenge_id = challenge_tasks.challenge_id and e.user_id = auth.uid()
    )
  );
create policy "ctasks: admin write" on public.challenge_tasks
  for all using (public.is_admin()) with check (public.is_admin());

create policy "cenroll: own read" on public.challenge_enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy "cenroll: admin write" on public.challenge_enrollments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "cprogress: own" on public.challenge_task_progress
  for all using (
    exists (
      select 1 from public.challenge_enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.challenge_enrollments e
      where e.id = enrollment_id and e.user_id = auth.uid()
    )
  );
create policy "cprogress: admin read" on public.challenge_task_progress
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site content
-- ---------------------------------------------------------------------------
create policy "announcements: public read active" on public.announcements
  for select using (active = true or public.is_admin());
create policy "announcements: admin write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

create policy "testimonials: public read published" on public.testimonials
  for select using (published = true or public.is_admin());
create policy "testimonials: admin write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

create policy "faqs: public read published" on public.faqs
  for select using (published = true or public.is_admin());
create policy "faqs: admin write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- Newsletter: anyone may subscribe; only admin may read the list
create policy "newsletter: public insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter: admin read" on public.newsletter_subscribers
  for select using (public.is_admin());
create policy "newsletter: admin delete" on public.newsletter_subscribers
  for delete using (public.is_admin());

create policy "settings: public read" on public.site_settings
  for select using (true);
create policy "settings: admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "media: public read" on public.media_assets
  for select using (true);
create policy "media: admin write" on public.media_assets
  for all using (public.is_admin()) with check (public.is_admin());

create policy "audit: admin read" on public.audit_logs
  for select using (public.is_admin());
create policy "audit: admin insert" on public.audit_logs
  for insert with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage policies
-- covers: public read, admin write. protected-files: NO client access at all —
-- the server issues time-limited signed URLs with the service role key.
-- ---------------------------------------------------------------------------
create policy "covers public read" on storage.objects
  for select using (bucket_id = 'covers');
create policy "covers admin write" on storage.objects
  for insert with check (bucket_id = 'covers' and public.is_admin());
create policy "covers admin update" on storage.objects
  for update using (bucket_id = 'covers' and public.is_admin());
create policy "covers admin delete" on storage.objects
  for delete using (bucket_id = 'covers' and public.is_admin());
-- (intentionally NO policies for 'protected-files' → clients cannot touch it)
