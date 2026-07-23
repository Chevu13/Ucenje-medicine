'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCart, type CartItem } from './CartProvider';

export function AddToCartButton({
  item,
  size = 'lg',
  goToCart = false,
}: {
  item: CartItem;
  size?: 'sm' | 'md' | 'lg';
  goToCart?: boolean;
}) {
  const { add, has } = useCart();
  const router = useRouter();
  const inCart = has(item.productId);

  if (item.priceCents === null) {
    return (
      <Button size={size} disabled aria-disabled="true">
        Cena uskoro
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={inCart ? 'secondary' : 'primary'}
      onClick={() => {
        if (inCart) {
          router.push('/korpa');
          return;
        }
        add(item);
        if (goToCart) router.push('/korpa');
      }}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" /> U korpi — otvori korpu
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Dodaj u korpu
        </>
      )}
    </Button>
  );
}
