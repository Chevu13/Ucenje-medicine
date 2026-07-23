import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';
import { Ekg } from '@/components/Ekg';

export const metadata: Metadata = {
  title: 'Nemaš pristup',
  robots: { index: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="container-page max-w-lg py-24 text-center">
      <Ekg className="mx-auto mb-6 h-10 w-32 opacity-60" />
      <h1 className="heading-2">Nemaš pristup ovoj stranici</h1>
      <p className="mt-3 text-ink-soft">
        Ova sekcija je dostupna samo ovlašćenim korisnicima. Ako misliš da je u pitanju greška,
        javi nam se.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <ButtonLink href="/">Nazad na početnu</ButtonLink>
        <ButtonLink href="/kontakt" variant="secondary">
          Kontakt
        </ButtonLink>
      </div>
    </div>
  );
}
