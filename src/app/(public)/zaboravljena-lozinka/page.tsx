import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { ResetRequestForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Zaboravljena lozinka', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Zaboravljena lozinka"
      subtitle="Unesi email adresu naloga — poslaćemo ti link za postavljanje nove lozinke."
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
