import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Medicinski i edukativni disclaimer',
  description: 'Važne napomene o edukativnoj prirodi sadržaja na platformi Učenje medicine.',
};

export default function DisclaimerPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <SectionHeading eyebrow="Važna napomena" title="Medicinski i edukativni disclaimer" />
      <div className="prose-simple">
        <p>
          Platforma „Učenje medicine“ postoji da pomogne studentima i svima koje medicina zanima da
          uče lakše i organizovanije. Sav sadržaj — kursevi, skripte, e-knjige, izazovi, mentorstvo
          i objave na društvenim mrežama — ima isključivo edukativni karakter.
        </p>
        <p>
          Sadržaj platforme nije medicinski savet i ne zamenjuje pregled, dijagnozu, lečenje niti
          bilo koji oblik profesionalne zdravstvene zaštite. Ako imaš zdravstveni problem ili
          nedoumicu koja se tiče tvog zdravlja, obrati se svom lekaru ili drugom nadležnom
          zdravstvenom radniku.
        </p>
        <p>
          Materijali koji se bave navikama, ishranom ili telesnom težinom (npr. e-knjiga o održivom
          mršavljenju) opisuju opšte, edukativne principe. Svaki organizam je drugačiji — pre
          promena koje se tiču tvog zdravlja, posavetuj se sa lekarom. Rezultati opisani u
          edukativnim materijalima nisu garantovani i razlikuju se od osobe do osobe.
        </p>
        <p>
          Sadržaj namenjen pripremi ispita ne garantuje ishod ispita — on je alat koji pomaže da se
          priprema organizuje kvalitetnije.
        </p>
        <p>
          Korišćenjem platforme potvrđuješ da razumeš ove napomene. Za dodatna pitanja, slobodno
          nas kontaktiraj.
        </p>
      </div>
    </div>
  );
}
