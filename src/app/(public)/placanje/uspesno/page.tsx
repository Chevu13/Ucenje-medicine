import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { Alert, ButtonLink, Card } from '@/components/ui';
import { ClearCart } from '@/components/checkout/ClearCart';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/types';

export const metadata: Metadata = { title: 'Porudžbina poslata', robots: { index: false } };

interface Props {
  searchParams: { order?: string };
}

/** Guest order confirmation: no payment happened yet, no account needed. */
export default async function OrderSubmittedPage({ searchParams }: Props) {
  type OrderWithItems = Order & { order_items: OrderItem[] };
  let order: OrderWithItems | null = null;
  if (searchParams.order) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('orders')
      .select('id, total_cents, currency, order_items(id, title_snapshot, unit_price_cents)')
      .eq('id', searchParams.order)
      .maybeSingle();
    order = (data as unknown as OrderWithItems | null) ?? null;
  }

  return (
    <div className="container-page max-w-lg py-20 text-center">
      <ClearCart />
      <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-emerald-500" aria-hidden="true" />
      <h1 className="heading-1">Porudžbina je poslata 🎉</h1>
      <p className="mt-4 text-ink-soft">
        Javićemo ti se uskoro na mejl ili Instagram sa uputstvima za uplatu. Čim uplata bude
        potvrđena, materijale ti šaljemo lično.
      </p>

      {order ? (
        <Card className="mt-8 p-6 text-left">
          <ul className="space-y-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-ink">{item.title_snapshot}</span>
                <span className="font-semibold text-ink">
                  {formatPrice(item.unit_price_cents, order!.currency)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-brand-100 pt-3 text-right font-extrabold text-ink">
            Ukupno: {formatPrice(order.total_cents, order.currency)}
          </p>
        </Card>
      ) : null}

      <Alert tone="info" className="mt-6 text-left">
        Možeš i sam(a) da nam se javiš — piši na Instagram „ucenje_medicine“ i navedi šta si
        poručio/la.
      </Alert>

      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Nazad na početnu
        </ButtonLink>
        <ButtonLink href="/skripte" variant="secondary" size="lg">
          Nastavi razgledanje
        </ButtonLink>
      </div>
    </div>
  );
}
