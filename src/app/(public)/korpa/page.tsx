'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { ButtonLink, Card, EmptyState } from '@/components/ui';
import { formatPrice, PRODUCT_TYPE_ROUTES } from '@/lib/utils';

export default function CartPage() {
  const { items, remove, totalCents, ready } = useCart();

  if (!ready) {
    return <div className="container-page py-16" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-page max-w-2xl py-16">
        <h1 className="heading-1 mb-8">Korpa</h1>
        <EmptyState
          title="Korpa je prazna"
          description="Dodaj kurs, skriptu ili e-knjigu i nastavi odavde."
          action={<ButtonLink href="/kursevi">Istraži sadržaj</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="heading-1 mb-8">Korpa</h1>

      <Card className="divide-y divide-brand-50">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4 sm:p-5">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-900">
              {item.coverUrl ? (
                <Image src={item.coverUrl} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] font-bold leading-tight text-white">
                  {item.title}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`${PRODUCT_TYPE_ROUTES[item.type as keyof typeof PRODUCT_TYPE_ROUTES] ?? '/kursevi'}/${item.slug}`}
                className="block truncate font-bold text-ink hover:text-brand-700"
              >
                {item.title}
              </Link>
              <p className="text-sm font-semibold text-ink-soft">{formatPrice(item.priceCents)}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.productId)}
              aria-label={`Ukloni ${item.title} iz korpe`}
              className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </Card>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-extrabold text-ink">
          Ukupno: {formatPrice(totalCents)}
        </p>
        <ButtonLink href="/placanje" size="lg">
          Završi porudžbinu
        </ButtonLink>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Bez naloga i bez plaćanja karticom na sajtu: ostavljaš ime, mejl i Instagram, a mi te
        kontaktiramo oko uplate i lično ti šaljemo materijale.
      </p>
    </div>
  );
}
