import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getPublishedProducts } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'E-knjige',
  description:
    'Digitalne knjige za studente medicine — dostupne odmah nakon kupovine, u zaštićenom čitaču na tvom nalogu.',
};

export const revalidate = 60;

export default async function EbooksPage() {
  const products = await getPublishedProducts('ebook');
  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="E-knjige"
        title="Digitalne knjige, odmah dostupne"
        description="Kupljene e-knjige čitaš u zaštićenom čitaču iz svoje biblioteke — sa računara ili telefona."
      />
      <ProductGrid
        products={products}
        emptyTitle="E-knjige se pripremaju"
        emptyDescription="Uskoro stižu novi naslovi. Prijavi se na obaveštenja da ne propustiš."
      />
    </div>
  );
}
