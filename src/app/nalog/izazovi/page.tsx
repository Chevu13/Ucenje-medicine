import { Badge, ButtonLink, Card, EmptyState } from '@/components/ui';
import { ChallengeTaskList } from '@/components/challenges/ChallengeTaskList';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import type { Challenge, ChallengeEnrollment, ChallengeTask, Product } from '@/lib/types';

interface EnrollmentRow extends ChallengeEnrollment {
  challenge: (Challenge & { product: Product | null; challenge_tasks: ChallengeTask[] }) | null;
}

export default async function MyChallengesPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from('challenge_enrollments')
    .select('*, challenge:challenges(*, product:products(*), challenge_tasks(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const enrollments = ((data as unknown as EnrollmentRow[]) ?? []).filter((e) => e.challenge?.product);

  if (enrollments.length === 0) {
    return (
      <div>
        <h1 className="heading-2 mb-8">Moji izazovi</h1>
        <EmptyState
          title="Još nisi u izazovu"
          description="Kada se prijaviš na izazov, dnevni zadaci će te čekati ovde."
          action={<ButtonLink href="/izazovi">Pogledaj izazove</ButtonLink>}
        />
      </div>
    );
  }

  // Load completed tasks for all enrollments
  const { data: progressData } = await supabase
    .from('challenge_task_progress')
    .select('enrollment_id, task_id')
    .in(
      'enrollment_id',
      enrollments.map((e) => e.id)
    );
  const progress = (progressData as { enrollment_id: string; task_id: string }[]) ?? [];

  return (
    <div className="space-y-10">
      <h1 className="heading-2">Moji izazovi</h1>
      {enrollments.map((e) => {
        const ch = e.challenge!;
        const product = ch.product!;
        const tasks = [...ch.challenge_tasks].sort(
          (a, b) => a.day_number - b.day_number || a.position - b.position
        );
        const completedIds = progress.filter((p) => p.enrollment_id === e.id).map((p) => p.task_id);
        const started = ch.starts_at ? new Date(ch.starts_at).getTime() <= Date.now() : false;

        return (
          <section key={e.id} aria-label={product.title}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="heading-3">{product.title}</h2>
              <Badge tone={ch.status === 'active' ? 'green' : ch.status === 'scheduled' ? 'amber' : 'gray'}>
                {ch.status === 'active'
                  ? 'U toku'
                  : ch.status === 'scheduled'
                    ? 'Uskoro'
                    : ch.status === 'completed'
                      ? 'Završen'
                      : ch.status}
              </Badge>
              <span className="text-sm text-ink-muted">
                {formatDate(ch.starts_at)} — {formatDate(ch.ends_at)}
              </span>
            </div>

            {!started && ch.status === 'scheduled' ? (
              <Card className="p-6 text-sm text-ink-soft">
                Prijavljen/a si! Zadaci se otključavaju kada izazov počne ({formatDate(ch.starts_at)}).
              </Card>
            ) : tasks.length === 0 ? (
              <Card className="p-6 text-sm text-ink-soft">Zadaci se uskoro objavljuju.</Card>
            ) : (
              <ChallengeTaskList enrollmentId={e.id} tasks={tasks} initialCompletedIds={completedIds} />
            )}
          </section>
        );
      })}
    </div>
  );
}
