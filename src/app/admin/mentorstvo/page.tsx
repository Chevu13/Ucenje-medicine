import Link from 'next/link';
import { Badge, Card, EmptyState } from '@/components/ui';
import { ApplicationActions } from '@/components/admin/MentorshipAdmin';
import { requireMentorOrAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';
import type { MentorshipApplication, MentorshipEnrollment, Profile } from '@/lib/types';

export default async function AdminMentorshipPage() {
  await requireMentorOrAdmin();
  const admin = createAdminClient();

  const [{ data: appsData }, { data: enrData }] = await Promise.all([
    admin
      .from('mentorship_applications')
      .select('*, user:profiles(full_name, email)')
      .eq('status', 'pending')
      .order('created_at'),
    admin
      .from('mentorship_enrollments')
      .select('*, user:profiles(full_name, email)')
      .order('status')
      .order('created_at', { ascending: false }),
  ]);

  const applications =
    (appsData as unknown as (MentorshipApplication & { user: Pick<Profile, 'full_name' | 'email'> | null })[]) ?? [];
  const enrollments =
    (enrData as unknown as (MentorshipEnrollment & { user: Pick<Profile, 'full_name' | 'email'> | null })[]) ?? [];

  return (
    <div className="space-y-8">
      <h1 className="heading-2">Mentorstvo</h1>

      <section>
        <h2 className="heading-3 mb-4">Prijave na čekanju ({applications.length})</h2>
        {applications.length === 0 ? (
          <Card className="p-5 text-sm text-ink-soft">Nema prijava koje čekaju odluku.</Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{app.user?.full_name || app.user?.email}</p>
                    <p className="text-xs text-ink-muted">
                      {app.user?.email} · prijava {formatDate(app.created_at)}
                    </p>
                  </div>
                  <ApplicationActions applicationId={app.id} />
                </div>
                {app.message ? (
                  <p className="mt-3 rounded-xl bg-surface-subtle p-3 text-sm text-ink-soft">{app.message}</p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="heading-3 mb-4">Polaznici ({enrollments.length})</h2>
        {enrollments.length === 0 ? (
          <EmptyState title="Još nema polaznika" description="Odobrene prijave se pojavljuju ovde." />
        ) : (
          <Card className="divide-y divide-brand-50">
            {enrollments.map((e) => (
              <Link
                key={e.id}
                href={`/admin/mentorstvo/${e.id}`}
                className="flex flex-wrap items-center gap-3 p-4 hover:bg-surface-subtle"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{e.user?.full_name || e.user?.email}</p>
                  <p className="text-xs text-ink-muted">{e.user?.email}</p>
                </div>
                <Badge tone={e.status === 'active' ? 'green' : e.status === 'paused' ? 'amber' : 'gray'}>
                  {e.status === 'active' ? 'Aktivno' : e.status === 'paused' ? 'Pauzirano' : 'Završeno'}
                </Badge>
                <span className="text-sm font-bold text-brand-700">Otvori →</span>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
