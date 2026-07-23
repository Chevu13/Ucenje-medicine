import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

interface Props {
  params: { id: string };
}

export default async function AdminProductEditPage({ params }: Props) {
  await requireAdmin();

  let product: Product | null = null;
  if (params.id !== 'novi') {
    const admin = createAdminClient();
    const { data } = await admin.from('products').select('*').eq('id', params.id).maybeSingle();
    if (!data) notFound();
    product = data as Product;
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/proizvodi"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Svi proizvodi
      </Link>
      <h1 className="heading-2 mb-6">{product ? `Uredi: ${product.title}` : 'Novi proizvod'}</h1>
      {product?.type === 'course' ? (
        <p className="mb-5 text-sm text-ink-soft">
          Module i lekcije ovog kursa uređuješ u sekciji{' '}
          <Link href={`/admin/kursevi/${product.id}`} className="font-semibold text-brand-700 underline">
            Kursevi → Kurikulum
          </Link>
          .
        </p>
      ) : null}
      <ProductForm product={product} />
    </div>
  );
}
