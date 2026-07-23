'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  deleteAnnouncement,
  deleteFaq,
  deleteTestimonial,
  saveSetting,
  upsertAnnouncement,
  upsertFaq,
  upsertTestimonial,
  uploadCoverImage,
} from '@/app/actions/admin';
import { Alert, Badge, Button, Card, Input, Label, Textarea } from '@/components/ui';
import type {
  AboutSettings,
  MentorshipHighlightSettings,
  Announcement,
  ContactSettings,
  Faq,
  HeroSettings,
  Testimonial,
} from '@/lib/types';

function useSave() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      setMsg({ ok: res.ok, text: res.ok ? 'Sačuvano.' : (res.error ?? 'Greška.') });
      router.refresh();
    });
  return { msg, pending, run };
}

// ---------------------------------------------------------------------------
export function HeroEditor({ initial }: { initial: HeroSettings }) {
  const [form, setForm] = useState(initial);
  const { msg, pending, run } = useSave();
  const [uploading, startUpload] = useTransition();

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Hero sekcija (početna strana)</h2>
      <div>
        <Label htmlFor="hero-title">Naslov</Label>
        <Input id="hero-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="hero-sub">Podnaslov</Label>
        <Textarea
          id="hero-sub"
          rows={2}
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="hero-cta1">Glavno dugme — tekst</Label>
          <Input
            id="hero-cta1"
            value={form.cta_primary_label}
            onChange={(e) => setForm({ ...form, cta_primary_label: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="hero-cta1h">Glavno dugme — link</Label>
          <Input
            id="hero-cta1h"
            value={form.cta_primary_href}
            onChange={(e) => setForm({ ...form, cta_primary_href: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="hero-cta2">Drugo dugme — tekst</Label>
          <Input
            id="hero-cta2"
            value={form.cta_secondary_label}
            onChange={(e) => setForm({ ...form, cta_secondary_label: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="hero-cta2h">Drugo dugme — link</Label>
          <Input
            id="hero-cta2h"
            value={form.cta_secondary_href}
            onChange={(e) => setForm({ ...form, cta_secondary_href: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="hero-img">Hero fotografija (Darkova slika)</Label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="hero-img"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set('file', file);
              startUpload(async () => {
                const res = await uploadCoverImage(fd);
                if (res.ok && res.data) setForm((f) => ({ ...f, image_url: res.data!.url }));
              });
            }}
          />
          {uploading ? <span className="text-sm text-ink-soft">Otpremanje…</span> : null}
        </div>
        {form.image_url ? (
          <p className="mt-1 break-all text-xs text-ink-muted">{form.image_url}</p>
        ) : (
          <p className="mt-1 text-xs text-ink-muted">Bez slike se prikazuje brendirani placeholder.</p>
        )}
      </div>
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
      <Button disabled={pending} onClick={() => run(() => saveSetting('hero', { ...form }))}>
        Sačuvaj hero
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function AboutEditor({ initial }: { initial: AboutSettings }) {
  const [form, setForm] = useState(initial);
  const { msg, pending, run } = useSave();
  const [uploading, startUpload] = useTransition();

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Sekcija „O Darku“</h2>
      <div>
        <Label htmlFor="about-headline">Naslov</Label>
        <Input
          id="about-headline"
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="about-body">Tekst (pasusi odvojeni praznim redom)</Label>
        <Textarea
          id="about-body"
          rows={7}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="about-img">Darkova fotografija</Label>
        <p className="mb-1 text-xs text-ink-muted">
          Koristi se u sekciji „O Darku“ i u bloku „Mentorstvo sa Darkom“ na početnoj strani.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="about-img"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set('file', file);
              startUpload(async () => {
                const res = await uploadCoverImage(fd);
                if (res.ok && res.data) setForm((f) => ({ ...f, image_url: res.data!.url }));
              });
            }}
          />
          {uploading ? <span className="text-sm text-ink-soft">Otpremanje…</span> : null}
        </div>
        {form.image_url ? (
          <p className="mt-1 break-all text-xs text-ink-muted">{form.image_url}</p>
        ) : (
          <p className="mt-1 text-xs text-ink-muted">Bez slike se prikazuje brendirani placeholder.</p>
        )}
      </div>
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
      <Button disabled={pending} onClick={() => run(() => saveSetting('about', { ...form }))}>
        Sačuvaj
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function MentorshipHighlightEditor({
  initial,
}: {
  initial: MentorshipHighlightSettings;
}) {
  const [form, setForm] = useState(initial);
  const { msg, pending, run } = useSave();
  const [uploading, startUpload] = useTransition();

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Blok „Mentorstvo sa Darkom“ (početna)</h2>
      <div>
        <Label htmlFor="mentorship-img">Fotografija za mentorstvo blok</Label>
        <p className="mb-1 text-xs text-ink-muted">
          Zasebna slika za blok „Mentorstvo sa Darkom“. Ako je ostaviš praznu, koristi se
          Darkova fotografija iz sekcije „O Darku“.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="mentorship-img"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set('file', file);
              startUpload(async () => {
                const res = await uploadCoverImage(fd);
                if (res.ok && res.data) setForm((f) => ({ ...f, image_url: res.data!.url }));
              });
            }}
          />
          {uploading ? <span className="text-sm text-ink-soft">Otpremanje…</span> : null}
        </div>
        {form.image_url ? (
          <p className="mt-1 break-all text-xs text-ink-muted">{form.image_url}</p>
        ) : (
          <p className="mt-1 text-xs text-ink-muted">Prazno = koristi sliku iz „O Darku“.</p>
        )}
      </div>
      {form.image_url ? (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => setForm({ ...form, image_url: '' })}
        >
          Ukloni sliku
        </Button>
      ) : null}
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
      <Button
        disabled={pending}
        onClick={() => run(() => saveSetting('mentorship_highlight', { ...form }))}
      >
        Sačuvaj
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function ContactEditor({ initial }: { initial: ContactSettings }) {
  const [form, setForm] = useState(initial);
  const { msg, pending, run } = useSave();

  const fields: { key: keyof ContactSettings; label: string }[] = [
    { key: 'email', label: 'Kontakt email' },
    { key: 'instagram', label: 'Instagram (brend)' },
    { key: 'instagram_personal', label: 'Instagram (lični)' },
    { key: 'youtube', label: 'YouTube kanal' },
    { key: 'tiktok', label: 'TikTok' },
  ];

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Kontakt i društvene mreže</h2>
      {fields.map((f) => (
        <div key={f.key}>
          <Label htmlFor={`contact-${f.key}`}>{f.label}</Label>
          <Input
            id={`contact-${f.key}`}
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        </div>
      ))}
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
      <Button disabled={pending} onClick={() => run(() => saveSetting('contact', { ...form }))}>
        Sačuvaj
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function AnnouncementsEditor({ announcements }: { announcements: Announcement[] }) {
  const [form, setForm] = useState({ message: '', href: '', active: true });
  const { msg, pending, run } = useSave();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Najave (traka na vrhu sajta)</h2>
      {announcements.length === 0 ? (
        <p className="text-sm text-ink-soft">Nema najava.</p>
      ) : (
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl border border-brand-100 px-4 py-2.5">
              <span className="flex-1 text-sm text-ink">{a.message}</span>
              {a.active ? <Badge tone="green">Aktivna</Badge> : <Badge tone="gray">Neaktivna</Badge>}
              <button
                type="button"
                className="text-sm font-semibold text-brand-700 hover:underline"
                onClick={() => run(() => upsertAnnouncement({ message: a.message, href: a.href, active: !a.active }, a.id))}
              >
                {a.active ? 'Isključi' : 'Aktiviraj'}
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-red-600 hover:underline"
                onClick={() => {
                  if (window.confirm('Obrisati najavu?')) {
                    startTransition(async () => {
                      await deleteAnnouncement(a.id);
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
          <Label htmlFor="ann-msg">Nova najava</Label>
          <Input
            id="ann-msg"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Npr: Prijave za izazov su otvorene!"
          />
        </div>
        <div>
          <Label htmlFor="ann-href">Link (opciono)</Label>
          <Input
            id="ann-href"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            placeholder="/izazovi"
          />
        </div>
        <Button
          size="sm"
          disabled={pending || !form.message.trim()}
          onClick={() =>
            run(() => upsertAnnouncement({ message: form.message, href: form.href || null, active: form.active }))
          }
        >
          Dodaj i aktiviraj
        </Button>
      </div>
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function FaqEditor({ faqs }: { faqs: Faq[] }) {
  const [form, setForm] = useState({ question: '', answer: '', category: 'opste' });
  const { msg, pending, run } = useSave();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Česta pitanja</h2>
      <ul className="space-y-2">
        {faqs.map((f) => (
          <li key={f.id} className="flex items-start gap-3 rounded-xl border border-brand-100 px-4 py-2.5">
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{f.question}</p>
              <p className="text-xs text-ink-soft">{f.answer}</p>
            </div>
            {!f.published ? <Badge tone="gray">Skriveno</Badge> : null}
            <button
              type="button"
              className="text-sm font-semibold text-brand-700 hover:underline"
              onClick={() =>
                run(() =>
                  upsertFaq(
                    { question: f.question, answer: f.answer, category: f.category, position: f.position, published: !f.published },
                    f.id
                  )
                )
              }
            >
              {f.published ? 'Sakrij' : 'Objavi'}
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-red-600 hover:underline"
              onClick={() => {
                if (window.confirm('Obrisati pitanje?')) {
                  startTransition(async () => {
                    await deleteFaq(f.id);
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
      <div className="space-y-3 rounded-xl border border-brand-200 bg-surface-subtle p-4">
        <div>
          <Label htmlFor="faq-q">Novo pitanje</Label>
          <Input id="faq-q" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="faq-a">Odgovor</Label>
          <Textarea id="faq-a" rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        </div>
        <Button
          size="sm"
          disabled={pending || !form.question.trim() || !form.answer.trim()}
          onClick={() =>
            run(() =>
              upsertFaq({ question: form.question, answer: form.answer, category: form.category, position: faqs.length + 1, published: true })
            )
          }
        >
          Dodaj pitanje
        </Button>
      </div>
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function TestimonialsEditor({ testimonials }: { testimonials: Testimonial[] }) {
  const [form, setForm] = useState({ name: '', role: '', content: '' });
  const { msg, pending, run } = useSave();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Card className="space-y-4 p-6">
      <h2 className="heading-3">Utisci studenata</h2>
      <ul className="space-y-2">
        {testimonials.map((t) => (
          <li key={t.id} className="flex items-start gap-3 rounded-xl border border-brand-100 px-4 py-2.5">
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">
                {t.name}
                {t.role ? <span className="font-normal text-ink-muted"> · {t.role}</span> : null}
              </p>
              <p className="text-xs text-ink-soft">{t.content}</p>
            </div>
            {t.is_demo ? <Badge tone="amber">Demo</Badge> : null}
            {!t.published ? <Badge tone="gray">Skriveno</Badge> : null}
            <button
              type="button"
              className="text-sm font-semibold text-brand-700 hover:underline"
              onClick={() =>
                run(() => upsertTestimonial({ name: t.name, role: t.role, content: t.content, published: !t.published }, t.id))
              }
            >
              {t.published ? 'Sakrij' : 'Objavi'}
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-red-600 hover:underline"
              onClick={() => {
                if (window.confirm('Obrisati utisak?')) {
                  startTransition(async () => {
                    await deleteTestimonial(t.id);
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
      <div className="space-y-3 rounded-xl border border-brand-200 bg-surface-subtle p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="t-name">Ime</Label>
            <Input id="t-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="t-role">Uloga (npr. Student 3. godine)</Label>
            <Input id="t-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="t-content">Utisak</Label>
          <Textarea id="t-content" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <Button
          size="sm"
          disabled={pending || !form.name.trim() || !form.content.trim()}
          onClick={() =>
            run(() => upsertTestimonial({ name: form.name, role: form.role || null, content: form.content, published: true }))
          }
        >
          Dodaj utisak
        </Button>
      </div>
      {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
    </Card>
  );
}
