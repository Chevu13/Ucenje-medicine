import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Registracija', robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Kreiraj nalog"
      subtitle="Jedan nalog za sve: kupovine, kursevi, beleške i napredak."
    >
      <RegisterForm />
    </AuthShell>
  );
}
