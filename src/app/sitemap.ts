import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { productHref, siteUrl } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/kursevi',
    '/e-knjige',
    '/skripte',
    '/mentorstvo',
    '/izazovi',
    '/o-darku',
    '/kontakt',
    '/cesta-pitanja',
    '/privatnost',
    '/uslovi-koriscenja',
    '/medicinski-disclaimer',
  ].map((path) => ({
    url: siteUrl(path),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }));

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('products')
      .select('type, slug, updated_at')
      .eq('status', 'published');
    const products = ((data as Pick<Product, 'type' | 'slug' | 'updated_at'>[] | null) ?? []).map(
      (p) => ({
        url: siteUrl(productHref(p as Product)),
        lastModified: new Date(p.updated_at),
        changeFrequency: 'weekly' as const,
      })
    );
    return [...staticRoutes, ...products];
  } catch {
    return staticRoutes;
  }
}
