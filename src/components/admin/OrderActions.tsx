'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cancelOrder, markOrderPaid } from '@/app/actions/admin';
import { Button } from '@/components/ui';
import type { OrderStatus } from '@/lib/types';

/** "Označi kao plaćeno" / "Otkaži" for the manual payment flow. */
export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (status === 'paid' || status === 'cancelled' || status === 'refunded') return null;

  const run = (action: 'paid' | 'cancel') => {
    const question =
      action === 'paid'
        ? 'Potvrdi: uplata je stigla? Ovo samo evidentira porudžbinu kao plaćenu (materijale šalješ ručno).'
        : 'Otkazati ovu porudžbinu?';
    if (!window.confirm(question)) return;
    setError(null);
    startTransition(async () => {
      const res = action === 'paid' ? await markOrderPaid(orderId) : await cancelOrder(orderId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button size="sm" disabled={pending} onClick={() => run('paid')}>
        {pending ? 'Čuvanje…' : 'Označi kao plaćeno'}
      </Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => run('cancel')}>
        Otkaži
      </Button>
      {error ? <span className="text-sm font-semibold text-red-600">{error}</span> : null}
    </div>
  );
}
