'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthResult,
} from '@/app/actions/auth';
import { Alert, Button, FieldError, Input, Label } from '@/components/ui';

function useAuthSubmit() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<AuthResult>) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Došlo je do greške.');
      else if (res.message) setMessage(res.message);
    });
  };

  return { error, message, pending, run };
}

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next');
  const linkError = params.get('greska') === 'link';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, pending, run } = useAuthSubmit();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => signIn({ email, password }, next));
      }}
    >
      {linkError ? (
        <Alert tone="warning">Link nije važeći ili je istekao. Prijavi se ili zatraži novi.</Alert>
      ) : null}
      <div>
        <Label htmlFor="login-email">Email adresa</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="login-password">Lozinka</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <FieldError message={error ?? undefined} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Prijavljivanje…' : 'Prijavi se'}
      </Button>
      <div className="flex justify-between text-sm">
        <Link href="/zaboravljena-lozinka" className="font-semibold text-brand-700 hover:underline">
          Zaboravljena lozinka?
        </Link>
        <Link href="/registracija" className="font-semibold text-brand-700 hover:underline">
          Nemaš nalog? Registruj se
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, message, pending, run } = useAuthSubmit();

  if (message) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{message}</Alert>
        <Link href="/prijava" className="block text-center font-semibold text-brand-700 underline">
          Nastavi na prijavu
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => signUp({ fullName, email, password }));
      }}
    >
      <div>
        <Label htmlFor="reg-name">Ime i prezime</Label>
        <Input
          id="reg-name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="reg-email">Email adresa</Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="reg-password">Lozinka (min. 8 karaktera)</Label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <FieldError message={error ?? undefined} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Kreiranje naloga…' : 'Kreiraj nalog'}
      </Button>
      <p className="text-center text-xs text-ink-muted">
        Registracijom prihvataš{' '}
        <Link href="/uslovi-koriscenja" className="underline">
          uslove korišćenja
        </Link>{' '}
        i{' '}
        <Link href="/privatnost" className="underline">
          politiku privatnosti
        </Link>
        .
      </p>
    </form>
  );
}

export function ResetRequestForm() {
  const [email, setEmail] = useState('');
  const { error, message, pending, run } = useAuthSubmit();

  if (message) return <Alert tone="success">{message}</Alert>;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => requestPasswordReset(email));
      }}
    >
      <div>
        <Label htmlFor="reset-email">Email adresa naloga</Label>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <FieldError message={error ?? undefined} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Slanje…' : 'Pošalji link za promenu lozinke'}
      </Button>
    </form>
  );
}

export function NewPasswordForm() {
  const [password, setPassword] = useState('');
  const { error, message, pending, run } = useAuthSubmit();

  if (message) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{message}</Alert>
        <Link href="/nalog" className="block text-center font-semibold text-brand-700 underline">
          Idi na svoj nalog
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updatePassword(password));
      }}
    >
      <div>
        <Label htmlFor="new-password">Nova lozinka (min. 8 karaktera)</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <FieldError message={error ?? undefined} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Čuvanje…' : 'Sačuvaj novu lozinku'}
      </Button>
    </form>
  );
}
