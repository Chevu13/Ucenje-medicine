'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  addMentorshipSession,
  createMentorshipTask,
  decideApplication,
  deleteMentorshipTask,
  updateEnrollmentAdmin,
} from '@/app/actions/admin';
import { addNoteComment } from '@/app/actions/notes';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { EnrollmentStatus, MentorshipTask } from '@/lib/types';

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const decide = (approve: boolean) => {
    startTransition(async () => {
      const res = await decideApplication(applicationId, approve);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" disabled={pending} onClick={() => decide(true)}>
        Odobri
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600" disabled={pending} onClick={() => decide(false)}>
        Odbij
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function EnrollmentControls({
  enrollmentId,
  status,
  nextSessionAt,
}: {
  enrollmentId: string;
  status: EnrollmentStatus;
  nextSessionAt: string | null;
}) {
  const toLocal = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({ status, next: toLocal(nextSessionAt) });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="space-y-4 p-5">
      <h2 className="heading-3">Status mentorstva</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="enr-status">Status</Label>
          <Select
            id="enr-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EnrollmentStatus }))}
          >
            <option value="active">Aktivno</option>
            <option value="paused">Pauzirano</option>
            <option value="completed">Završeno</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="enr-next">Sledeća konsultacija</Label>
          <Input
            id="enr-next"
            type="datetime-local"
            value={form.next}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await updateEnrollmentAdmin(enrollmentId, {
                status: form.status,
                nextSessionAt: form.next ? new Date(form.next).toISOString() : null,
              });
              setMsg(res.ok ? 'Sačuvano.' : res.error);
              router.refresh();
            })
          }
        >
          Sačuvaj
        </Button>
        {msg ? <p className="text-sm text-ink-soft">{msg}</p> : null}
      </div>
    </Card>
  );
}

export function TaskAdmin({
  enrollmentId,
  tasks,
}: {
  enrollmentId: string;
  tasks: MentorshipTask[];
}) {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    dueAt: string;
    priority: 'low' | 'normal' | 'high';
  }>({ title: '', description: '', dueAt: '', priority: 'normal' });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="space-y-4 p-5">
      <h2 className="heading-3">Zadaci</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-ink-soft">Nema zadataka.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-3 rounded-xl border border-brand-100 px-4 py-2.5">
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${t.status === 'done' ? 'text-ink-muted line-through' : 'text-ink'}`}
                >
                  {t.title}
                  {t.priority === 'high' ? <span className="ml-2 text-xs font-bold text-red-600">visok</span> : null}
                </p>
                <p className="text-xs text-ink-muted">
                  {t.due_at ? `Rok: ${formatDate(t.due_at)} · ` : ''}
                  {t.status === 'done' ? 'završeno' : 'u toku'}
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-red-600 hover:underline"
                onClick={() => {
                  if (window.confirm(`Obrisati zadatak „${t.title}“?`)) {
                    startTransition(async () => {
                      await deleteMentorshipTask(t.id);
                      router.refresh();
                    });
                  }
                }}
              >
                Obriši
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 rounded-xl border border-brand-200 bg-surface-subtle p-4">
        <div>
          <Label htmlFor="mt-title">Novi zadatak</Label>
          <Input
            id="mt-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Npr: Preći poglavlje o srcu + uraditi pitanja"
          />
        </div>
        <div>
          <Label htmlFor="mt-desc">Opis (opciono)</Label>
          <Textarea
            id="mt-desc"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="mt-due">Rok</Label>
            <Input
              id="mt-due"
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="mt-priority">Prioritet</Label>
            <Select
              id="mt-priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as typeof f.priority }))}
            >
              <option value="low">Nizak</option>
              <option value="normal">Normalan</option>
              <option value="high">Visok</option>
            </Select>
          </div>
          <Button
            size="sm"
            disabled={pending || !form.title.trim()}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await createMentorshipTask({
                  enrollmentId,
                  title: form.title,
                  description: form.description || null,
                  dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
                  priority: form.priority,
                });
                if (!res.ok) setError(res.error);
                else setForm({ title: '', description: '', dueAt: '', priority: 'normal' });
                router.refresh();
              });
            }}
          >
            Dodaj zadatak
          </Button>
        </div>
        {error ? <Alert tone="error">{error}</Alert> : null}
      </div>
    </Card>
  );
}

export function SessionForm({ enrollmentId }: { enrollmentId: string }) {
  const [form, setForm] = useState({ scheduledAt: '', duration: '60', notes: '' });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-surface-subtle p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="s-at">Termin</Label>
          <Input
            id="s-at"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
          />
        </div>
        <div className="w-24">
          <Label htmlFor="s-dur">Minuta</Label>
          <Input
            id="s-dur"
            type="number"
            min={15}
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="s-notes">Beleške sa konsultacije (opciono)</Label>
        <Textarea
          id="s-notes"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <Button
        size="sm"
        disabled={pending || !form.scheduledAt}
        onClick={() =>
          startTransition(async () => {
            await addMentorshipSession({
              enrollmentId,
              scheduledAt: new Date(form.scheduledAt).toISOString(),
              durationMinutes: Number(form.duration) || 60,
              notes: form.notes || null,
            });
            setForm({ scheduledAt: '', duration: '60', notes: '' });
            router.refresh();
          })
        }
      >
        Evidentiraj konsultaciju
      </Button>
    </div>
  );
}

export function NoteCommentForm({ noteId }: { noteId: string }) {
  const [content, setContent] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="mt-3">
      <Label htmlFor={`comment-${noteId}`}>Komentar mentora</Label>
      <Textarea
        id={`comment-${noteId}`}
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Napiši povratnu informaciju…"
      />
      <div className="mt-2 flex items-center gap-3">
        <Button
          size="sm"
          disabled={pending || !content.trim()}
          onClick={() =>
            startTransition(async () => {
              const res = await addNoteComment(noteId, content);
              setMsg(res.ok ? 'Komentar je poslat.' : res.error);
              if (res.ok) setContent('');
              router.refresh();
            })
          }
        >
          Pošalji komentar
        </Button>
        {msg ? <p className="text-sm text-ink-soft">{msg}</p> : null}
      </div>
    </div>
  );
}
