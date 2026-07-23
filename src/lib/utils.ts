import type { Product } from '@/lib/types';

/** Minimal className combiner (avoids extra deps). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Format cents ("para") into a human RSD price, e.g. 299000 → "2.990 RSD". */
export function formatPrice(cents: number | null, currency = 'RSD'): string {
  if (cents === null) return 'Cena uskoro';
  const whole = Math.round(cents / 100);
  return `${whole.toLocaleString('sr-RS')} ${currency}`;
}

/** The price a buyer actually pays (sale price wins when set). */
export function effectivePriceCents(p: Pick<Product, 'price_cents' | 'sale_price_cents' | 'is_free'>): number | null {
  if (p.is_free) return 0;
  if (p.sale_price_cents !== null) return p.sale_price_cents;
  return p.price_cents;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('sr-Latn-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('sr-Latn-RS', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Extract a YouTube video id from common URL shapes; null if not a YT link. */
export function youtubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
      if (m) return m[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function slugify(text: string): string {
  const map: Record<string, string> = { č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj' };
  return text
    .toLowerCase()
    .replace(/[čćšžđ]/g, (ch) => map[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const PRODUCT_TYPE_LABELS: Record<Product['type'], string> = {
  course: 'Kurs',
  ebook: 'E-knjiga',
  script: 'Skripta',
  mentorship: 'Mentorstvo',
  challenge: 'Izazov',
};

export const PRODUCT_TYPE_ROUTES: Record<Product['type'], string> = {
  course: '/kursevi',
  ebook: '/e-knjige',
  script: '/skripte',
  mentorship: '/mentorstvo',
  challenge: '/izazovi',
};

export function productHref(p: Pick<Product, 'type' | 'slug'>): string {
  if (p.type === 'mentorship') return '/mentorstvo';
  return `${PRODUCT_TYPE_ROUTES[p.type]}/${p.slug}`;
}

export function siteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base}${path}`;
}
