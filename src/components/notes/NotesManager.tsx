'use client';

import { useMemo, useState, useTransition } from 'react';
import { Plus, Share2, Trash2 } from 'lucide-react';
import { createNote, deleteNote, updateNote } from '@/app/actions/notes';
import { Alert, Button, Card, EmptyState, Input, Textarea } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import type { Note, NoteComment, Profile } from '@/lib/types';

export interface NoteWithComments extends Note {
  note_comments: (NoteComment & { author: Pick<Profile, 'full_name' | 'role'> | null })[];
}

export function NotesManager({ initialNotes }: { initialNotes: NoteWithComments[] }) {
  const [notes, setNotes] = useState<NoteWithComments[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const patchSelected = (patch: Partial<Note>) => {
    if (!selected) return;
    setNotes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, ...patch } : n)));
  };

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createNote({ title: 'Nova beleška', content: '' });
      if (res.ok && res.data) {
        const created: NoteWithComments = { ...res.data, note_comments: [] };
        setNotes((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setStatus(null);
      } else if (!res.ok) {
        setStatus(res.error);
      }
    });
  };

  const handleSave = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await updateNote(selected.id, {
        title: selected.title,
        content: selected.content,
        category: selected.category,
        sharedWithMentor: selected.shared_with_mentor,
      });
      setStatus(res.ok ? 'Sačuvano.' : res.error);
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await deleteNote(selected.id);
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== selected.id));
        setSelectedId(null);
        setConfirmDelete(false);
      } else {
        setStatus(res.error);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <div>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Pretraži beleške…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Pretraga beležaka"
          />
          <Button onClick={handleCreate} disabled={pending} aria-label="Nova beleška">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-ink-muted">Nema beležaka.</p>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setSelectedId(n.id);
                  setStatus(null);
                  setConfirmDelete(false);
                }}
                className={`block w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${
                  n.id === selectedId
                    ? 'border-brand-500 bg-surface-blue'
                    : 'border-brand-100 bg-white hover:bg-surface-subtle'
                }`}
              >
                <p className="truncate text-sm font-bold text-ink">{n.title || 'Bez naslova'}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {formatDateTime(n.updated_at)}
                  {n.shared_with_mentor ? ' · podeljeno sa mentorom' : ''}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <Card className="p-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="note-title" className="sr-only">
                Naslov beleške
              </label>
              <Input
                id="note-title"
                value={selected.title}
                onChange={(e) => patchSelected({ title: e.target.value })}
                placeholder="Naslov beleške"
              />
            </div>
            <div>
              <label htmlFor="note-category" className="sr-only">
                Kategorija
              </label>
              <Input
                id="note-category"
                value={selected.category ?? ''}
                onChange={(e) => patchSelected({ category: e.target.value || null })}
                placeholder="Kategorija (npr. Anatomija, Ispit jun…)"
              />
            </div>
            <div>
              <label htmlFor="note-content" className="sr-only">
                Sadržaj beleške
              </label>
              <Textarea
                id="note-content"
                rows={12}
                value={selected.content}
                onChange={(e) => patchSelected({ content: e.target.value })}
                placeholder="Piši ovde…"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={selected.shared_with_mentor}
                onChange={(e) => patchSelected({ shared_with_mentor: e.target.checked })}
                className="h-4 w-4 rounded border-brand-300 text-brand-600"
              />
              <Share2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Podeli sa mentorom (mentor može da čita i komentariše)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSave} disabled={pending}>
                {pending ? 'Čuvanje…' : 'Sačuvaj'}
              </Button>
              {confirmDelete ? (
                <>
                  <Button variant="danger" onClick={handleDelete} disabled={pending}>
                    Potvrdi brisanje
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Odustani
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Obriši
                </Button>
              )}
              {status ? (
                <p role="status" className="text-sm font-medium text-ink-soft">
                  {status}
                </p>
              ) : null}
            </div>

            {selected.note_comments.length > 0 ? (
              <div className="border-t border-brand-100 pt-4">
                <h3 className="mb-3 text-sm font-bold text-ink">Komentari mentora</h3>
                <div className="space-y-3">
                  {selected.note_comments.map((c) => (
                    <Alert key={c.id} tone="info">
                      <p className="font-semibold">{c.author?.full_name ?? 'Mentor'}</p>
                      <p className="mt-1">{c.content}</p>
                      <p className="mt-1 text-xs opacity-70">{formatDateTime(c.created_at)}</p>
                    </Alert>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : (
        <EmptyState
          title="Izaberi ili kreiraj belešku"
          description="Beleške su privatne dok ih ne podeliš sa mentorom."
          action={
            <Button onClick={handleCreate} disabled={pending}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Nova beleška
            </Button>
          }
        />
      )}
    </div>
  );
}
