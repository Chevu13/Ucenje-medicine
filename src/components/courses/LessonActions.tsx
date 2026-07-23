'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { setLessonComplete } from '@/app/actions/learning';
import { saveLessonNote } from '@/app/actions/notes';
import { Button, Textarea } from '@/components/ui';

export function MarkCompleteButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={completed ? 'secondary' : 'primary'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !completed;
          const res = await setLessonComplete(lessonId, next);
          if (res.ok) setCompleted(next);
        })
      }
    >
      {completed ? (
        <>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Završeno — poništi
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" aria-hidden="true" /> Označi kao završeno
        </>
      )}
    </Button>
  );
}

export function LessonNote({
  lessonId,
  courseId,
  initialContent,
}: {
  lessonId: string;
  courseId: string | null;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <label htmlFor="lesson-note" className="mb-1.5 block text-sm font-semibold text-ink">
        Tvoja beleška uz ovu lekciju
      </label>
      <Textarea
        id="lesson-note"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setStatus(null);
        }}
        placeholder="Zapiši ključne stvari iz lekcije…"
        rows={5}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await saveLessonNote(lessonId, courseId, content);
              setStatus(res.ok ? 'Sačuvano.' : ('error' in res ? res.error : 'Greška.'));
            })
          }
        >
          {pending ? 'Čuvanje…' : 'Sačuvaj belešku'}
        </Button>
        {status ? (
          <p role="status" className="text-sm font-medium text-ink-soft">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
