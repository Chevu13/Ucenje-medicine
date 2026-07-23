import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { requireMentorOrAdmin } from '@/lib/auth';
import { isAdminDemoMode } from '@/lib/demo';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin — Učenje medicine' },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Mentors may open /admin/mentorstvo; each page enforces its exact role.
  const profile = await requireMentorOrAdmin();

  return (
    <div className="min-h-screen bg-surface-subtle">
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" aria-label="Admin početna">
              <Image src="/brand/logo.svg" alt="Učenje medicine" width={120} height={34} />
            </Link>
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {profile.role === 'admin' ? 'Admin' : 'Mentor'}
            </span>
            {isAdminDemoMode() ? (
              <span
                className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700"
                title="ADMIN_DEMO_MODE je uključen — admin panel je otvoren bez prijave. Isključiti pre objave."
              >
                Demo pregled — prijava isključena
              </span>
            ) : null}
          </div>
          <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Nazad na sajt
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px,1fr]">
        <AdminNav isAdmin={profile.role === 'admin'} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
