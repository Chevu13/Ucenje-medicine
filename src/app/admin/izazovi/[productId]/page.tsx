import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui';
import { ChallengeEditor } from '@/components/admin/ChallengeEditor';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Challenge, ChallengeTask, Product, Profile } from '@/lib/types';

interface Props {
  params: { productId: string };
}

export default async function AdminChallengeEditPage({ params }: Props) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: productData } = await admin
    .from('products')
    .select('*')
    .eq('id', params.productId)
    .eq('type', 'challenge')
    .maybeSingle();
  if (!productData) notFound();
  const product = productData as Product;

  let { data: challengeData } = await admin
    .from('challenges')
    .select('*')
    .eq('product_id', product.id)
    .maybeSingle();
  if (!challengeData) {
    const { data: created } = await admin
      .from('challenges')
      .insert({ product_id: product.id, status: 'draft' })
      .select('*')
      .single();
    challengeData = created;
  }
  const challenge = challengeData as Challenge;

  const [{ data: tasksData }, { data: participantsData }] = await Promise.all([
    admin.from('challenge_tasks').select('*').eq('challenge_id', challenge.id),
    admin
      .from('challenge_enrollments')
      .select('id, created_at, user:profiles(full_name, email)')
      .eq('challenge_id', challenge.id)
      .order('created_at'),
  ]);
  const tasks = (tasksData as ChallengeTask[]) ?? [];
  const participants =
    (participantsData as unknown as { id: string; created_at: string; user: Pick<Profile, 'full_name' | 'email'> | null }[]) ??
    [];

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/izazovi"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Svi izazovi
      </Link>
      <h1 className="heading-2 mb-2">Izazov: {product.title}</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Naziv, opis i cenu menjaš u{' '}
        <Link href={`/admin/proizvodi/${product.id}`} className="font-semibold text-brand-700 underline">
          podacima proizvoda
        </Link>
        .
      </p>

      <ChallengeEditor challenge={challenge} tasks={tasks} />

      <Card className="mt-5 p-6">
        <h2 className="heading-3 mb-3">Učesnici ({participants.length})</h2>
        {participants.length === 0 ? (
          <p className="text-sm text-ink-soft">Još nema prijavljenih.</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {participants.map((p) => (
              <li key={p.id} className="flex justify-between py-2 text-sm">
                <span className="font-semibold text-ink">{p.user?.full_name || p.user?.email}</span>
                <span className="text-ink-muted">{p.user?.email}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
