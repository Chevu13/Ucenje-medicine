'use client';

import { useState, useTransition } from 'react';
import { submitMentorshipInquiry } from '@/app/actions/shop';
import { Alert, Button, Input, Label, Textarea } from '@/components/ui';

/**
 * Mentorship inquiry — same guest flow as product orders: contact details
 * plus a short description. No account, no payment on the site.
 */
export function MentorshipInquiryForm() {
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
          const res = await submitMentorshipInquiry({ fullName, email, instagram, message });
          // On success the action redirects; we only land here on error.
          if (res && !res.ok) setError(res.error);
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="m-name">Ime i prezime</Label>
        <Input
          id="m-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div>
        <Label htmlFor="m-email">Mejl</Label>
        <Input
          id="m-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="m-ig">Instagram korisničko ime</Label>
        <Input
          id="m-ig"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          required
          placeholder="npr. ucenje_medicine"
        />
      </div>
      <div>
        <Label htmlFor="m-msg">Šta ti treba od mentorstva?</Label>
        <Textarea
          id="m-msg"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Koja godina studija, koji ispiti su ti prioritet, gde najviše zapinješ…"
        />
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Slanje…' : 'Pošalji upit'}
      </Button>
      <p className="text-xs text-ink-muted">
        Nema plaćanja na sajtu. Javljamo ti se lično na mejl ili Instagram sa svim detaljima.
      </p>
    </form>
  );
}
