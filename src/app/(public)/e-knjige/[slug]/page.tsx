import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DigitalProductDetail } from '@/components/products/DigitalProductDetail';
import { getProductBySlug } from '@/lib/queries';
import { siteUrl } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.seo_title ?? product.title,
    description: product.seo_description ?? product.short_description ?? undefined,
    alternates: { canonical: siteUrl(`/e-knjige/${product.slug}`) },
    openGraph: {
      title: product.title,
      description: product.short_description ?? undefined,
      images: product.cover_url ? [product.cover_url] : undefined,
    },
  };
}

export default async function EbookPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.type !== 'ebook') notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.short_description ?? undefined,
    image: product.cover_url ?? undefined,
    offers:
      product.price_cents !== null
        ? {
            '@type': 'Offer',
            price: (product.sale_price_cents ?? product.price_cents) / 100,
            priceCurrency: product.currency,
            availability: 'https://schema.org/InStock',
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DigitalProductDetail product={product} />
    </>
  );
}
