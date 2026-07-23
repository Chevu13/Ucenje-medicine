import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui';
import {
  EnrollmentControls,
  NoteCommentForm,
  SessionForm,
  TaskAdmin,
} from '@/components/admin/MentorshipAdmin';
import { requireMentorOrAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';
import type {
  MentorshipEnrollment,
  MentorshipSession,
  MentorshipTask,
  Note,
  NoteComment,
  Profile,
} from '@/lib/types';

interface Props {
  params: { enrollmentId: string };
}

export default async function AdminMenteePage({ params }: Props) {
  await requireMentorOrAdmin();
  const admin = createAdminClient();

  const { data: enrData } = await admin
    .from('mentorship_enrollments')
    .select('*, user:profiles!mentorship_enrollments_user_id_fkey(id, full_name, email)')
    .eq('id', params.enrollmentId)
    .maybeSingle();
  if (!enrData) notFound();
  const enrollment = enrData as unknown as MentorshipEnrollment & {
    user: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
  };

  const [{ data: tasksData }, { data: sessionsData }, { data: notesData }] = await Promise.all([
    admin
      .from('mentorship_tasks')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .order('due_at', { ascending: true }),
    admin
      .from('mentorship_sessions')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .order('scheduled_at', { ascending: false }),
    admin
      .from('notes')
      .select('*, note_comments(*, author:profiles(full_name))')
      .eq('user_id', enrollment.user?.id ?? '')
      .eq('shared_with_mentor', true)
      .order('updated_at', { ascending: false }),
  ]);

  const tasks = (tasksData as MentorshipTask[]) ?? [];
  const sessions = (sessionsData as MentorshipSession[]) ?? [];
  const notes =
    (notesData as unknown as (Note & {
      note_comments: (NoteComment & { author: Pick<Profile, 'full_name'> | null })[];
    })[]) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/mentorstvo"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Svi polaznici
        </Link>
        <h1 className="heading-2">{enrollment.user?.full_name || enrollment.user?.email}</h1>
        <p className="text-sm text-ink-muted">{enrollment.user?.email}</p>
      </div>

      <EnrollmentControls
        enrollmentId={enrollment.id}
        status={enrollment.status}
        nextSessionAt={enrollment.next_session_at}
      />

      <Card className="p-5">
        <h2 className="heading-3 mb-3">Ciljevi i plan polaznika</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-bold text-ink">Ciljevi</p>
            <p className="whitespace-pre-wrap text-ink-soft">{enrollment.goals || '—'}</p>
          </div>
          <div>
            <p className="font-bold text-ink">Plan učenja</p>
            <p className="whitespace-pre-wrap text-ink-soft">{enrollment.study_plan || '—'}</p>
          </div>
        </div>
      </Card>

      <TaskAdmin enrollmentId={enrollment.id} tasks={tasks} />

      <Card className="space-y-4 p-5">
        <h2 className="heading-3">Konsultacije</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-soft">Još nema evidentiranih konsultacija.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-xl border border-brand-100 px-4 py-2.5 text-sm">
                <p className="font-semibold text-ink">
                  {formatDateTime(s.scheduled_at)} · {s.duration_minutes} min
                </p>
                {s.notes ? <p className="mt-1 text-ink-soft">{s.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <SessionForm enrollmentId={enrollment.id} />
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="heading-3">Podeljene beleške ({notes.length})</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Polaznik još nije podelio nijednu belešku sa mentorom.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-brand-100 p-4">
              <p className="font-bold text-ink">{note.title || 'Bez naslova'}</p>
              <p className="text-xs text-ink-muted">Ažurirano {formatDateTime(note.updated_at)}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{note.content || '—'}</p>
              {note.note_comments.length > 0 ? (
                <div className="mt-3 space-y-2 border-t border-brand-100 pt-3">
                  {note.note_comments.map((c) => (
                    <p key={c.id} className="text-sm text-ink-soft">
                      <span className="font-semibold text-ink">{c.author?.full_name ?? 'Mentor'}:</span>{' '}
                      {c.content}
                    </p>
                  ))}
                </div>
              ) : null}
              <NoteCommentForm noteId={note.id} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
