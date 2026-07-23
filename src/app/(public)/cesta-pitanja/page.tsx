import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, SectionHeading } from '@/components/ui';
import { getPublishedFaqs } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Česta pitanja',
  description: 'Odgovori na najčešća pitanja o kupovini, kursevima, e-knjigama, mentorstvu i izazovima.',
};

export const revalidate = 300;

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();

  return (
    <div className="container-page max-w-3xl py-14">
      <SectionHeading eyebrow="Pomoć" title="Česta pitanja" align="center" />
      {faqs.length === 0 ? (
        <EmptyState title="Pitanja se uskoro dodaju" />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.id} className="group rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
              <summary className="cursor-pointer list-none font-bold text-ink marker:content-none group-open:text-brand-700">
                {faq.question}
              </summary>
              <p className="mt-3 leading-relaxed text-ink-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
      <p className="mt-8 text-center text-sm text-ink-soft">
        Nisi našao/la odgovor?{' '}
        <Link href="/kontakt" className="font-semibold text-brand-700 underline">
          Kontaktiraj nas
        </Link>
        .
      </p>
    </div>
  );
}
