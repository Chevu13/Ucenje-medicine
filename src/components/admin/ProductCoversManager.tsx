'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { setProductCover, uploadCoverImage } from '@/app/actions/admin';
import { Card } from '@/components/ui';
import type { Product } from '@/lib/types';

export type CoverRow = Pick<Product, 'id' | 'title' | 'type' | 'cover_url'>;

const TYPE_LABEL: Record<string, string> = {
  course: 'Kurs',
  ebook: 'E-knjiga',
  script: 'Skripta',
  mentorship: 'Mentorstvo',
  challenge: 'Izazov',
};

function CoverItem({ product }: { product: CoverRow }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(product.cover_url);
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  const router = useRouter();

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-100 px-4 py-3">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-brand-100 bg-surface-subtle">
        {url ? (
          <Image src={url} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] text-ink-muted">
            nema slike
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{product.title}</p>
        <p className="text-xs text-ink-muted">{TYPE_LABEL[product.type] ?? product.type}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 text-xs"
          aria-label={`Slika za ${product.title}`}
          onChange={() => {
            const file = inputRef.current?.files?.[0];
            if (!file) return;
            setError(null);
            const fd = new FormData();
            fd.set('file', file);
            startBusy(async () => {
              const up = await uploadCoverImage(fd);
              if (!up.ok || !up.data) {
                setError(up.ok ? 'Otpremanje nije uspelo.' : up.error);
                return;
              }
              const res = await setProductCover(product.id, up.data.url);
              if (!res.ok) {
                setError(res.error);
                return;
              }
              setUrl(up.data.url);
              router.refresh();
            });
          }}
        />
        {busy ? <p className="mt-1 text-xs text-ink-soft">Otpremanje…</p> : null}
        {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
      </div>

      {url ? (
        <button
          type="button"
          disabled={busy}
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
          onClick={() =>
            startBusy(async () => {
              const res = await setProductCover(product.id, '');
              if (res.ok) {
                setUrl(null);
                router.refresh();
              } else setError(res.error);
            })
          }
        >
          Ukloni sliku
        </button>
      ) : null}
    </li>
  );
}

/**
 * Cover images for every product — these are the pictures shown on the public
 * site (listings and product pages). Independent of whether a PDF exists.
 */
export function ProductCoversManager({ products }: { products: CoverRow[] }) {
  return (
    <Card className="p-6">
      <h2 className="heading-3">Slike proizvoda</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Slika koja se prikazuje na sajtu — u listama i na stranici proizvoda. Ako je nema,
        prikazuje se brendirani plavi placeholder sa EKG linijom.
      </p>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nema proizvoda.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {products.map((p) => (
            <CoverItem key={p.id} product={p} />
          ))}
        </ul>
      )}
    </Card>
  );
}
