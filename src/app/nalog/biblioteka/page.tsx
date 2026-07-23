import { ButtonLink, Card, EmptyState, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { formatDate, productHref, PRODUCT_TYPE_LABELS } from '@/lib/utils';
import type { Entitlement, Product } from '@/lib/types';

export default async function LibraryPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from('entitlements')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  const entitlements = ((data as unknown as (Entitlement & { product: Product | null })[]) ?? []).filter(
    (e) => e.product
  ) as (Entitlement & { product: Product })[];

  return (
    <div>
      <h1 className="heading-2 mb-2">Moja biblioteka</h1>
      <p className="mb-8 text-ink-soft">Svi materijali koje poseduješ — pristup ne ističe.</p>

      {entitlements.length === 0 ? (
        <EmptyState
          title="Biblioteka je prazna"
          description="Kupljeni kursevi, e-knjige i skripte će se pojaviti ovde odmah nakon kupovine."
          action={<ButtonLink href="/e-knjige">Pogledaj e-knjige</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entitlements.map((e) => {
            const isReadable = e.product.type === 'ebook' || e.product.type === 'script';
            return (
              <Card key={e.id} className="flex flex-col p-5">
                <Badge tone="light" className="w-fit">
                  {PRODUCT_TYPE_LABELS[e.product.type]}
                </Badge>
                <h2 className="mt-2 font-bold text-ink">{e.product.title}</h2>
                <p className="mt-1 text-xs text-ink-muted">U biblioteci od {formatDate(e.created_at)}</p>
                <div className="mt-4 flex gap-2 pt-1">
                  <ButtonLink
                    href={isReadable ? `/nalog/biblioteka/${e.product.slug}` : productHref(e.product)}
                    size="sm"
                  >
                    {isReadable ? 'Čitaj' : 'Otvori'}
                  </ButtonLink>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
