import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Dijagnostika veze sajt ↔ Supabase. Otvori /api/status u browseru.
 * Ne otkriva tajne — samo boolean provere i poruke o greškama.
 * NAPOMENA: obriši ili zaštiti ovu rutu pre pravog lansiranja.
 */

interface Check {
  provera: string;
  ok: boolean;
  detalji: string;
}

/** Pročita "role" iz Supabase JWT ključa bez otkrivanja samog ključa. */
function jwtRole(key: string | undefined): string {
  if (!key) return 'nije postavljen';
  try {
    const payload = key.split('.')[1];
    if (!payload) return 'nije JWT format';
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as { role?: string };
    return json.role ?? 'nepoznata uloga';
  } catch {
    return 'ne može da se dekodira (pogrešan/isečen ključ?)';
  }
}

export async function GET() {
  const checks: Check[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Env varijable
  const urlProblemi: string[] = [];
  if (url) {
    if (url !== url.trim()) urlProblemi.push('ima razmak/enter na početku ili kraju!');
    if (url.trim().endsWith('/')) urlProblemi.push('ima kosu crtu (/) na kraju — obriši je!');
  }
  checks.push({
    provera: '1. NEXT_PUBLIC_SUPABASE_URL',
    ok: Boolean(url && url.startsWith('https://') && url.includes('.supabase.co')) && urlProblemi.length === 0,
    detalji: url
      ? `postavljen (${new URL(url).hostname})${urlProblemi.length ? ' — ' + urlProblemi.join(' ') : ''}`
      : 'NIJE postavljen',
  });

  const anonRole = jwtRole(anonKey);
  checks.push({
    provera: '2. NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ok: anonRole === 'anon',
    detalji:
      anonRole === 'anon'
        ? 'ispravan (uloga: anon)'
        : `POGREŠAN — uloga u ključu je "${anonRole}", a mora biti "anon". ${
            anonRole === 'service_role' ? 'Zamenjeni su ključevi!' : ''
          }`,
  });

  const serviceRole = jwtRole(serviceKey);
  checks.push({
    provera: '3. SUPABASE_SERVICE_ROLE_KEY',
    ok: serviceRole === 'service_role',
    detalji:
      serviceRole === 'service_role'
        ? 'ispravan (uloga: service_role)'
        : `POGREŠAN — uloga u ključu je "${serviceRole}", a mora biti "service_role".`,
  });

  
  // 2. Anon konekcija na bazu (isto što koristi sajt)
  if (url && anonKey) {
    const anon = createSupabaseClient(url, anonKey);
    const { count, error } = await anon
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');
    checks.push({
      provera: '5. Baza preko anon ključa (tabela products)',
      ok: !error,
      detalji: error
        ? `GREŠKA: ${error.message} — migracija 0001/0003 verovatno nije pokrenuta ili je ključ pogrešan`
        : `radi — ${count ?? 0} objavljenih proizvoda (seed ${count ? 'učitan' : 'NIJE učitan — pokreni 0003_seed.sql'})`,
    });

    // 3. Auth servis — testiramo tri putanje i prikazujemo sirove odgovore
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const authTests: { name: string; method: string; path: string; okStatuses: number[] }[] = [
      { name: '6a. Auth /settings', method: 'GET', path: '/auth/v1/settings', okStatuses: [200] },
      { name: '6b. Auth /health', method: 'GET', path: '/auth/v1/health', okStatuses: [200] },
      // Namerno neispravan signup: očekujemo 400/422 (dokaz da ruta postoji).
      // 404 bi značio da gateway ne rutira auth pozive.
      { name: '6c. Auth /signup ruta', method: 'POST', path: '/auth/v1/signup', okStatuses: [400, 422] },
    ];
    for (const t of authTests) {
      try {
        const res = await fetch(`${cleanUrl}${t.path}`, {
          method: t.method,
          headers: { apikey: anonKey, 'Content-Type': 'application/json' },
          body: t.method === 'POST' ? '{}' : undefined,
          cache: 'no-store',
        });
        const body = (await res.text()).slice(0, 160);
        checks.push({
          provera: t.name,
          ok: t.okStatuses.includes(res.status),
          detalji: `HTTP ${res.status} — ${body}`,
        });
      } catch (e) {
        checks.push({ provera: t.name, ok: false, detalji: `nedostupan: ${String(e)}` });
      }
    }
  }

  // 4. Service role + provera triggera (broj auth korisnika vs broj profila)
  if (url && serviceKey && serviceRole === 'service_role') {
    const admin = createSupabaseClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const [{ data: usersPage, error: usersError }, { count: profileCount, error: profilesError }] =
      await Promise.all([
        admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        admin.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

    checks.push({
      provera: '7. Service role pristup',
      ok: !usersError && !profilesError,
      detalji: usersError
        ? `GREŠKA auth: ${usersError.message}`
        : profilesError
          ? `GREŠKA profiles: ${profilesError.message}`
          : 'radi',
    });

    if (!usersError && !profilesError) {
      const userCount = usersPage?.users.length ?? 0;
      checks.push({
        provera: '8. Trigger za profile (auth korisnici ↔ profili)',
        ok: userCount === (profileCount ?? 0),
        detalji:
          userCount === (profileCount ?? 0)
            ? `radi — ${userCount} korisnika, ${profileCount ?? 0} profila`
            : `PROBLEM — ${userCount} korisnika u auth, a ${profileCount ?? 0} profila. Trigger on_auth_user_created ne radi ili je korisnik pravljen pre migracije. Vidi popravku u odgovoru ispod.`,
      });
    }
  }

  const sveOk = checks.every((c) => c.ok);
  return NextResponse.json(
    {
      status: sveOk ? '✅ SVE JE POVEZANO KAKO TREBA' : '❌ IMA PROBLEMA — vidi provere ispod',
      provere: checks,
      napomena: 'Obriši /api/status pre pravog lansiranja sajta.',
    },
    { status: sveOk ? 200 : 500 }
  );
}
