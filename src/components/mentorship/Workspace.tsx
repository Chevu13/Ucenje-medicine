'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { setMentorshipTaskDone, updateMentorshipWorkspace } from '@/app/actions/mentorship';
import { Badge, Button, Card, Textarea } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { MentorshipTask } from '@/lib/types';

export function GoalsEditor({
  enrollmentId,
  initialGoals,
  initialPlan,
}: {
  enrollmentId: string;
  initialGoals: string;
  initialPlan: string;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [plan, setPlan] = useState(initialPlan);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <h2 className="heading-3 mb-4">Ciljevi i plan učenja</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="goals" className="mb-1.5 block text-sm font-semibold text-ink">
            Moji ciljevi
          </label>
          <Textarea
            id="goals"
            rows={3}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Npr: položiti anatomiju u junskom roku…"
          />
        </div>
        <div>
          <label htmlFor="plan" className="mb-1.5 block text-sm font-semibold text-ink">
            Plan učenja (dogovoren sa Darkom)
          </label>
          <Textarea
            id="plan"
            rows={5}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Nedeljni raspored, teme, provere…"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await updateMentorshipWorkspace(enrollmentId, {
                  goals,
                  studyPlan: plan,
                });
                setStatus(res.ok ? 'Sačuvano.' : res.error);
              })
            }
          >
            {pending ? 'Čuvanje…' : 'Sačuvaj'}
          </Button>
          {status ? (
            <p role="status" className="text-sm text-ink-soft">
              {status}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

const PRIORITY_LABEL: Record<MentorshipTask['priority'], { label: string; tone: 'red' | 'amber' | 'gray' }> = {
  high: { label: 'Visok prioritet', tone: 'red' },
  normal: { label: 'Normalan', tone: 'amber' },
  low: { label: 'Nizak', tone: 'gray' },
};

export function TaskList({ tasks }: { tasks: MentorshipTask[] }) {
  const [items, setItems] = useState(tasks);
  const [pending, startTransition] = useTransition();

  const toggle = (task: MentorshipTask) => {
    const done = task.status !== 'done';
    startTransition(async () => {
      const res = await setMentorshipTaskDone(task.id, done);
      if (res.ok) {
        setItems((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: done ? 'done' : 'todo' } : t))
        );
      }
    });
  };

  if (items.length === 0) {
    return (
      <Card className="p-6 text-sm text-ink-soft">
        Još nema zadataka — dobićeš ih posle prve konsultacije.
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-brand-50">
      {items.map((task) => {
        const done = task.status === 'done';
        const priority = PRIORITY_LABEL[task.priority];
        return (
          <div key={task.id} className="flex items-start gap-3 p-4">
            <button
              type="button"
              onClick={() => toggle(task)}
              disabled={pending}
              aria-label={done ? `Poništi zadatak: ${task.title}` : `Završi zadatak: ${task.title}`}
              className="mt-0.5 text-brand-600 disabled:opacity-50"
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              ) : (
                <Circle className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${done ? 'text-ink-muted line-through' : 'text-ink'}`}>
                {task.title}
              </p>
              {task.description ? <p className="mt-0.5 text-sm text-ink-soft">{task.description}</p> : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                {task.due_at ? <span>Rok: {formatDate(task.due_at)}</span> : null}
                {!done && task.priority !== 'normal' ? (
                  <Badge tone={priority.tone}>{priority.label}</Badge>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
