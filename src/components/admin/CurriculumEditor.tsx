'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  createModule,
  deleteLesson,
  deleteModule,
  updateModule,
  upsertLesson,
} from '@/app/actions/admin';
import { Alert, Button, Card, Input, Label, Textarea } from '@/components/ui';
import { slugify } from '@/lib/utils';
import type { CourseLesson, ModuleWithLessons } from '@/lib/types';

function LessonEditor({
  moduleId,
  lesson,
  onDone,
}: {
  moduleId: string;
  lesson: CourseLesson | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    title: lesson?.title ?? '',
    slug: lesson?.slug ?? '',
    summary: lesson?.summary ?? '',
    youtubeUrl: lesson?.youtube_url ?? '',
    durationMinutes: lesson?.duration_minutes != null ? String(lesson.duration_minutes) : '',
    isFreePreview: lesson?.is_free_preview ?? false,
    position: lesson?.position ?? 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-surface-subtle p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`l-title-${lesson?.id ?? 'new'}`}>Naziv lekcije</Label>
          <Input
            id={`l-title-${lesson?.id ?? 'new'}`}
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                title: e.target.value,
                slug: lesson ? f.slug : slugify(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor={`l-slug-${lesson?.id ?? 'new'}`}>Slug</Label>
          <Input
            id={`l-slug-${lesson?.id ?? 'new'}`}
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`l-yt-${lesson?.id ?? 'new'}`}>YouTube link</Label>
        <Input
          id={`l-yt-${lesson?.id ?? 'new'}`}
          placeholder="https://www.youtube.com/watch?v=…"
          value={form.youtubeUrl}
          onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor={`l-sum-${lesson?.id ?? 'new'}`}>Kratak rezime (opciono)</Label>
        <Textarea
          id={`l-sum-${lesson?.id ?? 'new'}`}
          rows={2}
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
        />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-28">
          <Label htmlFor={`l-dur-${lesson?.id ?? 'new'}`}>Minuta</Label>
          <Input
            id={`l-dur-${lesson?.id ?? 'new'}`}
            type="number"
            min={0}
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
          />
        </div>
        <div className="w-28">
          <Label htmlFor={`l-pos-${lesson?.id ?? 'new'}`}>Redosled</Label>
          <Input
            id={`l-pos-${lesson?.id ?? 'new'}`}
            type="number"
            min={0}
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={form.isFreePreview}
            onChange={(e) => setForm((f) => ({ ...f, isFreePreview: e.target.checked }))}
            className="h-4 w-4 rounded border-brand-300 text-brand-600"
          />
          Besplatan pregled
        </label>
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await upsertLesson(
                {
                  moduleId,
                  title: form.title,
                  slug: form.slug || slugify(form.title),
                  summary: form.summary || null,
                  youtubeUrl: form.youtubeUrl || null,
                  durationMinutes: form.durationMinutes === '' ? null : Number(form.durationMinutes),
                  isFreePreview: form.isFreePreview,
                  position: form.position,
                },
                lesson?.id
              );
              if (!res.ok) setError(res.error);
              else {
                onDone();
                router.refresh();
              }
            });
          }}
        >
          {pending ? 'Čuvanje…' : 'Sačuvaj lekciju'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Zatvori
        </Button>
      </div>
    </div>
  );
}

function ModuleBlock({ module: mod }: { module: ModuleWithLessons }) {
  const [title, setTitle] = useState(mod.title);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const lessons = [...mod.course_lessons].sort((a, b) => a.position - b.position);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label={`Naziv modula ${mod.title}`}
          className="max-w-sm"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateModule(mod.id, title, mod.position);
              router.refresh();
            })
          }
        >
          Sačuvaj naziv
        </Button>
        {confirmDelete ? (
          <>
            <Button
              size="sm"
              variant="danger"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteModule(mod.id);
                  router.refresh();
                })
              }
            >
              Obriši modul + lekcije
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Odustani
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            {editingLesson === lesson.id ? (
              <LessonEditor moduleId={mod.id} lesson={lesson} onDone={() => setEditingLesson(null)} />
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-brand-100 px-4 py-2.5">
                <span className="flex-1 text-sm font-semibold text-ink">
                  {lesson.position}. {lesson.title}
                  {lesson.is_free_preview ? (
                    <span className="ml-2 text-xs font-bold text-emerald-600">besplatna</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  className="text-sm font-bold text-brand-700 hover:underline"
                  onClick={() => setEditingLesson(lesson.id)}
                >
                  Uredi
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-red-600 hover:underline"
                  onClick={() => {
                    if (window.confirm(`Obrisati lekciju „${lesson.title}“?`)) {
                      startTransition(async () => {
                        await deleteLesson(lesson.id);
                        router.refresh();
                      });
                    }
                  }}
                >
                  Obriši
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {addingLesson ? (
        <div className="mt-3">
          <LessonEditor moduleId={mod.id} lesson={null} onDone={() => setAddingLesson(false)} />
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="mt-3" onClick={() => setAddingLesson(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj lekciju
        </Button>
      )}
    </Card>
  );
}

export function CurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: ModuleWithLessons[];
}) {
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-5">
      {modules
        .sort((a, b) => a.position - b.position)
        .map((mod) => (
          <ModuleBlock key={mod.id} module={mod} />
        ))}

      <Card className="flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-60 flex-1">
          <Label htmlFor="new-module">Novi modul</Label>
          <Input
            id="new-module"
            placeholder="Npr: Uvod"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
          />
        </div>
        <Button
          disabled={pending || !newModuleTitle.trim()}
          onClick={() =>
            startTransition(async () => {
              await createModule(courseId, newModuleTitle, modules.length + 1);
              setNewModuleTitle('');
              router.refresh();
            })
          }
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj modul
        </Button>
      </Card>
    </div>
  );
}
