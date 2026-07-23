import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clapperboard, Clock, ShieldCheck } from 'lucide-react';
import { Badge, Card, DemoBadge } from '@/components/ui';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductCover, PriceTag } from '@/components/products/ProductCard';
import { createClient } from '@/lib/supabase/server';
import { getProductBySlug } from '@/lib/queries';
import type { Course, Product } from '@/lib/types';
import { effectivePriceCents, siteUrl } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

/** Course row + number of video clips and total minutes (for display). */
async function getCourseInfo(product: Product): Promise<{
  course: Course | null;
  clipCount: number;
  totalMinutes: number;
}> {
  const supabase = createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('product_id', product.id)
    .maybeSingle();
  if (!course) return { course: null, clipCount: 0, totalMinutes: 0 };

  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, course_lessons(duration_minutes)')
    .eq('course_id', (course as Course).id);

  let clipCount = 0;
  let totalMinutes = 0;
  for (const m of (modules as { course_lessons: { duration_minutes: number | null }[] }[]) ?? []) {
    for (const lesson of m.course_lessons) {
      clipCount += 1;
      totalMinutes += lesson.duration_minutes ?? 0;
    }
  }
  return { course: course as Course, clipCount, totalMinutes };
}

function formatDuration(minutes: number): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.seo_title ?? product.title,
    description: product.seo_description ?? product.short_description ?? undefined,
    alternates: { canonical: siteUrl(`/kursevi/${product.slug}`) },
    openGraph: {
      title: product.title,
      description: product.short_description ?? undefined,
      images: product.cover_url ? [product.cover_url] : undefined,
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.type !== 'course') notFound();

  const { course, clipCount, totalMinutes } = await getCourseInfo(product);
  const duration = course?.duration_text ?? formatDuration(totalMinutes);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: product.title,
    description: product.short_description ?? undefined,
    provider: { '@type': 'Organization', name: 'Učenje medicine' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr,1.2fr]">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-card">
          <ProductCover product={product} sizes="(max-width: 1024px) 90vw, 35vw" />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="light">Kurs</Badge>
            {product.is_free ? <Badge tone="green">Besplatno</Badge> : null}
            {product.is_demo ? <DemoBadge /> : null}
          </div>
          <h1 className="heading-1">{product.title}</h1>

          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-ink-muted">
            {clipCount ? (
              <span className="inline-flex items-center gap-1.5">
                <Clapperboard className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {clipCount} video klipova
              </span>
            ) : null}
            {duration ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {duration}
              </span>
            ) : null}
            {course?.subject ? <span>{course.subject}</span> : null}
            {course?.level ? <span>{course.level}</span> : null}
          </p>

          {product.short_description ? (
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{product.short_description}</p>
          ) : null}

          <div className="mt-6">
            <PriceTag product={product} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton
              item={{
                productId: product.id,
                slug: product.slug,
                type: product.type,
                title: product.title,
                priceCents: effectivePriceCents(product),
                coverUrl: product.cover_url,
              }}
            />
          </div>

          <Card className="mt-8 space-y-3 p-5 text-sm text-ink-soft">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              Poručuješ bez naloga — ostaviš ime, mejl i Instagram, a mi te kontaktiramo oko uplate.
            </p>
            <p className="flex items-center gap-2">
              <Clapperboard className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              Nakon uplate ti šaljemo pristup svim video klipovima kursa.
            </p>
          </Card>

          {product.description ? (
            <div className="prose-simple mt-8">
              <h2 className="heading-3 mb-3">O čemu je kurs</h2>
              {product.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}

          <p className="mt-8 text-xs text-ink-muted">
            Sadržaj je edukativnog karaktera i ne zamenjuje profesionalni medicinski savet.{' '}
            <Link href="/medicinski-disclaimer" className="underline">
              Disclaimer
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
