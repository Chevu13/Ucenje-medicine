'use client';

import { useMemo, useState, useTransition } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { setChallengeTaskDone } from '@/app/actions/challenges';
import { Card, ProgressBar } from '@/components/ui';
import type { ChallengeTask } from '@/lib/types';

export function ChallengeTaskList({
  enrollmentId,
  tasks,
  initialCompletedIds,
}: {
  enrollmentId: string;
  tasks: ChallengeTask[];
  initialCompletedIds: string[];
}) {
  const [completed, setCompleted] = useState(new Set(initialCompletedIds));
  const [pending, startTransition] = useTransition();

  const percent = useMemo(
    () => (tasks.length > 0 ? (completed.size / tasks.length) * 100 : 0),
    [tasks.length, completed]
  );

  const toggle = (task: ChallengeTask) => {
    const done = !completed.has(task.id);
    startTransition(async () => {
      const res = await setChallengeTaskDone(enrollmentId, task.id, done);
      if (res.ok) {
        setCompleted((prev) => {
          const next = new Set(prev);
          if (done) next.add(task.id);
          else next.delete(task.id);
          return next;
        });
      }
    });
  };

  const byDay = useMemo(() => {
    const map = new Map<number, ChallengeTask[]>();
    for (const t of tasks) {
      const list = map.get(t.day_number) ?? [];
      list.push(t);
      map.set(t.day_number, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [tasks]);

  return (
    <div className="space-y-6">
      <ProgressBar percent={percent} label="Napredak kroz izazov" />
      {byDay.map(([day, dayTasks]) => (
        <div key={day}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">Dan {day}</h3>
          <Card className="divide-y divide-brand-50">
            {dayTasks.map((task) => {
              const done = completed.has(task.id);
              return (
                <div key={task.id} className="flex items-start gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggle(task)}
                    disabled={pending}
                    aria-label={done ? `Poništi: ${task.title}` : `Završi: ${task.title}`}
                    className="mt-0.5 text-brand-600 disabled:opacity-50"
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  <div>
                    <p className={`font-semibold ${done ? 'text-ink-muted line-through' : 'text-ink'}`}>
                      {task.title}
                    </p>
                    {task.description ? (
                      <p className="mt-0.5 text-sm text-ink-soft">{task.description}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}
