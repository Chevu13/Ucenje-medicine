import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  Flag,
} from 'lucide-react';
import { Ekg } from '@/components/Ekg';
import { ButtonLink, Card, SectionHeading, Badge, DemoBadge, EmptyState } from '@/components/ui';
import { ProductCard } from '@/components/products/ProductCard';
import { Countdown } from '@/components/home/Countdown';
import { NewsletterForm } from '@/components/home/NewsletterForm';
import {
  DEFAULT_ABOUT,
  DEFAULT_HERO,
  DEFAULT_MENTORSHIP_HIGHLIGHT,
  getFeaturedProducts,
  getHighlightChallenge,
  getPublishedFaqs,
  getPublishedTestimonials,
  getSetting,
} from '@/lib/queries';
import type { AboutSettings, HeroSettings, MentorshipHighlightSettings } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';

const CATEGORIES = [
  {
    href: '/kursevi',
    title: 'Kursevi',
    description: 'Strukturirane video lekcije koje prate Darkov YouTube sadržaj.',
    icon: GraduationCap,
  },
  {
    href: '/e-knjige',
    title: 'E-knjige',
    description: 'Digitalne knjige dostupne odmah nakon kupovine, u zaštićenom čitaču.',
    icon: BookOpen,
  },
  {
    href: '/skripte',
    title: 'Skripte',
    description: 'Skripte i repetitorijumi za sigurniju pripremu ispita.',
    icon: FileText,
  },
  {
    href: '/mentorstvo',
    title: 'Mentorstvo',
    description: 'Rad 1-na-1 sa Darkom: nedeljne konsultacije, plan i zadaci.',
    icon: Users,
  },
  {
    href: '/izazovi',
    title: 'Izazovi',
    description: 'Povremeni programi sa dnevnim zadacima i zajedničkim tempom.',
    icon: Flag,
  },
];

