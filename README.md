# Učenje medicine — edukativna platforma

Kompletna platforma i digitalna prodavnica za brend **Učenje medicine** (Darko Milošević):
kursevi sa YouTube lekcijama, zaštićene e-knjige i skripte, mentorstvo 1-na-1, izazovi,
korisnički nalog sa bibliotekom/beleškama/napretkom i pun admin panel.

**Stack:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase (PostgreSQL,
Auth, Storage) · Zod · ručni tok porudžbina (bez online plaćanja).

---

## 1. Pokretanje projekta

### Preduslovi
- Node.js 18.17+ (preporuka: 20 LTS)
- Nalog na [supabase.com](https://supabase.com) (besplatan tier je dovoljan za start)

### Koraci

```bash
# 1. Instaliraj zavisnosti
npm install

# 2. Napravi Supabase projekat, pa u SQL editoru redom pokreni:
#    supabase/migrations/0001_schema.sql
#    supabase/migrations/0002_rls.sql
#    supabase/migrations/0003_seed.sql
#    (ili: supabase link + supabase db push ako koristiš Supabase CLI)

# 3. Konfiguriši environment
cp .env.example .env.local
#    → upiši NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#      SUPABASE_SERVICE_ROLE_KEY (Settings → API u Supabase dashboardu)
#      i proizvoljan dugačak PAYMENT_WEBHOOK_SECRET

# 4. Pokreni
npm run dev
```

### Provere pre isporuke
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # produkcioni build
```
> Napomena: kod je pisan bez pokretanja ovih komandi u okruženju u kom je generisan
> (build okruženje nije bilo dostupno). Pokreni sve tri komande lokalno i ispravi
> eventualne sitnice pre produkcije.

---

## 2. Prvi admin (bezbedno, bez hardkodovanja)

1. Registruj se normalno kroz sajt (`/registracija`).
2. U Supabase SQL editoru pokreni:
   ```sql
   update public.profiles set role = 'admin' where email = 'tvoja@adresa.com';
   ```
3. Osveži sajt — u headeru se pojavljuje link **Admin** (`/admin`).

Uloge: `user` (podrazumevano), `mentor` (samo mentorski deo admina), `admin` (sve).
Uloga se dalje menja u **Admin → Korisnici**. Admin ne može da menja sopstvenu ulogu.

---

## 3. Arhitektura

```
src/
  app/
    (public)/        # javne stranice (početna, katalog, auth, korpa, plaćanje…)
    nalog/           # korisnički dashboard (guard: prijavljen korisnik)
    admin/           # admin panel (guard: admin/mentor po stranici)
    api/
      files/[id]     # zaštićeni pristup PDF-ovima (entitlement → signed URL)
    actions/         # server actions (auth, shop, notes, admin…)
  components/        # UI primitive + domenske komponente
  lib/
    supabase/        # browser / server / service-role klijenti
supabase/migrations/ # šema, RLS politike, seed
```

### Bezbednosni model (ukratko)
- **RLS na svim tabelama** — anon/user klijent vidi samo ono što politike dozvole.
- **Service-role ključ isključivo na serveru** (`src/lib/supabase/admin.ts`, štićeno
  `server-only` paketom). Koristi se za: webhook fulfillment, admin CRUD (posle provere
  uloge iz `profiles`), potpisane URL-ove fajlova.
- **Plaćeni PDF-ovi** žive u privatnom bucketu `protected-files` bez ijedne klijentske
  politike. Do fajla se dolazi samo kroz `/api/files/[id]` koji proverava entitlement
  i izdaje signed URL od 60 sekundi.
- **Cene se uvek čitaju iz baze na serveru** — korpa na klijentu je samo lista ID-jeva.
- Middleware štiti `/nalog` i `/admin` na nivou UX-a; stvarna autorizacija se ponavlja
  u server layoutima/akcijama.

### Porudžbine i plaćanje (bez naloga)
Kupovina NE zahteva nalog i NEMA online plaćanja. Tok je:
1. Posetilac doda proizvode u korpu i na `/placanje` ostavi ime i prezime,
   mejl i Instagram (porudžbina dobija status „Čeka uplatu"). Ništa se ne
   isporučuje preko sajta.
2. Ljubica/Darko u **Admin → Porudžbine** vide ko je šta poručio i kontakt
   podatke, dogovore uplatu (Instagram/mejl) i materijal šalju lično.
3. Kada uplata stigne, u adminu se klikne „Označi kao plaćeno" radi evidencije.

Migracije `0004_manual_orders.sql` (kontakt kolone) i `0005_guest_orders.sql`
(porudžbine bez naloga + objavljivanje demo proizvoda) moraju se pokrenuti u
Supabase SQL editoru.

Nalozi i dalje postoje za mentorstvo i buduće izazove, ali za običnu kupovinu
materijala nisu potrebni.

## 4. Admin vodič (za Darka)

| Sekcija | Šta se tu radi |
|---|---|
| Proizvodi | kreiranje/uređivanje svega što se prodaje (kursevi, e-knjige, skripte, mentorstvo, izazovi), cene, naslovne slike, SEO, draft/objavljeno |
| Kursevi | moduli i lekcije, YouTube linkovi, besplatne preview lekcije |
| Izazovi | termini, status (draft/zakazan/aktivan/završen), zadaci po danima, učesnici |
| Mentorstvo | prijave (odobri/odbij), polaznici, zadaci, konsultacije, komentari na podeljene beleške |
| Korisnici | uloge, ručna dodela/ukidanje pristupa |
| Porudžbine | sve porudžbine i status uplata |
| Sadržaj sajta | hero, „O Darku“, najave (traka na vrhu), FAQ, utisci |
| Fajlovi | otpremanje zaštićenih PDF-ova, dozvola preuzimanja |
| Podešavanja | kontakt/mreže, lista newsletter pretplatnika |

Sav seed sadržaj je označen sa **„Demo sadržaj“** — čim se proizvod izmeni u adminu,
oznaka nestaje.

---

## 5. Deploy (preporuka: Vercel)

1. Push koda na GitHub i import u Vercel.
2. Postavi environment varijable iz `.env.example` (obavezno i `NEXT_PUBLIC_SITE_URL`
   = finalni domen).
3. U Supabase → Authentication → URL Configuration postavi Site URL i Redirect URL
   (`https://tvoj-domen/auth/callback`).
4. Ako koristiš potvrdu mejla, u Supabase → Auth → Email templates prevedi šablone
   na srpski.
5. Za webhook pravog provajdera: endpoint je `POST /api/webhooks/payment`
   (header `x-webhook-signature`).

---

## 6. Šta Darko treba da dostavi pre produkcije

- [ ] Finalni logo u SVG formatu (sada su u `public/brand/` rekonstruisane verzije po brend knjizi)
- [ ] Profesionalne fotografije (hero, O Darku, mentorstvo) — **fajl `darko-profile.jpg` nije stigao uz projekat**, pa je svuda brendirani placeholder; slika se postavlja u Admin → Sadržaj → Hero
- [ ] Prave naslovne slike proizvoda
- [ ] PDF fajlovi skripti i e-knjiga (Admin → Fajlovi)
- [ ] Finalni opisi i **cene** (sve trenutne cene su DEMO vrednosti)
- [ ] YouTube linkovi lekcija (seed sadrži `OVDE_STAVI_YOUTUBE_LINK`)
- [ ] Kontakt email (Admin → Podešavanja)
- [ ] TikTok link (ako želi)
- [ ] Pravi utisci studenata (uz saglasnost)
- [ ] Uslovi mentorstva (cena, trajanje, način upisa: kupovina ili prijava)
- [ ] Detalji prvog izazova
- [ ] Kredencijali procesora plaćanja + ugovor sa bankom
- [ ] Domen
- [ ] Podaci pravnog lica za stranice Privatnost / Uslovi korišćenja

## 7. Poznata ograničenja / sledeći koraci

- Email servis nije povezan (hook postoji u `src/lib/email.ts`) — priključiti Resend/Postmark.
- Newsletter je lista u bazi + izvoz; za kampanje povezati Mailchimp/Brevo.
- PDF čitač koristi browserski prikaz preko signed URL-a; watermarking po kupcu je
  pripremljen arhitekturno (email kupca dostupan pri fulfillmentu) ali nije implementiran.
- Automatski testovi nisu uključeni; kritični tokovi za ručnu proveru su popisani u
  projektnoj specifikaciji (sekcija 24).

## 8. Pretpostavke (dokumentovane odluke)

- Valuta: RSD, čuvana u parama (`price_cents`); cena `NULL` = „Cena uskoro“ (ne može u korpu).
- Kontakt stranica nudi email/Instagram umesto forme (nema backend inbox-a — iskren UX bez mrtvih dugmadi).
- FAQ je na `/cesta-pitanja` (čitljivije od engleskog slug-a).
- Lekcije u URL-u koriste ID (`/kursevi/[slug]/lekcija/[id]`) jer je slug lekcije jedinstven samo unutar modula.
- Mentorstvo je seed-ovano u režimu „prijava“ (Darko odobrava); režim „kupovina“ se uključuje u bazi (`mentorship_programs.mode`) — automatski upis radi za oba.
- Forme su kontrolisane React forme + Zod validacija na serveru; React Hook Form nije uključen jer nijedna forma nije dovoljno kompleksna da ga opravda (manje zavisnosti).
