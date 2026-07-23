import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Prijava', robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell title="Dobrodošao/la nazad" subtitle="Prijavi se da nastaviš tamo gde si stao/la.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
