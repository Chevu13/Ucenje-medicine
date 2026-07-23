'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { deleteProduct, upsertProduct, uploadCoverImage } from '@/app/actions/admin';
import { Alert, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { slugify } from '@/lib/utils';
import type { Product } from '@/lib/types';
import type { ProductInput } from '@/lib/validation';

export function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    type: product?.type ?? 'ebook',
    title: product?.title ?? '',
    slug: product?.slug ?? '',
    shortDescription: product?.short_description ?? '',
    description: product?.description ?? '',
    coverUrl: product?.cover_url ?? '',
    priceRsd: product?.price_cents != null ? String(Math.round(product.price_cents / 100)) : '',
    salePriceRsd:
      product?.sale_price_cents != null ? String(Math.round(product.sale_price_cents / 100)) : '',
    isFree: product?.is_free ?? false,
    status: product?.status ?? 'draft',
    featured: product?.featured ?? false,
    authorName: product?.author_name ?? '',
    pageCount: product?.page_count != null ? String(product.page_count) : '',
    seoTitle: product?.seo_title ?? '',
    seoDescription: product?.seo_description ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setError(null);
    const input: ProductInput = {
      type: form.type as ProductInput['type'],
      title: form.title,
      slug: form.slug || slugify(form.title),
      shortDescription: form.shortDescription || null,
      description: form.description || null,
      coverUrl: form.coverUrl || null,
      priceRsd: form.priceRsd === '' ? null : Number(form.priceRsd),
      salePriceRsd: form.salePriceRsd === '' ? null : Number(form.salePriceRsd),
      isFree: form.isFree,
      status: form.status as ProductInput['status'],
      featured: form.featured,
      authorName: form.authorName || null,
      pageCount: form.pageCount === '' ? null : Number(form.pageCount),
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    };
    startTransition(async () => {
      const res = await upsertProduct(input, product?.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      if (!product && res.data) router.replace(`/admin/proizvodi/${res.data.id}`);
      router.refresh();
    });
  };

  const handleCoverUpload = (file: File) => {
    const fd = new FormData();
    fd.set('file', file);
    startTransition(async () => {
      const res = await uploadCoverImage(fd);
      if (res.ok && res.data) set('coverUrl', res.data.url);
      else if (!res.ok) setError(res.error);
    });
  };

  const handleDelete = () => {
    if (!product) return;
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (!res.ok) {
        setError(res.error);
        setConfirmDelete(false);
        return;
      }
      router.replace('/admin/proizvodi');
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-type">Tip proizvoda</Label>
            <Select
              id="p-type"
              value={form.type}
              disabled={Boolean(product)}
              onChange={(e) => set('type', e.target.value as Product['type'])}
            >
              <option value="course">Kurs</option>
              <option value="ebook">E-knjiga</option>
              <option value="script">Skripta</option>
              <option value="mentorship">Mentorstvo</option>
              <option value="challenge">Izazov</option>
            </Select>
            {product ? (
              <p className="mt-1 text-xs text-ink-muted">Tip se ne menja nakon kreiranja.</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="p-status">Status</Label>
            <Select
              id="p-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as Product['status'])}
            >
              <option value="draft">Draft (nije vidljivo)</option>
              <option value="published">Objavljeno</option>
              <option value="archived">Arhivirano</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="p-title">Naziv</Label>
          <Input
            id="p-title"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: product ? f.slug : slugify(title),
              }));
              setSaved(false);
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="p-slug">Slug (URL)</Label>
          <Input
            id="p-slug"
            value={form.slug}
            onChange={(e) => set('slug', slugify(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="p-short">Kratak opis (kartice, listing)</Label>
          <Textarea
            id="p-short"
            rows={2}
            maxLength={300}
            value={form.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="p-desc">Pun opis (pasusi odvojeni praznim redom)</Label>
          <Textarea
            id="p-desc"
            rows={7}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="heading-3">Cena</h2>
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => set('isFree', e.target.checked)}
            className="h-4 w-4 rounded border-brand-300 text-brand-600"
          />
          Besplatan sadržaj
        </label>
        {!form.isFree ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-price">Cena (RSD) — prazno = „Cena uskoro“</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                value={form.priceRsd}
                onChange={(e) => set('priceRsd', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="p-sale">Akcijska cena (RSD, opciono)</Label>
              <Input
                id="p-sale"
                type="number"
                min={0}
                value={form.salePriceRsd}
                onChange={(e) => set('salePriceRsd', e.target.value)}
              />
            </div>
          </div>
        ) : null}
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="h-4 w-4 rounded border-brand-300 text-brand-600"
          />
          Prikaži u „Izdvojeno“ na početnoj strani
        </label>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="heading-3">Naslovna slika</h2>
        {form.coverUrl ? (
          <div className="relative aspect-[16/10] w-full max-w-sm overflow-hidden rounded-xl">
            <Image src={form.coverUrl} alt="Naslovna slika" fill sizes="380px" className="object-cover" />
          </div>
        ) : (
          <p className="text-sm text-ink-soft">
            Nema slike — prikazuje se brendirani plavi placeholder sa EKG linijom.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
          />
          <Button variant="secondary" disabled={pending} onClick={() => fileRef.current?.click()}>
            Otpremi sliku
          </Button>
          {form.coverUrl ? (
            <Button variant="ghost" onClick={() => set('coverUrl', '')}>
              Ukloni sliku
            </Button>
          ) : null}
        </div>
        <div>
          <Label htmlFor="p-author">Autor</Label>
          <Input id="p-author" value={form.authorName} onChange={(e) => set('authorName', e.target.value)} />
        </div>
        <div className="max-w-40">
          <Label htmlFor="p-pages">Broj strana (e-knjige/skripte)</Label>
          <Input
            id="p-pages"
            type="number"
            min={0}
            value={form.pageCount}
            onChange={(e) => set('pageCount', e.target.value)}
          />
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="heading-3">SEO</h2>
        <div>
          <Label htmlFor="p-seo-title">SEO naslov (opciono)</Label>
          <Input id="p-seo-title" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="p-seo-desc">SEO opis (opciono)</Label>
          <Textarea
            id="p-seo-desc"
            rows={2}
            maxLength={300}
            value={form.seoDescription}
            onChange={(e) => set('seoDescription', e.target.value)}
          />
        </div>
      </Card>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {saved ? <Alert tone="success">Sačuvano.</Alert> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={pending} onClick={handleSave}>
          {pending ? 'Čuvanje…' : product ? 'Sačuvaj izmene' : 'Kreiraj proizvod'}
        </Button>
        {product ? (
          confirmDelete ? (
            <>
              <Button variant="danger" disabled={pending} onClick={handleDelete}>
                Potvrdi trajno brisanje
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Odustani
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(true)}>
              Obriši proizvod
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}
