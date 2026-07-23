import Link from 'next/link';
import { Badge, ButtonLink, Card, EmptyState } from '@/components/ui';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

export default async function AdminCoursesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('products')
    .select('*')
    .eq('type', 'course')
    .order('position');
  const courses = (data as Product[] | null) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading-2">Kursevi</h1>
        <ButtonLink href="/admin/proizvodi/novi">+ Novi kurs</ButtonLink>
      </div>
      {courses.length === 0 ? (
        <EmptyState
          title="Nema kurseva"
          description="Kreiraj kurs kao proizvod tipa „Kurs“, pa mu ovde dodaj module i lekcije."
        />
      ) : (
        <Card className="divide-y divide-brand-50">
          {courses.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{c.title}</p>
                <p className="text-xs text-ink-muted">/{c.slug}</p>
              </div>
              <Badge tone={c.status === 'published' ? 'green' : 'amber'}>
                {c.status === 'published' ? 'Objavljeno' : 'Draft'}
              </Badge>
              <Link
                href={`/admin/kursevi/${c.id}`}
                className="text-sm font-bold text-brand-700 hover:underline"
              >
                Kurikulum →
              </Link>
              <Link
                href={`/admin/proizvodi/${c.id}`}
                className="text-sm font-semibold text-ink-soft hover:underline"
              >
                Podaci
              </Link>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
