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
    alternates: { canonical: siteUrl(`/skripte/${product.slug}`) },
    openGraph: {
      title: product.title,
      description: product.short_description ?? undefined,
      images: product.cover_url ? [product.cover_url] : undefined,
    },
  };
}

export default async function ScriptPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.type !== 'script') notFound();
  return <DigitalProductDetail product={product} />;
}
