import type { Metadata } from 'next';
import { OrderRequestForm } from '@/components/checkout/OrderRequestForm';

export const metadata: Metadata = { title: 'Porudžbina', robots: { index: false } };

/** Guest order page: contact details, no login and no online payment. */
export default function CheckoutPage() {
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="heading-1">Završi porudžbinu</h1>
      <p className="mt-3 text-ink-soft">
        Ostavi svoje podatke i javićemo ti se lično oko uplate i preuzimanja materijala.
      </p>
      <div className="mt-8">
        <OrderRequestForm />
      </div>
    </div>
  );
}
