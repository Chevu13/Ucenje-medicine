import { Badge, Card, EmptyState } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { formatDateTime, formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/types';

const STATUS: Record<Order['status'], { label: string; tone: 'green' | 'amber' | 'red' | 'gray' }> = {
  paid: { label: 'Plaćeno', tone: 'green' },
  pending: { label: 'Čeka uplatu', tone: 'amber' },
  failed: { label: 'Neuspešno', tone: 'red' },
  cancelled: { label: 'Otkazano', tone: 'gray' },
  refunded: { label: 'Refundirano', tone: 'gray' },
};

export default async function PurchasesPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const orders = (data as unknown as (Order & { order_items: OrderItem[] })[]) ?? [];

  return (
    <div>
      <h1 className="heading-2 mb-8">Kupovine</h1>
      {orders.length === 0 ? (
        <EmptyState title="Još nema kupovina" description="Istorija tvojih porudžbina će stajati ovde." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const s = STATUS[order.status];
            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-muted">{formatDateTime(order.created_at)}</p>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-ink">{item.title_snapshot}</span>
                      <span className="font-semibold text-ink">
                        {formatPrice(item.unit_price_cents, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-brand-100 pt-2.5 text-right text-sm font-extrabold text-ink">
                  Ukupno: {formatPrice(order.total_cents, order.currency)}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
