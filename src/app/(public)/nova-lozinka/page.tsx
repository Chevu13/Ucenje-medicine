import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { NewPasswordForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Nova lozinka', robots: { index: false } };

export default function NewPasswordPage() {
  return (
    <AuthShell title="Postavi novu lozinku">
      <NewPasswordForm />
    </AuthShell>
  );
}
