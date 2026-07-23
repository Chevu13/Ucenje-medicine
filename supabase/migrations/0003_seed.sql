-- ============================================================================
-- Učenje medicine — 0003_seed.sql
-- Demo/draft seed content. Everything here is EDITABLE through the admin
-- panel. Prices are DEMO placeholders (is_demo = true) — replace before launch.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.product_categories (id, name, slug, description, position) values
  ('20000000-0000-4000-8000-000000000001', 'Skripte', 'skripte', 'Skripte i materijali za pripremu ispita', 1),
  ('20000000-0000-4000-8000-000000000002', 'E-knjige', 'e-knjige', 'Digitalne knjige i vodiči', 2),
  ('20000000-0000-4000-8000-000000000003', 'Kursevi', 'kursevi', 'Strukturirani video kursevi', 3);

-- ---------------------------------------------------------------------------
-- Products (all is_demo = true → UI marks them as demo content)
-- price_cents uses "para" (1 RSD = 100 para). NULL price → "Cena uskoro".
-- ---------------------------------------------------------------------------
insert into public.products
  (id, type, category_id, title, slug, short_description, description, price_cents, sale_price_cents, is_free, status, featured, is_demo, author_name, page_count, position)
values
  -- Free course
  ('10000000-0000-4000-8000-000000000001', 'course', '20000000-0000-4000-8000-000000000003',
   'Uvod u učenje medicine', 'uvod-u-ucenje-medicine',
   'Besplatan kurs: kako da organizuješ učenje na medicini od prvog dana.',
   'DEMO OPIS — zameni u admin panelu. Besplatan kurs zasnovan na Darkovim YouTube lekcijama o organizaciji učenja, planiranju ispitnih rokova i tehnikama koje zaista rade.',
   null, null, true, 'published', true, true, 'Darko Milošević', null, 1),

  -- Paid course
  ('10000000-0000-4000-8000-000000000002', 'course', '20000000-0000-4000-8000-000000000003',
   'Efikasna priprema ispita', 'efikasna-priprema-ispita',
   'Kompletan sistem pripreme ispita: plan, tehnike učenja i provere znanja.',
   'DEMO OPIS — zameni u admin panelu. Struktuiran kurs sa video lekcijama, zadacima i proverama, namenjen studentima koji žele sigurniji izlazak na ispit.',
   299000, null, false, 'published', true, true, 'Darko Milošević', null, 2),

  -- E-books
  ('10000000-0000-4000-8000-000000000011', 'ebook', '20000000-0000-4000-8000-000000000002',
   '50 slučajeva iz ambulante', '50-slucajeva-iz-ambulante',
   'E-knjiga sa 50 kliničkih slučajeva iz svakodnevne prakse.',
   'DEMO OPIS — zameni u admin panelu. Zbirka realnih slučajeva iz ambulante sa pitanjima i objašnjenjima za kliničko razmišljanje.',
   199000, null, false, 'published', true, true, 'Darko Milošević', null, 3),

  ('10000000-0000-4000-8000-000000000012', 'ebook', '20000000-0000-4000-8000-000000000002',
   'Vodič za studiranje', 'vodic-za-studiranje',
   'Praktičan vodič kroz studije medicine — od upisa do apsolventskog staža.',
   'DEMO OPIS — zameni u admin panelu.',
   149000, null, false, 'published', false, true, 'Darko Milošević', null, 4),

  ('10000000-0000-4000-8000-000000000013', 'ebook', '20000000-0000-4000-8000-000000000002',
   'Učenje učenja', 'ucenje-ucenja',
   'Kako se uči efikasno: tehnike, navike i planiranje.',
   'DEMO OPIS — zameni u admin panelu.',
   null, null, false, 'draft', false, true, 'Darko Milošević', null, 5),

  ('10000000-0000-4000-8000-000000000014', 'ebook', '20000000-0000-4000-8000-000000000002',
   'Održivo mršavljenje', 'odrzivo-mrsavljenje',
   'Edukativni vodič o održivim navikama u ishrani i kretanju.',
   'DEMO OPIS — zameni u admin panelu. Napomena: sadržaj je edukativan i ne zamenjuje savet lekara.',
   null, null, false, 'draft', false, true, 'Darko Milošević', null, 6),

  -- Scripts
  ('10000000-0000-4000-8000-000000000021', 'script', '20000000-0000-4000-8000-000000000001',
   'Skripta iz anatomije', 'skripta-iz-anatomije',
   'Skripta za pripremu ispita iz anatomije.',
   'DEMO OPIS — zameni u admin panelu.',
   249000, null, false, 'published', true, true, 'Darko Milošević', null, 7),

  ('10000000-0000-4000-8000-000000000022', 'script', '20000000-0000-4000-8000-000000000001',
   'Skripta iz mikrobiologije', 'skripta-iz-mikrobiologije',
   'Skripta za pripremu ispita iz mikrobiologije.',
   'DEMO OPIS — zameni u admin panelu.',
   249000, null, false, 'published', false, true, 'Darko Milošević', null, 8),

  ('10000000-0000-4000-8000-000000000023', 'script', '20000000-0000-4000-8000-000000000001',
   'Repetitorijum iz fiziologije', 'repetitorijum-iz-fiziologije',
   'Repetitorijum za brzo obnavljanje gradiva iz fiziologije.',
   'DEMO OPIS — zameni u admin panelu.',
   279000, null, false, 'published', false, true, 'Darko Milošević', null, 9),

  -- Mentorship
  ('10000000-0000-4000-8000-000000000031', 'mentorship', null,
   'Mentorstvo sa Darkom', 'mentorstvo-sa-darkom',
   'Nedeljne konsultacije 1-na-1, plan učenja, zadaci i kontinuirana podrška.',
   'DEMO OPIS — zameni u admin panelu. Jedna 60-minutna konsultacija nedeljno, lični plan učenja, zadaci i povratne informacije unutar platforme.',
   null, null, false, 'published', true, true, 'Darko Milošević', null, 10),

  -- Challenge (scheduled)
  ('10000000-0000-4000-8000-000000000041', 'challenge', null,
   'Izazov: 21 dan doslednog učenja', 'izazov-21-dan',
   'Tri nedelje vođenog, doslednog učenja sa dnevnim zadacima.',
   'DEMO OPIS — zameni u admin panelu.',
   99000, null, false, 'published', false, true, 'Darko Milošević', null, 11);

