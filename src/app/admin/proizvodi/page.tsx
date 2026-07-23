import Link from 'next/link';
import { Badge, ButtonLink, Card, EmptyState } from '@/components/ui';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice, PRODUCT_TYPE_LABELS } from '@/lib/utils';
import type { Product, ProductType } from '@/lib/types';

const STATUS_TONE = { published: 'green', draft: 'amber', archived: 'gray' } as const;
const STATUS_LABEL = { published: 'Objavljeno', draft: 'Draft', archived: 'Arhivirano' } as const;

interface Props {
  searchParams: { tip?: string };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdmin();
  const admin = createAdminClient();

  const types: ProductType[] = ['course', 'ebook', 'script', 'mentorship', 'challenge'];
  const filter = types.includes(searchParams.tip as ProductType) ? (searchParams.tip as ProductType) : null;

  let query = admin.from('products').select('*').order('position').order('created_at');
  if (filter) query = query.eq('type', filter);
  const { data } = await query;
  const products = (data as Product[] | null) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading-2">Proizvodi</h1>
        <ButtonLink href="/admin/proizvodi/novi">+ Novi proizvod</ButtonLink>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/admin/proizvodi"
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${!filter ? 'bg-brand-600 text-white' : 'bg-white text-ink-soft hover:bg-brand-50'}`}
        >
          Sve
        </Link>
        {types.map((t) => (
          <Link
            key={t}
            href={`/admin/proizvodi?tip=${t}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${filter === t ? 'bg-brand-600 text-white' : 'bg-white text-ink-soft hover:bg-brand-50'}`}
          >
            {PRODUCT_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState title="Nema proizvoda" action={<ButtonLink href="/admin/proizvodi/novi">Dodaj prvi</ButtonLink>} />
      ) : (
        <Card className="divide-y divide-brand-50">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/admin/proizvodi/${p.id}`}
              className="flex flex-wrap items-center gap-3 p-4 hover:bg-surface-subtle"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{p.title}</p>
                <p className="text-xs text-ink-muted">/{p.slug}</p>
              </div>
              <Badge tone="light">{PRODUCT_TYPE_LABELS[p.type]}</Badge>
              {p.featured ? <Badge tone="blue">Izdvojeno</Badge> : null}
              {p.is_demo ? <Badge tone="amber">Demo</Badge> : null}
              <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
              <span className="w-28 text-right text-sm font-semibold text-ink">
                {p.is_free ? 'Besplatno' : formatPrice(p.price_cents, p.currency)}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
