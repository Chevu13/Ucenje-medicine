import type { Metadata } from 'next';
import Image from 'next/image';
import { Instagram, Youtube } from 'lucide-react';
import { ButtonLink, Card, SectionHeading } from '@/components/ui';
import { DEFAULT_ABOUT, DEFAULT_CONTACT, getSetting } from '@/lib/queries';
import type { AboutSettings, ContactSettings } from '@/lib/types';

export const metadata: Metadata = {
  title: 'O Darku',
  description:
    'Upoznaj Darka — lekara i edukatora koji stoji iza platforme Učenje medicine, YouTube kanala i Instagram zajednice.',
};

export default async function AboutPage() {
  const [about, contact] = await Promise.all([
    getSetting<AboutSettings>('about', DEFAULT_ABOUT),
    getSetting<ContactSettings>('contact', DEFAULT_CONTACT),
  ]);

  return (
    <div className="container-page py-14">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr,1.6fr]">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card">
            <Image
              src={about.image_url || '/brand/darko-placeholder.svg'}
              alt="Darko Milošević"
              fill
              sizes="(max-width: 1024px) 90vw, 30vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="O Darku" title={about.headline} />
          <div className="prose-simple max-w-2xl">
            {about.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <Card className="mt-8 max-w-2xl p-6">
            <h2 className="heading-3 mb-3">Gde još možeš da pratiš sadržaj</h2>
            <div className="flex flex-wrap gap-3">
              {contact.youtube ? (
                <a
                  href={contact.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-blue px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
                >
                  <Youtube className="h-4 w-4" aria-hidden="true" /> YouTube kanal
                </a>
              ) : null}
              {contact.instagram ? (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-blue px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" /> @ucenje_medicine
                </a>
              ) : null}
              {contact.instagram_personal ? (
                <a
                  href={contact.instagram_personal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-blue px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" /> @dr_darko_milosevic
                </a>
              ) : null}
            </div>
          </Card>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/kursevi">Pogledaj kurseve</ButtonLink>
            <ButtonLink href="/mentorstvo" variant="secondary">
              Mentorstvo
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
