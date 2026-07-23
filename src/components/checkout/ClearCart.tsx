'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';

/** Empties the client cart once a successful payment page is shown. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
