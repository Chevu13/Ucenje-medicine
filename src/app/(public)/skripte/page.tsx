import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getPublishedProducts } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Skripte i materijali',
  description:
    'Skripte, repetitorijumi i materijali za pripremu ispita — anatomija, mikrobiologija, fiziologija i više.',
};

export const revalidate = 60;

export default async function ScriptsPage() {
  const products = await getPublishedProducts('script');
  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Skripte"
        title="Materijali za pripremu ispita"
        description="Skripte i repetitorijumi koje koristiš direktno iz svoje biblioteke, kad god ti zatrebaju."
      />
      <ProductGrid
        products={products}
        emptyTitle="Skripte se pripremaju"
        emptyDescription="Uskoro stižu novi materijali. Prijavi se na obaveštenja da ne propustiš."
      />
    </div>
  );
}