-- ---------------------------------------------------------------------------
-- Courses, modules, lessons (YouTube URLs are placeholders — set real ones
-- in Admin → Kursevi)
-- ---------------------------------------------------------------------------
insert into public.courses (id, product_id, level, subject, duration_text) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Svi nivoi', 'Veštine učenja', '2 nedelje'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Pretklinika', 'Priprema ispita', '4 nedelje');

insert into public.course_modules (id, course_id, title, position) values
  ('31000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Početak: kako medicina „radi“', 1),
  ('31000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Organizacija i plan', 2),
  ('31000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'Postavljanje sistema', 1),
  ('31000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', 'Nedelje pred ispit', 2);

insert into public.course_lessons (id, module_id, title, slug, summary, youtube_url, duration_minutes, is_free_preview, position) values
  ('32000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001',
   'Dobrodošlica i kako koristiti kurs', 'dobrodoslica',
   'DEMO — kratak uvod u kurs i način rada.', 'OVDE_STAVI_YOUTUBE_LINK', 8, true, 1),
  ('32000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000001',
   'Najčešće greške na početku studija', 'najcesce-greske',
   'DEMO — pregled grešaka koje koštaju vremena.', 'OVDE_STAVI_YOUTUBE_LINK', 12, true, 2),
  ('32000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000002',
   'Plan učenja koji se zaista prati', 'plan-ucenja',
   'DEMO — kako se pravi realan nedeljni plan.', 'OVDE_STAVI_YOUTUBE_LINK', 15, false, 1),
  ('32000000-0000-4000-8000-000000000004', '31000000-0000-4000-8000-000000000003',
   'Postavljanje sistema pripreme', 'postavljanje-sistema',
   'DEMO — struktura pripreme od prvog dana.', 'OVDE_STAVI_YOUTUBE_LINK', 14, true, 1),
  ('32000000-0000-4000-8000-000000000005', '31000000-0000-4000-8000-000000000003',
   'Aktivno obnavljanje i provere', 'aktivno-obnavljanje',
   'DEMO — tehnike aktivnog obnavljanja gradiva.', 'OVDE_STAVI_YOUTUBE_LINK', 18, false, 2),
  ('32000000-0000-4000-8000-000000000006', '31000000-0000-4000-8000-000000000004',
   'Poslednja nedelja pred ispit', 'poslednja-nedelja',
   'DEMO — kako izgleda završna faza pripreme.', 'OVDE_STAVI_YOUTUBE_LINK', 16, false, 1);

-- ---------------------------------------------------------------------------
-- Mentorship program (application mode by default)
-- ---------------------------------------------------------------------------
insert into public.mentorship_programs (id, product_id, mode, weekly_session_minutes, active) values
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000031', 'application', 60, true);

-- ---------------------------------------------------------------------------
-- Scheduled challenge with daily tasks
-- ---------------------------------------------------------------------------
insert into public.challenges (id, product_id, status, starts_at, ends_at, enroll_opens_at, enroll_closes_at, max_participants) values
  ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000041',
   'scheduled',
   now() + interval '14 days', now() + interval '35 days',
   now(), now() + interval '13 days',
   50);

