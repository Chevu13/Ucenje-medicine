import type { Metadata } from 'next';
import { Instagram, Mail, Youtube } from 'lucide-react';
import { Card, SectionHeading } from '@/components/ui';
import { DEFAULT_CONTACT, getSetting } from '@/lib/queries';
import type { ContactSettings } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktiraj tim platforme Učenje medicine — mejlom ili porukom na Instagramu.',
};

export default async function ContactPage() {
  const contact = await getSetting<ContactSettings>('contact', DEFAULT_CONTACT);
  const emailReady = contact.email && !contact.email.startsWith('OVDE_');

  return (
    <div className="container-page max-w-2xl py-14">
      <SectionHeading
        eyebrow="Kontakt"
        title="Tu smo za pitanja"
        description="Za pitanja o kupovini, pristupu materijalima, mentorstvu ili saradnji — javi se nekim od kanala ispod. Odgovaramo najbrže što možemo."
      />

      <div className="space-y-4">
        <Card className="flex items-center gap-4 p-6">
          <Mail className="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-ink">Email</h2>
            {emailReady ? (
              <a href={`mailto:${contact.email}`} className="text-sm font-semibold text-brand-700 underline">
                {contact.email}
              </a>
            ) : (
              <p className="text-sm text-ink-soft">Email adresa se dodaje u admin panelu (Podešavanja → Kontakt).</p>
            )}
          </div>
        </Card>

        {contact.instagram ? (
          <Card className="flex items-center gap-4 p-6">
            <Instagram className="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-ink">Instagram</h2>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-700 underline"
              >
                Pošalji poruku na @ucenje_medicine
              </a>
            </div>
          </Card>
        ) : null}

        {contact.youtube ? (
          <Card className="flex items-center gap-4 p-6">
            <Youtube className="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-ink">YouTube</h2>
              <a
                href={contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-700 underline"
              >
                Lakše učenje medicine
              </a>
            </div>
          </Card>
        ) : null}
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        Napomena: putem ovih kanala ne pružamo medicinske savete — za lične medicinske odluke
        obrati se svom lekaru.
      </p>
    </div>
  );
}
