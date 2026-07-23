import type { Metadata } from 'next';
import { requireUser, getProfile } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AccountNav } from '@/components/account/AccountNav';

export const metadata: Metadata = {
  title: 'Moj nalog',
  robots: { index: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const profile = await getProfile();

  return (
    <>
      <Header />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px,1fr]">
        <AccountNav fullName={profile?.full_name ?? ''} />
        <main className="min-w-0">{children}</main>
      </div>
      <Footer />
    </>
  );
}
