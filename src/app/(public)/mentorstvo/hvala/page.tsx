import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = { title: 'Upit poslat', robots: { index: false } };

export default function MentorshipThanksPage() {
  return (
    <div className="container-page max-w-lg py-20 text-center">
      <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-emerald-500" aria-hidden="true" />
      <h1 className="heading-1">Upit je poslat 🎯</h1>
      <p className="mt-4 text-ink-soft">
        Hvala ti! Javljamo ti se lično na mejl ili Instagram sa detaljima o mentorstvu, terminima
        i uslovima.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Nazad na početnu
        </ButtonLink>
        <ButtonLink href="/skripte" variant="secondary" size="lg">
          Pogledaj materijale
        </ButtonLink>
      </div>
    </div>
  );
}
