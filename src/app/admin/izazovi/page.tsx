import Link from 'next/link';
import { Badge, ButtonLink, Card, EmptyState } from '@/components/ui';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';
import type { Challenge, Product } from '@/lib/types';

const STATUS_LABEL: Record<Challenge['status'], string> = {
  draft: 'Draft',
  scheduled: 'Zakazan',
  active: 'Aktivan',
  completed: 'Završen',
  archived: 'Arhiviran',
};

export default async function AdminChallengesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('challenges')
    .select('*, product:products(*)')
    .order('created_at', { ascending: false });
  const challenges = ((data as unknown as (Challenge & { product: Product | null })[]) ?? []).filter(
    (c) => c.product
  ) as (Challenge & { product: Product })[];

  // Enrollment counts
  const counts = new Map<string, number>();
  if (challenges.length > 0) {
    const { data: enr } = await admin
      .from('challenge_enrollments')
      .select('challenge_id')
      .in(
        'challenge_id',
        challenges.map((c) => c.id)
      );
    for (const row of (enr as { challenge_id: string }[]) ?? []) {
      counts.set(row.challenge_id, (counts.get(row.challenge_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading-2">Izazovi</h1>
        <ButtonLink href="/admin/proizvodi/novi">+ Novi izazov</ButtonLink>
      </div>
      {challenges.length === 0 ? (
        <EmptyState
          title="Nema izazova"
          description="Kreiraj izazov kao proizvod tipa „Izazov“, pa mu ovde podesi termine i zadatke."
        />
      ) : (
        <Card className="divide-y divide-brand-50">
          {challenges.map((ch) => (
            <div key={ch.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{ch.product.title}</p>
                <p className="text-xs text-ink-muted">
                  {formatDate(ch.starts_at)} — {formatDate(ch.ends_at)} · {counts.get(ch.id) ?? 0}{' '}
                  učesnika
                </p>
              </div>
              <Badge
                tone={ch.status === 'active' ? 'green' : ch.status === 'scheduled' ? 'amber' : 'gray'}
              >
                {STATUS_LABEL[ch.status]}
              </Badge>
              <Link
                href={`/admin/izazovi/${ch.product.id}`}
                className="text-sm font-bold text-brand-700 hover:underline"
              >
                Uredi →
              </Link>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
