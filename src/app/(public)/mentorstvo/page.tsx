import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarCheck, ClipboardList, MessageSquare, Target } from 'lucide-react';
import { Badge, Card, DemoBadge, SectionHeading } from '@/components/ui';
import { MentorshipInquiryForm } from '@/components/mentorship/InquiryForm';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_MENTORSHIP_HIGHLIGHT, getSetting } from '@/lib/queries';
import type { MentorshipHighlightSettings, MentorshipProgram, Product } from '@/lib/types';
import { effectivePriceCents, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Mentorstvo',
  description:
    'Mentorstvo 1-na-1 sa Darkom: nedeljna konsultacija od 60 minuta, lični plan učenja, zadaci i kontinuirana podrška.',
};

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: 'Nedeljna konsultacija (60 min)',
    description: 'Jednom nedeljno, 1-na-1 razgovor sa Darkom: pregled nedelje, pitanja, plan za dalje.',
  },
  {
    icon: Target,
    title: 'Ciljevi i pravac učenja',
    description: 'Zajedno postavljate ciljeve i pravite realan plan koji prati tvoje ispitne rokove.',
  },
  {
    icon: ClipboardList,
    title: 'Zadaci sa rokovima',
    description: 'Konkretni zadaci između konsultacija, sa jasnim prioritetima i rokovima.',
  },
  {
    icon: MessageSquare,
    title: 'Povratne informacije',
    description: 'Šalješ pitanja i beleške, a Darko ti daje konkretne komentare i smernice.',
  },
];

export default async function MentorshipPage() {
  const supabase = createClient();

  const { data: programRow } = await supabase
    .from('mentorship_programs')
    .select('*, product:products(*)')
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  const program = programRow as unknown as (MentorshipProgram & { product: Product | null }) | null;

  const highlight = await getSetting<MentorshipHighlightSettings>(
    'mentorship_highlight',
    DEFAULT_MENTORSHIP_HIGHLIGHT
  );
  const mentorshipImage = highlight.image_url;
  const product = program?.product && program.product.status === 'published' ? program.product : null;

  return (
    <>
      <section className="bg-brand-900 text-white">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-[1.4fr,1fr]">
          <div>
            <div className="mb-3 flex gap-2">
              <Badge tone="light">Premium podrška</Badge>
              {product?.is_demo ? <DemoBadge /> : null}
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Mentorstvo sa Darkom
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
              Za studente koji žele nekoga ko će ih voditi: jedna 60-minutna konsultacija svake
              nedelje, lični plan, zadaci i povratne informacije — dok ne dođeš do cilja.
            </p>
            {product && product.price_cents !== null ? (
              <p className="mt-4 text-lg font-bold text-white">
                {formatPrice(effectivePriceCents(product), product.currency)}
              </p>
            ) : (
              <p className="mt-4 text-sm font-semibold text-brand-200">
                Uslovi i cena se objavljuju pri otvaranju novih mesta.
              </p>
            )}
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lift">
              <Image
                src={mentorshipImage || '/brand/darko-placeholder.svg'}
                alt="Darko Milošević, mentor"
                fill
                sizes="(max-width: 1024px) 80vw, 30vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Šta dobijaš" title="Struktura koja te drži na pravcu" />
        <div className="grid gap-5 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="flex gap-4 p-6">
              <b.icon className="h-7 w-7 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-ink">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{b.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface-subtle py-16">
        <div className="container-page max-w-2xl">
          <SectionHeading
            eyebrow="Prijava"
            title="Ostavi podatke, javljamo ti se"
            align="center"
          />
          <Card className="p-8">
            <p className="mb-6 text-sm leading-relaxed text-ink-soft">
              Popuni kratak upit sa svojim podacima i opisom toga šta ti treba. Darko pregleda
              svaki upit lično i javlja ti se sa detaljima o terminima, uslovima i ceni.
            </p>
            <MentorshipInquiryForm />
          </Card>
        </div>
      </section>
    </>
  );
}
