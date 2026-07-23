import { createClient } from '@/lib/supabase/server';
import type {
  Announcement,
  Challenge,
  ContactSettings,
  Faq,
  HeroSettings,
  AboutSettings,
  MentorshipHighlightSettings,
  Product,
  Testimonial,
} from '@/lib/types';

/** Read a site_settings value with a typed fallback. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single();
  return (data?.value as T | undefined) ?? fallback;
}

export const DEFAULT_HERO: HeroSettings = {
  title: 'Uči pametnije. Položi sigurnije. Razumi medicinu.',
  subtitle:
    'Kursevi, skripte, e-knjige, izazovi i direktno mentorstvo — sve na jednom mestu, da učiš bez lutanja.',
  cta_primary_label: 'Istraži sadržaj',
  cta_primary_href: '/kursevi',
  cta_secondary_label: 'Kako funkcioniše',
  cta_secondary_href: '/#kako-funkcionise',
  image_url: '',
};

export const DEFAULT_CONTACT: ContactSettings = {
  email: '',
  instagram: 'https://www.instagram.com/ucenje_medicine/',
  instagram_personal: 'https://www.instagram.com/dr_darko_milosevic/',
  youtube: 'https://www.youtube.com/@lakseucenjemedicine2641',
  tiktok: '',
};

export const DEFAULT_ABOUT: AboutSettings = {
  headline: 'Ćao, ja sam Darko.',
  body: 'Tekst o Darku se uređuje u admin panelu.',
  image_url: '',
};

export const DEFAULT_MENTORSHIP_HIGHLIGHT: MentorshipHighlightSettings = {
  image_url: '',
};

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Announcement | null) ?? null;
}

export async function getPublishedProducts(type?: Product['type']): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('position', { ascending: true });
  if (type) query = query.eq('type', type);
  const { data } = await query;
  return (data as Product[] | null) ?? [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('position', { ascending: true })
    .limit(6);
  return (data as Product[] | null) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export async function getPublishedFaqs(): Promise<Faq[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('faqs')
    .select('*')
    .eq('published', true)
    .order('position', { ascending: true });
  return (data as Faq[] | null) ?? [];
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('position', { ascending: true });
  return (data as Testimonial[] | null) ?? [];
}

/** The challenge to highlight on the homepage (active first, then scheduled). */
export async function getHighlightChallenge(): Promise<
  (Challenge & { product: Product }) | null
> {
  const supabase = createClient();
  const { data } = await supabase
    .from('challenges')
    .select('*, product:products(*)')
    .in('status', ['active', 'scheduled'])
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as Challenge & { product: Product | null };
  if (!row.product || row.product.status !== 'published') return null;
  return row as Challenge & { product: Product };
}

/** Whether the logged-in user owns a product (false for guests). */
export async function userOwnsProduct(productId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .is('revoked_at', null)
    .maybeSingle();
  return Boolean(data);
}