insert into public.challenge_tasks (challenge_id, day_number, title, description, position) values
  ('50000000-0000-4000-8000-000000000001', 1, 'Postavi cilj za 21 dan', 'DEMO zadatak — zameni u admin panelu.', 1),
  ('50000000-0000-4000-8000-000000000001', 2, 'Napravi nedeljni plan', 'DEMO zadatak — zameni u admin panelu.', 1),
  ('50000000-0000-4000-8000-000000000001', 3, 'Prva sesija fokusiranog učenja', 'DEMO zadatak — zameni u admin panelu.', 1);

-- ---------------------------------------------------------------------------
-- FAQs (real, generic platform answers — safe to keep)
-- ---------------------------------------------------------------------------
insert into public.faqs (question, answer, category, position) values
  ('Kako kupujem materijale?', 'Dodaš proizvod u korpu i pošalješ porudžbinu sa svojim imenom, mejlom i Instagramom — nalog nije potreban. Kontaktiramo te oko uplate (uplata ne ide preko sajta), a materijal ti šaljemo lično čim uplata bude potvrđena.', 'kupovina', 1),
  ('Kako dobijam materijal koji sam poručio?', 'Nakon potvrđene uplate, materijal ti šaljemo lično na mejl ili Instagram koji si ostavio prilikom porudžbine.', 'kupovina', 2),
  ('Da li mogu da preuzmem e-knjige?', 'E-knjige čitaš u zaštićenom čitaču u pregledaču. Za pojedine naslove je omogućeno i preuzimanje — to piše na stranici proizvoda.', 'e-knjige', 3),
  ('Kako funkcionišu kursevi?', 'Kurs je podeljen na module i lekcije. Lekcije prate Darkove video materijale, a tvoj napredak se automatski beleži na nalogu.', 'kursevi', 4),
  ('Šta dobijam u mentorstvu?', 'Jednu 60-minutnu konsultaciju sa Darkom svake nedelje, lični plan učenja, zadatke i povratne informacije direktno na platformi.', 'mentorstvo', 5),
  ('Kako se prijavljujem na izazov?', 'Kada je izazov aktivan, prijava ide direktno sa stranice izazova. Ako je prijava zatvorena, ostavi mejl u newsletteru i javićemo ti sledeći termin.', 'izazovi', 6);

-- ---------------------------------------------------------------------------
-- Testimonials — PLACEHOLDERS, clearly marked. Replace in Admin → Sadržaj.
-- ---------------------------------------------------------------------------
insert into public.testimonials (name, role, content, published, is_demo, position) values
  ('Ime studenta (primer)', 'Student medicine', 'PRIMER UTISKA — ovde ide pravi utisak polaznika. Zameni ovaj tekst u admin panelu pre objavljivanja sajta.', true, true, 1),
  ('Ime studenta (primer)', 'Apsolvent', 'PRIMER UTISKA — ovde ide pravi utisak polaznika. Zameni ovaj tekst u admin panelu pre objavljivanja sajta.', true, true, 2);

-- ---------------------------------------------------------------------------
-- Announcement + site settings
-- ---------------------------------------------------------------------------
insert into public.announcements (message, href, active) values
  ('DEMO NAJAVA: Uskoro počinje novi izazov — pogledaj detalje.', '/izazovi', true);

insert into public.site_settings (key, value) values
  ('hero', '{
    "title": "Uči pametnije. Položi sigurnije. Razumi medicinu.",
    "subtitle": "Kursevi, skripte, e-knjige, izazovi i direktno mentorstvo — sve na jednom mestu, da učiš bez lutanja.",
    "cta_primary_label": "Istraži sadržaj",
    "cta_primary_href": "/kursevi",
    "cta_secondary_label": "Kako funkcioniše",
    "cta_secondary_href": "/#kako-funkcionise",
    "image_url": ""
  }'::jsonb),
  ('contact', '{
    "email": "OVDE_STAVI_EMAIL",
    "instagram": "https://www.instagram.com/ucenje_medicine/",
    "instagram_personal": "https://www.instagram.com/dr_darko_milosevic/",
    "youtube": "https://www.youtube.com/@lakseucenjemedicine2641",
    "tiktok": ""
  }'::jsonb),
  ('about', '{
    "headline": "Ćao, ja sam Darko.",
    "body": "DEMO TEKST — zameni u admin panelu. Darko je lekar i edukator koji kroz YouTube, Instagram i ovu platformu pomaže studentima medicine da uče efikasnije i polažu sigurnije."
  }'::jsonb),
  ('seo', '{
    "site_name": "Učenje medicine",
    "default_description": "Kursevi, skripte, e-knjige, izazovi i mentorstvo za studente medicine — sve na jednom mestu."
  }'::jsonb);
