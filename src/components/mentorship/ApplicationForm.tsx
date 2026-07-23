'use client';

import { useState, useTransition } from 'react';
import { applyForMentorship } from '@/app/actions/mentorship';
import { Alert, Button, Label, Textarea, FieldError } from '@/components/ui';

export function MentorshipApplicationForm({ programId }: { programId: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <Alert tone="success">
        Prijava je poslata. Darko lično pregleda svaku prijavu — odgovor ćeš dobiti na nalogu i
        putem mejla.
      </Alert>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await applyForMentorship(programId, message);
          if (res.ok) setSent(true);
          else setError(res.error);
        });
      }}
    >
      <Label htmlFor="application-message">
        Ukratko o tebi: gde si sada, šta ti je cilj i sa čim se mučiš
      </Label>
      <Textarea
        id="application-message"
        required
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        aria-describedby={error ? 'application-error' : undefined}
        placeholder="Npr: Druga godina, pao/la sam anatomiju dva puta, treba mi sistem…"
      />
      <FieldError id="application-error" message={error ?? undefined} />
      <Button type="submit" size="lg" className="mt-4" disabled={pending}>
        {pending ? 'Slanje…' : 'Pošalji prijavu'}
      </Button>
    </form>
  );
}