export default async function HomePage() {
  const [hero, about, mentorshipHighlight, featured, challenge, testimonials, faqs] =
    await Promise.all([
      getSetting<HeroSettings>('hero', DEFAULT_HERO),
      getSetting<AboutSettings>('about', DEFAULT_ABOUT),
      getSetting<MentorshipHighlightSettings>(
        'mentorship_highlight',
        DEFAULT_MENTORSHIP_HIGHLIGHT
      ),
      getFeaturedProducts(),
      getHighlightChallenge(),
      getPublishedTestimonials(),
      getPublishedFaqs(),
    ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="container-page grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <Ekg className="mb-6 h-10 w-40" color="#9CC3FF" animated />
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={hero.cta_primary_href} variant="white" size="lg">
                {hero.cta_primary_label}
              </ButtonLink>
              <ButtonLink
                href={hero.cta_secondary_href}
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                {hero.cta_secondary_label}
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lift">
              <Image
                src={hero.image_url || '/brand/darko-placeholder.svg'}
                alt="Darko Milošević, Učenje medicine"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust / one account */}
      <section className="border-b border-brand-100 bg-surface-subtle">
        <div className="container-page py-10">
          <p className="mx-auto max-w-3xl text-center text-base font-semibold text-ink sm:text-lg">
            Jedan nalog — svi materijali, kupovine, beleške i napredak.{' '}
            <span className="text-ink-soft font-normal">
              Poručuješ jednostavno — bez naloga, uz lični kontakt oko uplate i slanja materijala
              automatski.
            </span>
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Sve na jednom mestu"
          title="Šta te zanima?"
          description="Pet celina — od besplatnih lekcija do rada 1-na-1 sa Darkom."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href} className="group">
              <Card className="flex h-full flex-col gap-3 p-6 transition-shadow group-hover:shadow-lift">
                <cat.icon className="h-8 w-8 text-brand-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-ink group-hover:text-brand-700">{cat.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{cat.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 ? (
        <section className="bg-surface-subtle py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Izdvojeno" title="Preporučeni materijali" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Mentorship highlight */}
      <section className="bg-brand-900 py-16 text-white">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-skyblue">Premium podrška</p>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Mentorstvo sa Darkom</h2>
            <p className="mt-4 leading-relaxed text-brand-100">
              Najdirektniji način rada: jedna 60-minutna konsultacija svake nedelje, lični plan
              učenja, zadaci sa rokovima i redovne povratne informacije — sve dok ne
              stigneš tamo gde si krenuo/la.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-brand-100">
              <li>• Nedeljna konsultacija 1-na-1 (60 minuta)</li>
              <li>• Lični ciljevi i plan učenja</li>
              <li>• Zadaci, rokovi i praćenje napretka</li>
              <li>• Konkretni komentari na tvoja pitanja i beleške</li>
            </ul>
            <ButtonLink href="/mentorstvo" variant="white" size="lg" className="mt-8">
              Saznaj više o mentorstvu
            </ButtonLink>
          </div>
          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image
                src={mentorshipHighlight.image_url || about.image_url || '/brand/darko-placeholder.svg'}
                alt="Mentorstvo sa Darkom"
                fill
                sizes="30vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active/scheduled challenge */}
      {challenge ? (
        <section className="container-page py-16">
          <Card className="overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 text-white">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge tone="light">{challenge.status === 'active' ? 'Izazov je u toku' : 'Uskoro počinje'}</Badge>
                  {challenge.product.is_demo ? <DemoBadge /> : null}
                </div>
                <h2 className="text-2xl font-extrabold sm:text-3xl">{challenge.product.title}</h2>
                {challenge.product.short_description ? (
                  <p className="mt-3 max-w-xl text-brand-100">{challenge.product.short_description}</p>
                ) : null}
                <p className="mt-4 text-sm font-semibold text-brand-200">
                  {formatDate(challenge.starts_at)} — {formatDate(challenge.ends_at)}
                  {challenge.max_participants ? ` · ograničen broj mesta (${challenge.max_participants})` : ''}
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-200">
                  {challenge.product.price_cents !== null
                    ? formatPrice(challenge.product.price_cents, challenge.product.currency)
                    : 'Cena uskoro'}
                </p>
                <ButtonLink href={`/izazovi/${challenge.product.slug}`} variant="white" size="lg" className="mt-6">
                  Pogledaj izazov
                </ButtonLink>
              </div>
              {challenge.starts_at ? (
                <Countdown
                  targetIso={challenge.starts_at}
                  label={challenge.status === 'active' ? 'Izazov traje' : 'Počinje za'}
                />
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      {/* About Darko */}
      <section className="bg-surface-subtle py-16">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr,1.5fr]">
          <div className="relative mx-auto w-full max-w-xs">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card">
              <Image
                src={about.image_url || '/brand/darko-placeholder.svg'}
                alt="Darko Milošević"
                fill
                sizes="(max-width: 1024px) 80vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Ko stoji iza platforme" title={about.headline} />
            <p className="max-w-xl leading-relaxed text-ink-soft">{about.body}</p>
            <ButtonLink href="/o-darku" variant="secondary" className="mt-6">
              Upoznaj Darka
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="container-page py-16">
          <SectionHeading eyebrow="Utisci" title="Šta kažu studenti" />
          <div className="grid gap-6 sm:grid-cols-2">
            {testimonials.map((t) => (
              <Card key={t.id} className="p-6">
                {t.is_demo ? (
                  <div className="mb-3">
                    <DemoBadge />
                  </div>
                ) : null}
                <blockquote className="text-ink-soft">„{t.content}“</blockquote>
                <p className="mt-4 font-bold text-ink">{t.name}</p>
                {t.role ? <p className="text-sm text-ink-muted">{t.role}</p> : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      <section className="bg-surface-subtle py-16">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="Česta pitanja" title="Imaš pitanje? Verovatno je ovde." align="center" />
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
          <p className="mt-6 text-center text-sm text-ink-soft">
            Ne vidiš odgovor?{' '}
            <Link href="/kontakt" className="font-semibold text-brand-700 underline underline-offset-2">
              Piši nam
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-page py-16 text-center">
        <SectionHeading
          eyebrow="Ostani u toku"
          title="Novi materijali i izazovi — pravo u inbox"
          description="Bez spama. Javljamo se samo kada izađe nešto novo ili kada krene prijava za izazov."
          align="center"
        />
        <NewsletterForm />
      </section>
    </>
  );
}
