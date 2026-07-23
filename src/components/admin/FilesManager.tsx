'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import {
  deleteDigitalFile,
  setFileDownloadEnabled,
  setProductCover,
  uploadCoverImage,
  uploadDigitalFile,
} from '@/app/actions/admin';
import { Alert, Badge, Button, Card, Label, Select } from '@/components/ui';
import type { DigitalFile, Product } from '@/lib/types';

export interface FileRow extends DigitalFile {
  product: Pick<Product, 'title' | 'cover_url'> | null;
}

/**
 * Per-file cover image: uploads an image and sets it as the associated
 * product's cover (the picture shown on the site).
 */
function FileCover({ productId, coverUrl }: { productId: string; coverUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(coverUrl);
  const [busy, startBusy] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-brand-100 bg-surface-subtle">
        {url ? (
          <Image src={url} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] text-ink-muted">
            nema
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="text-xs"
          aria-label="Naslovna slika"
          onChange={() => {
            const file = inputRef.current?.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.set('file', file);
            startBusy(async () => {
              const up = await uploadCoverImage(fd);
              if (up.ok && up.data) {
                const res = await setProductCover(productId, up.data.url);
                if (res.ok) {
                  setUrl(up.data.url);
                  router.refresh();
                }
              }
            });
          }}
        />
        {busy ? <span className="text-xs text-ink-soft">Otpremanje…</span> : null}
        {url ? (
          <button
            type="button"
            className="self-start text-xs font-semibold text-red-600 hover:underline"
            onClick={() =>
              startBusy(async () => {
                const res = await setProductCover(productId, '');
                if (res.ok) {
                  setUrl(null);
                  router.refresh();
                }
              })
            }
          >
            Ukloni sliku
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function FilesManager({
  files,
  products,
}: {
  files: FileRow[];
  products: Pick<Product, 'id' | 'title'>[];
}) {
  const [productId, setProductId] = useState('');
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-6">
        <h2 className="heading-3">Otpremi zaštićeni PDF</h2>
        <p className="text-sm text-ink-soft">
          Fajl ide u privatni bucket i dostupan je isključivo kupcima kroz zaštićeni čitač
          (vremenski ograničeni potpisani linkovi).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="file-product">Proizvod</Label>
            <Select id="file-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">— izaberi proizvod —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={downloadEnabled}
                onChange={(e) => setDownloadEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-brand-300 text-brand-600"
              />
              Dozvoli i preuzimanje PDF-a
            </label>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="application/pdf" className="text-sm" aria-label="PDF fajl" />
        <Button
          disabled={pending || !productId}
          onClick={() => {
            const file = fileRef.current?.files?.[0];
            if (!file) {
              setMsg({ ok: false, text: 'Izaberi PDF fajl.' });
              return;
            }
            const fd = new FormData();
            fd.set('productId', productId);
            fd.set('file', file);
            if (downloadEnabled) fd.set('downloadEnabled', 'on');
            startTransition(async () => {
              const res = await uploadDigitalFile(fd);
              setMsg({ ok: res.ok, text: res.ok ? 'Fajl je otpremljen.' : (res.ok === false ? res.error : 'Greška.') });
              if (res.ok && fileRef.current) fileRef.current.value = '';
              router.refresh();
            });
          }}
        >
          {pending ? 'Otpremanje…' : 'Otpremi PDF'}
        </Button>
        {msg ? <Alert tone={msg.ok ? 'success' : 'error'}>{msg.text}</Alert> : null}
      </Card>

      <Card className="p-6">
        <h2 className="heading-3 mb-4">Postojeći fajlovi ({files.length})</h2>
        {files.length === 0 ? (
          <p className="text-sm text-ink-soft">Još nema otpremljenih fajlova.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li key={f.id} className="rounded-xl border border-brand-100 px-4 py-3">
                <div className="mb-3">
                  {f.product_id ? (
                    <>
                      <FileCover productId={f.product_id} coverUrl={f.product?.cover_url ?? null} />
                      <p className="mt-1 text-[11px] text-ink-muted">
                        Naslovna slika proizvoda — prikazuje se na sajtu.
                      </p>
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{f.file_name}</p>
                  <p className="text-xs text-ink-muted">
                    {f.product?.title ?? '—'}
                    {f.file_size_bytes ? ` · ${(f.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                  </p>
                </div>
                <Badge tone={f.download_enabled ? 'green' : 'gray'}>
                  {f.download_enabled ? 'Preuzimanje dozvoljeno' : 'Samo čitač'}
                </Badge>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand-700 hover:underline"
                  onClick={() =>
                    startTransition(async () => {
                      await setFileDownloadEnabled(f.id, !f.download_enabled);
                      router.refresh();
                    })
                  }
                >
                  {f.download_enabled ? 'Zabrani preuzimanje' : 'Dozvoli preuzimanje'}
                </button>
                <a
                  href={`/api/files/${f.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-ink-soft hover:underline"
                >
                  Pregledaj
                </a>
                <button
                  type="button"
                  className="text-sm font-semibold text-red-600 hover:underline"
                  onClick={() => {
                    if (window.confirm(`Trajno obrisati fajl „${f.file_name}“?`)) {
                      startTransition(async () => {
                        await deleteDigitalFile(f.id);
                        router.refresh();
                      });
                    }
                  }}
                >
                  Obriši
                </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
