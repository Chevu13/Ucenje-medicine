import { Alert, ButtonLink, Card, EmptyState } from '@/components/ui';
import { GoalsEditor, TaskList } from '@/components/mentorship/Workspace';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import type {
  MentorshipApplication,
  MentorshipEnrollment,
  MentorshipSession,
  MentorshipTask,
} from '@/lib/types';

export default async function MentorshipWorkspacePage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: enrollmentData } = await supabase
    .from('mentorship_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const enrollment = enrollmentData as MentorshipEnrollment | null;

  if (!enrollment) {
    const { data: appData } = await supabase
      .from('mentorship_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const application = appData as MentorshipApplication | null;

    return (
      <div>
        <h1 className="heading-2 mb-8">Mentorstvo</h1>
        {application?.status === 'pending' ? (
          <Alert tone="info">
            Tvoja prijava za mentorstvo čeka pregled. Javićemo ti se čim Darko odluči.
          </Alert>
        ) : (
          <EmptyState
            title="Još nisi u mentorstvu"
            description="Mentorstvo je najdirektniji način rada sa Darkom — pogledaj kako funkcioniše."
            action={<ButtonLink href="/mentorstvo">O mentorstvu</ButtonLink>}
          />
        )}
      </div>
    );
  }

  const [{ data: tasksData }, { data: sessionsData }] = await Promise.all([
    supabase
      .from('mentorship_tasks')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .order('status', { ascending: false })
      .order('due_at', { ascending: true }),
    supabase
      .from('mentorship_sessions')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .order('scheduled_at', { ascending: false })
      .limit(10),
  ]);

  const tasks = (tasksData as MentorshipTask[]) ?? [];
  const sessions = (sessionsData as MentorshipSession[]) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-2">Moje mentorstvo</h1>
        <p className="mt-1 text-ink-soft">
          Status:{' '}
          <strong>
            {enrollment.status === 'active'
              ? 'aktivno'
              : enrollment.status === 'paused'
                ? 'pauzirano'
                : 'završeno'}
          </strong>
          {enrollment.next_session_at
            ? ` · sledeća konsultacija: ${formatDateTime(enrollment.next_session_at)}`
            : ''}
        </p>
      </div>

      {enrollment.status === 'paused' ? (
        <Alert tone="warning">Mentorstvo je trenutno pauzirano — javi se Darku za nastavak.</Alert>
      ) : null}

      <GoalsEditor
        enrollmentId={enrollment.id}
        initialGoals={enrollment.goals ?? ''}
        initialPlan={enrollment.study_plan ?? ''}
      />

      <section>
        <h2 className="heading-3 mb-4">Zadaci</h2>
        <TaskList tasks={tasks} />
      </section>

      <section>
        <h2 className="heading-3 mb-4">Istorija konsultacija</h2>
        {sessions.length === 0 ? (
          <Card className="p-6 text-sm text-ink-soft">Još nema evidentiranih konsultacija.</Card>
        ) : (
          <Card className="divide-y divide-brand-50">
            {sessions.map((s) => (
              <div key={s.id} className="p-4">
                <p className="font-semibold text-ink">
                  {formatDateTime(s.scheduled_at)} · {s.duration_minutes} min
                </p>
                {s.notes ? <p className="mt-1 text-sm text-ink-soft">{s.notes}</p> : null}
              </div>
            ))}
          </Card>
        )}
      </section>

      <Alert tone="info">
        Savet: podeli beleške sa mentorom u sekciji „Beleške“ da bi dobio/la komentare između
        konsultacija.
      </Alert>
    </div>
  );
}
