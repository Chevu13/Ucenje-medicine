import Link from 'next/link';
import Image from 'next/image';
import { Badge, Card, DemoBadge } from '@/components/ui';
import { Ekg } from '@/components/Ekg';
import type { Product } from '@/lib/types';
import {
  effectivePriceCents,
  formatPrice,
  productHref,
  PRODUCT_TYPE_LABELS,
} from '@/lib/utils';

export function ProductCover({
  product,
  sizes = '(max-width: 640px) 100vw, 33vw',
}: {
  product: Pick<Product, 'cover_url' | 'title'>;
  sizes?: string;
}) {
  if (product.cover_url) {
    return (
      <Image
        src={product.cover_url}
        alt={product.title}
        fill
        sizes={sizes}
        className="object-cover"
      />
    );
  }
  // Branded placeholder instead of a stock photo
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-600 to-brand-900 p-6">
      <Ekg className="h-8 w-24" color="#9CC3FF" />
      <p className="text-center text-sm font-bold leading-snug text-white">{product.title}</p>
    </div>
  );
}

export function PriceTag({ product }: { product: Product }) {
  const effective = effectivePriceCents(product);
  if (product.is_free) {
    return <span className="text-base font-extrabold text-emerald-600">Besplatno</span>;
  }
  if (effective === null) {
    return <span className="text-sm font-semibold text-ink-muted">Cena uskoro</span>;
  }
  const hasDiscount = product.sale_price_cents !== null && product.price_cents !== null;
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-base font-extrabold text-ink">{formatPrice(effective, product.currency)}</span>
      {hasDiscount ? (
        <s className="text-sm text-ink-muted">{formatPrice(product.price_cents, product.currency)}</s>
      ) : null}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lift">
      <Link href={productHref(product)} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <ProductCover product={product} />
        </div>
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="light">{PRODUCT_TYPE_LABELS[product.type]}</Badge>
            {product.is_demo ? <DemoBadge /> : null}
          </div>
          <h3 className="text-lg font-bold leading-snug text-ink group-hover:text-brand-700">
            {product.title}
          </h3>
          {product.short_description ? (
            <p className="line-clamp-2 text-sm text-ink-soft">{product.short_description}</p>
          ) : null}
          <PriceTag product={product} />
        </div>
      </Link>
    </Card>
  );
}
