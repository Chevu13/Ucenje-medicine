'use client';

import { useState, useTransition } from 'react';
import { subscribeToNewsletter } from '@/app/actions/misc';
import { Button, Input } from '@/components/ui';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await subscribeToNewsletter(email);
          setResult(res);
          if (res.ok) setEmail('');
        });
      }}
    >
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email adresa
        </label>
        <Input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="tvoja@email-adresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={result ? 'newsletter-status' : undefined}
        />
        {result ? (
          <p
            id="newsletter-status"
            role="status"
            className={`mt-2 text-sm font-medium ${result.ok ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {result.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Slanje…' : 'Prijavi se'}
      </Button>
    </form>
  );
}
