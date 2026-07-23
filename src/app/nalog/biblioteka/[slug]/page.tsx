import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { Alert, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import type { DigitalFile, Product } from '@/lib/types';

interface Props {
  params: { slug: string };
}

/**
 * Protected in-browser reader. The iframe source is our own /api/files route,
 * which checks the entitlement and redirects to a short-lived signed URL.
 */
export default async function ReaderPage({ params }: Props) {
  const user = await requireUser();
  const supabase = createClient();

  const { data: productData } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();
  const product = productData as Product | null;
  if (!product) notFound();

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product.id)
    .is('revoked_at', null)
    .maybeSingle();
  if (!entitlement) notFound();

  const { data: fileData } = await supabase
    .from('digital_files')
    .select('*')
    .eq('product_id', product.id)
    .limit(1)
    .maybeSingle();
  const file = fileData as DigitalFile | null;

  return (
    <div>
      <Link
        href="/nalog/biblioteka"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Nazad na biblioteku
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading-2">{product.title}</h1>
        {file?.download_enabled ? (
          <a
            href={`/api/files/${file.id}?download=1`}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-blue px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Preuzmi PDF
          </a>
        ) : null}
      </div>

      {!file ? (
        <Alert tone="warning">
          PDF fajl za ovaj naslov još nije otpremljen. Ako misliš da je greška, javi nam se preko
          stranice Kontakt.
        </Alert>
      ) : (
        <Card className="overflow-hidden">
          <iframe
            src={`/api/files/${file.id}`}
            title={`Čitač: ${product.title}`}
            className="h-[75vh] w-full border-0"
          />
        </Card>
      )}

      <p className="mt-4 text-xs text-ink-muted">
        Materijal je licenciran za tvoju ličnu upotrebu i vezan za tvoj nalog. Deljenje nije
        dozvoljeno.
      </p>
    </div>
  );
}
