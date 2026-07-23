import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: 'Kako platforma Učenje medicine prikuplja, koristi i štiti tvoje podatke.',
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <SectionHeading eyebrow="Pravno" title="Politika privatnosti" />
      <div className="prose-simple">
        <p>
          Ova politika opisuje koje podatke platforma „Učenje medicine“ prikuplja i kako ih
          koristi. Podatke prikupljamo samo u meri neophodnoj za rad platforme.
        </p>
        <p>
          <strong>Koje podatke prikupljamo:</strong> podatke naloga (ime, email adresa, lozinka u
          heširanom obliku), podatke o kupovinama i pristupu materijalima, beleške koje sam/a
          uneseš, podatke o napretku kroz kurseve i izazove, kao i email adrese prijavljene na
          obaveštenja.
        </p>
        <p>
          <strong>Kako ih koristimo:</strong> za pružanje usluge (pristup kupljenim materijalima,
          praćenje napretka, mentorstvo), za obaveštenja koja si zatražio/la i za tehničko
          održavanje platforme. Beleške koje ne podeliš sa mentorom vidiš samo ti.
        </p>
        <p>
          <strong>Sa kim ih delimo:</strong> podatke ne prodajemo. Koriste se pouzdani tehnički
          podizvođači (hosting, baza podataka, procesor plaćanja) isključivo radi pružanja usluge.
        </p>
        <p>
          <strong>Tvoja prava:</strong> u svakom trenutku možeš zatražiti uvid, ispravku ili
          brisanje svojih podataka putem stranice Kontakt. Odjava sa obaveštenja moguća je u svakom
          mejlu.
        </p>
        <p>
          NAPOMENA ZA VLASNIKA SAJTA: pre puštanja u rad, dopuni ovu stranicu podacima o pravnom
          licu (naziv, adresa, matični broj) i proveri usklađenost sa važećim propisima o zaštiti
          podataka.
        </p>
      </div>
    </div>
  );
}
