import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Youtube } from 'lucide-react';
import { getSetting, DEFAULT_CONTACT } from '@/lib/queries';
import type { ContactSettings } from '@/lib/types';
import { Ekg } from '@/components/Ekg';

const FOOTER_NAV = [
  {
    title: 'Sadržaj',
    links: [
      { href: '/kursevi', label: 'Kursevi' },
      { href: '/e-knjige', label: 'E-knjige' },
      { href: '/skripte', label: 'Skripte' },
      { href: '/mentorstvo', label: 'Mentorstvo' },
      { href: '/izazovi', label: 'Izazovi' },
    ],
  },
  {
    title: 'Platforma',
    links: [
      { href: '/o-darku', label: 'O Darku' },
      { href: '/cesta-pitanja', label: 'Česta pitanja' },
      { href: '/kontakt', label: 'Kontakt' },
      { href: '/nalog', label: 'Moj nalog' },
    ],
  },
  {
    title: 'Pravno',
    links: [
      { href: '/privatnost', label: 'Politika privatnosti' },
      { href: '/uslovi-koriscenja', label: 'Uslovi korišćenja' },
      { href: '/medicinski-disclaimer', label: 'Medicinski disclaimer' },
    ],
  },
];

export async function Footer() {
  const contact = await getSetting<ContactSettings>('contact', DEFAULT_CONTACT);

  return (
    <footer className="mt-20 bg-brand-900 text-white">
      <Ekg className="h-10 w-full bg-white" color="#0052FF" />
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Image src="/brand/logo-white.svg" alt="Učenje medicine" width={170} height={48} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">
            Kursevi, skripte, e-knjige, izazovi i mentorstvo za studente medicine — sve na jednom
            mestu.
          </p>
          <div className="mt-5 flex gap-3">
            {contact.instagram ? (
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @ucenje_medicine"
                className="rounded-lg bg-brand-800 p-2.5 hover:bg-brand-700"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            ) : null}
            {contact.youtube ? (
              <a
                href={contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube kanal"
                className="rounded-lg bg-brand-800 p-2.5 hover:bg-brand-700"
              >
                <Youtube className="h-5 w-5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        {FOOTER_NAV.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-skyblue">
              {group.title}
            </h3>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-100 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-brand-800">
        <div className="container-page space-y-3 py-6 text-xs leading-relaxed text-brand-300">
          <p>
            Sadržaj na ovoj platformi je edukativnog karaktera i ne zamenjuje profesionalni
            medicinski savet, dijagnozu ili lečenje. Za lične medicinske odluke obrati se
            nadležnom lekaru.{' '}
            <Link href="/medicinski-disclaimer" className="underline hover:text-white">
              Pročitaj ceo disclaimer
            </Link>
            .
          </p>
          <p>© {new Date().getFullYear()} Učenje medicine. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
}
