import { EmptyState } from '@/components/ui';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

export function ProductGrid({
  products,
  emptyTitle,
  emptyDescription,
}: {
  products: Product[];
  emptyTitle: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
