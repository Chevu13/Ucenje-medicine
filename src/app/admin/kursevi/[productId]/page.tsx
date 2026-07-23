import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CurriculumEditor } from '@/components/admin/CurriculumEditor';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Course, ModuleWithLessons, Product } from '@/lib/types';

interface Props {
  params: { productId: string };
}

export default async function AdminCurriculumPage({ params }: Props) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: productData } = await admin
    .from('products')
    .select('*')
    .eq('id', params.productId)
    .eq('type', 'course')
    .maybeSingle();
  if (!productData) notFound();
  const product = productData as Product;

  // Ensure the course row exists (older products may miss it)
  let { data: courseData } = await admin
    .from('courses')
    .select('*')
    .eq('product_id', product.id)
    .maybeSingle();
  if (!courseData) {
    const { data: created } = await admin
      .from('courses')
      .insert({ product_id: product.id })
      .select('*')
      .single();
    courseData = created;
  }
  const course = courseData as Course;

  const { data: modulesData } = await admin
    .from('course_modules')
    .select('*, course_lessons(*)')
    .eq('course_id', course.id)
    .order('position');
  const modules = (modulesData as unknown as ModuleWithLessons[]) ?? [];

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/kursevi"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Svi kursevi
      </Link>
      <h1 className="heading-2 mb-2">Kurikulum: {product.title}</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Dodaj module i lekcije sa YouTube linkovima. Lekcije označene kao „besplatan pregled“
        vidljive su i bez kupovine.
      </p>
      <CurriculumEditor courseId={course.id} modules={modules} />
    </div>
  );
}
