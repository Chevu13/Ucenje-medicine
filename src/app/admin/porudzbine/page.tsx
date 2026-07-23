import { Badge, Card, EmptyState } from '@/components/ui';
import { OrderActions } from '@/components/admin/OrderActions';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDateTime, formatPrice } from '@/lib/utils';
import type { Order, OrderItem, Profile } from '@/lib/types';

interface PaymentRow {
  id: string;
  provider: string;
  status: string;
  created_at: string;
}

interface OrderRow extends Order {
  order_items: OrderItem[];
  payments: PaymentRow[];
  user: Pick<Profile, 'email' | 'full_name'> | null;
}

const TONE: Record<Order['status'], 'green' | 'amber' | 'red' | 'gray'> = {
  paid: 'green',
  pending: 'amber',
  failed: 'red',
  cancelled: 'gray',
  refunded: 'gray',
};
const LABEL: Record<Order['status'], string> = {
  paid: 'Plaćeno',
  pending: 'Čeka uplatu',
  failed: 'Neuspešno',
  cancelled: 'Otkazano',
  refunded: 'Refundirano',
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('orders')
    .select('*, order_items(*), payments(id, provider, status, created_at), user:profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  const orders = (data as unknown as OrderRow[]) ?? [];

  return (
    <div>
      <h1 className="heading-2 mb-2">Porudžbine</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Kupci ostavljaju kontakt, a uplatu dogovaraš direktno (Instagram/mejl). Kada uplata
        stigne, klikni „Označi kao plaćeno“ da porudžbina bude evidentirana — materijale šalješ
        kupcu lično.
      </p>
      {orders.length === 0 ? (
        <EmptyState title="Još nema porudžbina" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">
                    {order.user?.full_name || order.user?.email || '—'}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {order.user?.email} · {formatDateTime(order.created_at)}
                  </p>
                </div>
                <Badge tone={TONE[order.status]}>{LABEL[order.status]}</Badge>
                <span className="font-extrabold text-ink">
                  {formatPrice(order.total_cents, order.currency)}
                </span>
              </div>
              <ul className="mt-2 text-sm text-ink-soft">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    • {item.title_snapshot} — {formatPrice(item.unit_price_cents, order.currency)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-ink-muted">
                Kontakt: {order.contact_name || '—'} · {order.contact_email || order.user?.email || '—'}
                {order.contact_instagram ? (
                  <>
                    {' · '}
                    <a
                      href={`https://www.instagram.com/${order.contact_instagram}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      @{order.contact_instagram}
                    </a>
                  </>
                ) : null}
              </p>
              {order.customer_note ? (
                <p className="mt-1 text-xs text-ink-soft">Napomena: {order.customer_note}</p>
              ) : null}
              <OrderActions orderId={order.id} status={order.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
