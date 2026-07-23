'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import {
  deleteChallengeTask,
  updateChallengeMeta,
  upsertChallengeTask,
} from '@/app/actions/admin';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import type { Challenge, ChallengeTask } from '@/lib/types';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function ChallengeEditor({
  challenge,
  tasks,
}: {
  challenge: Challenge;
  tasks: ChallengeTask[];
}) {
  const router = useRouter();
  const [meta, setMeta] = useState({
    status: challenge.status,
    startsAt: toLocalInput(challenge.starts_at),
    endsAt: toLocalInput(challenge.ends_at),
    enrollOpensAt: toLocalInput(challenge.enroll_opens_at),
    enrollClosesAt: toLocalInput(challenge.enroll_closes_at),
    maxParticipants: challenge.max_participants != null ? String(challenge.max_participants) : '',
  });
  const [newTask, setNewTask] = useState({ day: '1', title: '', description: '' });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-6">
        <h2 className="heading-3">Termini i status</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ch-status">Status</Label>
            <Select
              id="ch-status"
              value={meta.status}
              onChange={(e) => setMeta((m) => ({ ...m, status: e.target.value as Challenge['status'] }))}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Zakazan</option>
              <option value="active">Aktivan</option>
              <option value="completed">Završen</option>
              <option value="archived">Arhiviran</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="ch-max">Maks. učesnika (prazno = neograničeno)</Label>
            <Input
              id="ch-max"
              type="number"
              min={1}
              value={meta.maxParticipants}
              onChange={(e) => setMeta((m) => ({ ...m, maxParticipants: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ch-start">Početak</Label>
            <Input
              id="ch-start"
              type="datetime-local"
              value={meta.startsAt}
              onChange={(e) => setMeta((m) => ({ ...m, startsAt: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ch-end">Kraj</Label>
            <Input
              id="ch-end"
              type="datetime-local"
              value={meta.endsAt}
              onChange={(e) => setMeta((m) => ({ ...m, endsAt: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ch-eopen">Prijave od</Label>
            <Input
              id="ch-eopen"
              type="datetime-local"
              value={meta.enrollOpensAt}
              onChange={(e) => setMeta((m) => ({ ...m, enrollOpensAt: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ch-eclose">Prijave do</Label>
            <Input
              id="ch-eclose"
              type="datetime-local"
              value={meta.enrollClosesAt}
              onChange={(e) => setMeta((m) => ({ ...m, enrollClosesAt: e.target.value }))}
            />
          </div>
        </div>
        {status ? <Alert tone={status.ok ? 'success' : 'error'}>{status.text}</Alert> : null}
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await updateChallengeMeta(challenge.id, {
                status: meta.status,
                startsAt: fromLocalInput(meta.startsAt),
                endsAt: fromLocalInput(meta.endsAt),
                enrollOpensAt: fromLocalInput(meta.enrollOpensAt),
                enrollClosesAt: fromLocalInput(meta.enrollClosesAt),
                maxParticipants: meta.maxParticipants === '' ? null : Number(meta.maxParticipants),
              });
              setStatus({ ok: res.ok, text: res.ok ? 'Sačuvano.' : res.error });
              router.refresh();
            })
          }
        >
          {pending ? 'Čuvanje…' : 'Sačuvaj'}
        </Button>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="heading-3">Zadaci po danima</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-ink-soft">Još nema zadataka.</p>
        ) : (
          <ul className="space-y-2">
            {[...tasks]
              .sort((a, b) => a.day_number - b.day_number || a.position - b.position)
              .map((t) => (
                <li key={t.id} className="flex items-start gap-3 rounded-xl border border-brand-100 px-4 py-2.5">
                  <span className="mt-0.5 rounded-full bg-surface-blue px-2 py-0.5 text-xs font-bold text-brand-700">
                    Dan {t.day_number}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{t.title}</p>
                    {t.description ? <p className="text-xs text-ink-soft">{t.description}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600 hover:underline"
                    onClick={() => {
                      if (window.confirm(`Obrisati zadatak „${t.title}“?`)) {
                        startTransition(async () => {
                          await deleteChallengeTask(t.id);
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

        <div className="grid gap-3 rounded-xl border border-brand-200 bg-surface-subtle p-4 sm:grid-cols-[90px,1fr]">
          <div>
            <Label htmlFor="nt-day">Dan</Label>
            <Input
              id="nt-day"
              type="number"
              min={1}
              value={newTask.day}
              onChange={(e) => setNewTask((t) => ({ ...t, day: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="nt-title">Naziv zadatka</Label>
            <Input
              id="nt-title"
              value={newTask.title}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="nt-desc">Opis (opciono)</Label>
            <Textarea
              id="nt-desc"
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              size="sm"
              disabled={pending || !newTask.title.trim()}
              onClick={() =>
                startTransition(async () => {
                  await upsertChallengeTask({
                    challengeId: challenge.id,
                    dayNumber: Number(newTask.day) || 1,
                    title: newTask.title,
                    description: newTask.description || null,
                  });
                  setNewTask({ day: newTask.day, title: '', description: '' });
                  router.refresh();
                })
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj zadatak
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
