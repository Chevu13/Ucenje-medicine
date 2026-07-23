import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, DemoBadge, EmptyState, SectionHeading } from '@/components/ui';
import { NewsletterForm } from '@/components/home/NewsletterForm';
import { createClient } from '@/lib/supabase/server';
import type { Challenge, Product } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Izazovi',
  description:
    'Povremeni programi sa dnevnim zadacima i zajedničkim tempom — prijavi se dok su mesta otvorena.',
};

export const revalidate = 60;

const STATUS_LABEL: Record<Challenge['status'], { label: string; tone: 'green' | 'blue' | 'gray' | 'amber' }> = {
  draft: { label: 'U pripremi', tone: 'gray' },
  scheduled: { label: 'Uskoro', tone: 'amber' },
  active: { label: 'U toku', tone: 'green' },
  completed: { label: 'Završen', tone: 'gray' },
  archived: { label: 'Arhiviran', tone: 'gray' },
};

export default async function ChallengesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('challenges')
    .select('*, product:products(*)')
    .in('status', ['scheduled', 'active', 'completed'])
    .order('starts_at', { ascending: false });

  const challenges = ((data as unknown as (Challenge & { product: Product | null })[]) ?? []).filter(
    (c) => c.product && c.product.status === 'published'
  ) as (Challenge & { product: Product })[];

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Izazovi"
        title="Učenje sa zajedničkim tempom"
        description="Izazovi su vremenski ograničeni programi sa dnevnim zadacima. Kada nema aktivnog izazova, prijavi se na obaveštenja."
      />

      {challenges.length === 0 ? (
        <div className="space-y-8">
          <EmptyState
            title="Trenutno nema otvorenih izazova"
            description="Novi izazovi se najavljuju ovde i putem mejla. Ostavi adresu i javićemo ti prvi termin."
          />
          <div className="mx-auto max-w-md">
            <NewsletterForm />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {challenges.map((ch) => {
            const s = STATUS_LABEL[ch.status];
            return (
              <Link key={ch.id} href={`/izazovi/${ch.product.slug}`} className="group">
                <Card className="flex h-full flex-col gap-3 p-6 transition-shadow group-hover:shadow-lift">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    {ch.product.is_demo ? <DemoBadge /> : null}
                  </div>
                  <h2 className="text-xl font-bold text-ink group-hover:text-brand-700">
                    {ch.product.title}
                  </h2>
                  {ch.product.short_description ? (
                    <p className="text-sm text-ink-soft">{ch.product.short_description}</p>
                  ) : null}
                  <p className="mt-auto pt-2 text-sm font-semibold text-ink-muted">
                    {formatDate(ch.starts_at)} — {formatDate(ch.ends_at)}
                    {ch.status !== 'completed' && ch.product.price_cents !== null
                      ? ` · ${formatPrice(ch.product.price_cents, ch.product.currency)}`
                      : ''}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
