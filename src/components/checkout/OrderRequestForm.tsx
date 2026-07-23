'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { submitOrderRequest } from '@/app/actions/shop';
import { useCart } from '@/components/cart/CartProvider';
import { Alert, Button, Card, Input, Label, Textarea } from '@/components/ui';
import { formatPrice } from '@/lib/utils';

/**
 * Guest order form. Collects name, email and Instagram so Darko can contact
 * the buyer about payment and delivery. No account, no card data on the site.
 */
export function OrderRequestForm() {
  const { items, totalCents, ready } = useCart();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-ink-soft">Korpa je prazna.</p>
        <p className="mt-2 text-sm">
          <Link href="/skripte" className="font-semibold text-brand-700 hover:underline">
            Pogledaj skripte i materijale →
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await submitOrderRequest({
            productIds: items.map((i) => i.productId),
            fullName,
            email,
            instagram,
            note,
          });
          // On success the action redirects; we only land here on error.
          if (res && !res.ok) setError(res.error);
        });
      }}
      className="space-y-5"
    >
      <Card className="p-6">
        <h2 className="heading-3">Tvoja porudžbina</h2>
        <ul className="mt-3 space-y-2">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 text-sm">
              <span className="text-ink">{i.title}</span>
              <span className="font-semibold text-ink">
                {i.priceCents != null ? formatPrice(i.priceCents) : '—'}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-brand-100 pt-3 text-right font-extrabold text-ink">
          Ukupno: {formatPrice(totalCents)}
        </p>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="heading-3">Podaci za kontakt</h2>
        <p className="text-sm text-ink-soft">
          Nema plaćanja karticom na sajtu. Nakon porudžbine te kontaktiramo na mejl ili Instagram
          sa uputstvima za uplatu, a materijale ti šaljemo lično čim uplata bude potvrđena.
        </p>
        <div>
          <Label htmlFor="order-name">Ime i prezime</Label>
          <Input
            id="order-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="order-email">Mejl</Label>
          <Input
            id="order-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="order-instagram">Instagram korisničko ime</Label>
          <Input
            id="order-instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            required
            placeholder="npr. ucenje_medicine"
          />
        </div>
        <div>
          <Label htmlFor="order-note">Napomena (opciono)</Label>
          <Textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ako želiš nešto da dodaš uz porudžbinu…"
          />
        </div>
      </Card>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Slanje…' : 'Pošalji porudžbinu'}
      </Button>
    </form>
  );
}
