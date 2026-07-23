import Link from 'next/link';
import { ButtonLink, Card, EmptyState } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { formatDate, productHref } from '@/lib/utils';
import type {
  Entitlement,
  MentorshipTask,
  Product,
} from '@/lib/types';

export default async function AccountOverviewPage() {
  const profile = await getProfile();
  const supabase = createClient();
  const userId = profile?.id ?? '';

  const [{ data: entData }, { data: taskData }, { count: lessonCount }] = await Promise.all([
    supabase
      .from('entitlements')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('mentorship_tasks')
      .select('*, mentorship_enrollments!inner(user_id)')
      .eq('mentorship_enrollments.user_id', userId)
      .eq('status', 'todo')
      .order('due_at', { ascending: true })
      .limit(5),
    supabase.from('user_lesson_progress').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  const entitlements = ((entData as unknown as (Entitlement & { product: Product | null })[]) ?? []).filter(
    (e) => e.product
  ) as (Entitlement & { product: Product })[];
  const tasks = (taskData as unknown as MentorshipTask[]) ?? [];
  const completedLessons = lessonCount ?? 0;

  const firstName = (profile?.full_name ?? '').split(' ')[0] || 'kolega';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-2">Ćao, {firstName} 👋</h1>
        <p className="mt-1 text-ink-soft">Ovde je sve tvoje na jednom mestu.</p>
      </div>

      <section aria-labelledby="continue-heading">
        <h2 id="continue-heading" className="heading-3 mb-4">
          Nastavi gde si stao/la
        </h2>
        {entitlements.length === 0 ? (
          <EmptyState
            title="Još nema materijala"
            description="Kada nešto kupiš (ili upišeš besplatan kurs), pojaviće se ovde."
            action={<ButtonLink href="/kursevi">Istraži sadržaj</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {entitlements.slice(0, 4).map((e) => (
              <Card key={e.id} className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                  {e.product.type === 'course' ? 'Kurs' : e.product.type === 'ebook' ? 'E-knjiga' : 'Materijal'}
                </p>
                <h3 className="mt-1 font-bold text-ink">{e.product.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">Dodato {formatDate(e.created_at)}</p>
                <ButtonLink
                  href={e.product.type === 'course' ? productHref(e.product) : `/nalog/biblioteka/${e.product.slug}`}
                  size="sm"
                  variant="secondary"
                  className="mt-4"
                >
                  Otvori
                </ButtonLink>
              </Card>
            ))}
          </div>
        )}
      </section>

      {tasks.length > 0 ? (
        <section aria-labelledby="tasks-heading">
          <h2 id="tasks-heading" className="heading-3 mb-4">
            Aktivni mentorski zadaci
          </h2>
          <Card className="divide-y divide-brand-50">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-ink">{t.title}</p>
                  {t.due_at ? <p className="text-xs text-ink-muted">Rok: {formatDate(t.due_at)}</p> : null}
                </div>
                <Link href="/nalog/mentorstvo" className="text-sm font-bold text-brand-700 hover:underline">
                  Otvori →
                </Link>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 text-center">
          <p className="text-3xl font-extrabold text-brand-700">{entitlements.length}</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">materijala u biblioteci</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-3xl font-extrabold text-brand-700">{completedLessons}</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">završenih lekcija</p>
        </Card>
        <Card className="p-5 text-center">
          <Link href="/nalog/beleske" className="block">
            <p className="text-3xl font-extrabold text-brand-700">✎</p>
            <p className="mt-1 text-sm font-semibold text-brand-700 underline">otvori beleške</p>
          </Link>
        </Card>
      </section>
    </div>
  );
}
