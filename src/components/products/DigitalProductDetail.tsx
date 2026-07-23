import Link from 'next/link';
import { Mail, ShieldCheck } from 'lucide-react';
import { Badge, Card, DemoBadge } from '@/components/ui';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductCover, PriceTag } from '@/components/products/ProductCard';
import type { Product } from '@/lib/types';
import { effectivePriceCents, PRODUCT_TYPE_LABELS } from '@/lib/utils';

/** Shared detail page body for e-books and scripts (guest order flow). */
export function DigitalProductDetail({ product }: { product: Product }) {
  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr,1.2fr]">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-card">
        <ProductCover product={product} sizes="(max-width: 1024px) 90vw, 35vw" />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge tone="light">{PRODUCT_TYPE_LABELS[product.type]}</Badge>
          {product.is_demo ? <DemoBadge /> : null}
        </div>
        <h1 className="heading-1">{product.title}</h1>
        {product.author_name ? (
          <p className="mt-2 text-sm font-semibold text-ink-muted">Autor: {product.author_name}</p>
        ) : null}
        {product.page_count ? (
          <p className="mt-1 text-sm text-ink-muted">{product.page_count} strana</p>
        ) : null}

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
            <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            Materijal ti šaljemo lično čim uplata bude potvrđena.
          </p>
        </Card>

        {product.description ? (
          <div className="prose-simple mt-8">
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
  );
}
