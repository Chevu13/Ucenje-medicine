'use client';

import { useState, useTransition } from 'react';
import { updatePassword, updateProfile } from '@/app/actions/auth';
import { Button, Card, FieldError, Input, Label } from '@/components/ui';

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <h2 className="heading-3 mb-4">Profil</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await updateProfile(name);
            setStatus({ ok: res.ok, text: res.ok ? (res.message ?? 'Sačuvano.') : (res.error ?? 'Greška.') });
          });
        }}
      >
        <div>
          <Label htmlFor="profile-email">Email adresa</Label>
          <Input id="profile-email" value={email} disabled aria-readonly="true" />
        </div>
        <div>
          <Label htmlFor="profile-name">Ime i prezime</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {status && !status.ok ? <FieldError message={status.text} /> : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Čuvanje…' : 'Sačuvaj'}
          </Button>
          {status?.ok ? (
            <p role="status" className="text-sm font-medium text-emerald-600">
              {status.text}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <h2 className="heading-3 mb-4">Promena lozinke</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await updatePassword(password);
            setStatus({ ok: res.ok, text: res.ok ? (res.message ?? 'Sačuvano.') : (res.error ?? 'Greška.') });
            if (res.ok) setPassword('');
          });
        }}
      >
        <div>
          <Label htmlFor="new-pass">Nova lozinka (min. 8 karaktera)</Label>
          <Input
            id="new-pass"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {status && !status.ok ? <FieldError message={status.text} /> : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Čuvanje…' : 'Promeni lozinku'}
          </Button>
          {status?.ok ? (
            <p role="status" className="text-sm font-medium text-emerald-600">
              {status.text}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
