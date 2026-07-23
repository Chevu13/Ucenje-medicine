import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Alert, Badge, ButtonLink, Card, DemoBadge } from '@/components/ui';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Countdown } from '@/components/home/Countdown';
import { createClient } from '@/lib/supabase/server';
import { getProductBySlug } from '@/lib/queries';
import type { Challenge } from '@/lib/types';
import { effectivePriceCents, formatDate, formatPrice, siteUrl } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.seo_title ?? product.title,
    description: product.seo_description ?? product.short_description ?? undefined,
    alternates: { canonical: siteUrl(`/izazovi/${product.slug}`) },
  };
}

export default async function ChallengePage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.type !== 'challenge') notFound();

  const supabase = createClient();
  const { data: challengeRow } = await supabase
    .from('challenges')
    .select('*')
    .eq('product_id', product.id)
    .maybeSingle();
  if (!challengeRow) notFound();
  const challenge = challengeRow as Challenge;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrolled = false;
  if (user) {
    const { data: enr } = await supabase
      .from('challenge_enrollments')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .maybeSingle();
    enrolled = Boolean(enr);
  }

  const now = Date.now();
  const enrollOpen =
    (challenge.status === 'scheduled' || challenge.status === 'active') &&
    (!challenge.enroll_opens_at || new Date(challenge.enroll_opens_at).getTime() <= now) &&
    (!challenge.enroll_closes_at || new Date(challenge.enroll_closes_at).getTime() > now);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.5fr,1fr] lg:items-center">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="light">
                {challenge.status === 'active'
                  ? 'Izazov je u toku'
                  : challenge.status === 'scheduled'
                    ? 'Uskoro počinje'
                    : 'Izazov je završen'}
              </Badge>
              {product.is_demo ? <DemoBadge /> : null}
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{product.title}</h1>
            {product.short_description ? (
              <p className="mt-4 max-w-xl text-lg text-brand-100">{product.short_description}</p>
            ) : null}
            <p className="mt-5 text-sm font-semibold text-brand-200">
              {formatDate(challenge.starts_at)} — {formatDate(challenge.ends_at)}
              {challenge.max_participants ? ` · maks. ${challenge.max_participants} učesnika` : ''}
            </p>
            {product.price_cents !== null && challenge.status !== 'completed' ? (
              <p className="mt-1 text-lg font-bold">{formatPrice(effectivePriceCents(product), product.currency)}</p>
            ) : null}

            <div className="mt-7">
              {enrolled ? (
                <ButtonLink href="/nalog/izazovi" variant="white" size="lg">
                  Otvori svoj izazov
                </ButtonLink>
              ) : challenge.status === 'completed' ? (
                <Alert tone="info" className="max-w-md border-0 bg-white/10 text-white">
                  Ovaj izazov je završen. Prijavi se na obaveštenja da uhvatiš sledeći termin.
                </Alert>
              ) : enrollOpen ? (
                <AddToCartButton
                  item={{
                    productId: product.id,
                    slug: product.slug,
                    type: product.type,
                    title: product.title,
                    priceCents: effectivePriceCents(product),
                    coverUrl: product.cover_url,
                  }}
                />
              ) : (
                <Alert tone="warning" className="max-w-md">
                  Prijave trenutno nisu otvorene.
                  {challenge.enroll_opens_at && new Date(challenge.enroll_opens_at).getTime() > now
                    ? ` Otvaraju se ${formatDate(challenge.enroll_opens_at)}.`
                    : ' Prijavi se na obaveštenja za sledeći termin.'}
                </Alert>
              )}
            </div>
          </div>

          {challenge.status === 'scheduled' && challenge.starts_at ? (
            <Countdown targetIso={challenge.starts_at} label="Počinje za" />
          ) : challenge.enroll_closes_at && enrollOpen ? (
            <Countdown targetIso={challenge.enroll_closes_at} label="Prijave se zatvaraju za" />
          ) : null}
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.5fr,1fr]">
        <div>
          <h2 className="heading-2 mb-5">Kako izazov funkcioniše</h2>
          <div className="prose-simple">
            {(product.description ?? 'Opis izazova se dodaje u admin panelu.')
              .split('\n\n')
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        </div>
        <Card className="h-fit space-y-3 p-6 text-sm text-ink-soft">
          <p>• Svakog dana dobijaš konkretan zadatak u svom nalogu.</p>
          <p>• Označavaš šta si završio/la i pratiš procenat napretka.</p>
          <p>• Materijali i objave ostaju dostupni učesnicima i nakon završetka.</p>
        </Card>
      </section>
    </>
  );
}
