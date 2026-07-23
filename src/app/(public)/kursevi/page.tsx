import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getPublishedProducts } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Kursevi',
  description:
    'Strukturirani video kursevi za studente medicine — lekcije koje prate Darkov YouTube sadržaj, sa praćenjem napretka.',
};

export const revalidate = 60;

export default async function CoursesPage() {
  const products = await getPublishedProducts('course');
  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Kursevi"
        title="Uči kroz strukturirane lekcije"
        description="Svaki kurs je podeljen na module i lekcije. Napredak se pamti na tvom nalogu, a pojedine lekcije su besplatne za pregled."
      />
      <ProductGrid
        products={products}
        emptyTitle="Kursevi se pripremaju"
        emptyDescription="Prijavi se na obaveštenja na početnoj strani i javićemo ti čim prvi kurs bude objavljen."
      />
    </div>
  );
}
