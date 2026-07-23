'use client';

import { useState, useTransition } from 'react';
import { submitProductInquiry } from '@/app/actions/shop';
import { Alert, Button, Input, Label, Textarea } from '@/components/ui';

/**
 * Guest inquiry form for a single product (e.g. a course). Buyer leaves
 * contact details and we send the links/material personally.
 */
export function ProductInquiryForm({
  productId,
  messageLabel = 'Poruka (opciono)',
  messagePlaceholder,
}: {
  productId: string;
  messageLabel?: string;
  messagePlaceholder?: string;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await submitProductInquiry({
            productId,
            fullName,
            email,
            instagram,
            message,
          });
          if (res && !res.ok) setError(res.error);
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="pi-name">Ime i prezime</Label>
        <Input
          id="pi-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div>
        <Label htmlFor="pi-email">Mejl</Label>
        <Input
          id="pi-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="pi-ig">Instagram korisničko ime</Label>
        <Input
          id="pi-ig"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          required
          placeholder="npr. ucenje_medicine"
        />
      </div>
      <div>
        <Label htmlFor="pi-msg">{messageLabel}</Label>
        <Textarea
          id="pi-msg"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messagePlaceholder}
        />
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Slanje…' : 'Pošalji upit'}
      </Button>
      <p className="text-xs text-ink-muted">
        Nema plaćanja na sajtu. Javljamo ti se lično na mejl ili Instagram i pošaljemo pristup.
      </p>
    </form>
  );
}
