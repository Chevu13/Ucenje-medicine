import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Uslovi korišćenja',
  description: 'Uslovi korišćenja platforme Učenje medicine.',
};

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <SectionHeading eyebrow="Pravno" title="Uslovi korišćenja" />
      <div className="prose-simple">
        <p>
          Korišćenjem platforme „Učenje medicine“ prihvataš ove uslove. Ako se sa njima ne slažeš,
          nemoj koristiti platformu.
        </p>
        <p>
          <strong>Nalog:</strong> odgovoran/na si za tačnost podataka i čuvanje svoje lozinke.
          Nalog je ličan i ne sme se deliti.
        </p>
        <p>
          <strong>Digitalni sadržaj:</strong> kupovinom dobijaš ličnu, neprenosivu licencu za
          korišćenje materijala (kurseva, e-knjiga, skripti) za sopstveno učenje. Zabranjeno je
          dalje deljenje, preprodaja, javno objavljivanje ili umnožavanje materijala bez pisane
          saglasnosti autora.
        </p>
        <p>
          <strong>Plaćanja i pristup:</strong> pristup kupljenom sadržaju se aktivira nakon
          potvrđene uplate i vezuje se za tvoj nalog. Uslovi eventualnog povraćaja sredstava biće
          istaknuti na stranici proizvoda u skladu sa važećim propisima o digitalnom sadržaju.
        </p>
        <p>
          <strong>Mentorstvo i izazovi:</strong> termini konsultacija se dogovaraju unutar
          platforme. Broj mesta može biti ograničen.
        </p>
        <p>
          <strong>Sadržaj korisnika:</strong> beleške i poruke koje uneseš ostaju tvoje, a nama
          daješ pravo da ih čuvamo radi pružanja usluge. Zabranjen je unos nezakonitog sadržaja.
        </p>
        <p>
          <strong>Odricanje odgovornosti:</strong> sadržaj je edukativan i ne predstavlja
          medicinski savet (vidi Medicinski disclaimer). Platforma ne garantuje ishode ispita niti
          zdravstvene rezultate.
        </p>
        <p>
          NAPOMENA ZA VLASNIKA SAJTA: pre puštanja u rad, dopuni ove uslove podacima o pravnom
          licu i po potrebi ih usaglasi sa advokatom.
        </p>
      </div>
    </div>
  );
}
