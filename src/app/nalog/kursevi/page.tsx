import { ButtonLink, Card, EmptyState, ProgressBar } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import type { Course, Entitlement, Product } from '@/lib/types';

export default async function MyCoursesPage() {
  const user = await requireUser();
  const supabase = createClient();

  // Courses the user can access: free published + owned paid
  const [{ data: freeData }, { data: ownedData }] = await Promise.all([
    supabase.from('products').select('*').eq('type', 'course').eq('status', 'published').eq('is_free', true),
    supabase
      .from('entitlements')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .is('revoked_at', null),
  ]);

  const free = (freeData as Product[] | null) ?? [];
  const ownedCourses = (((ownedData as unknown as (Entitlement & { product: Product | null })[]) ?? [])
    .map((e) => e.product)
    .filter((p): p is Product => Boolean(p && p.type === 'course')));

  const products = [...ownedCourses, ...free.filter((f) => !ownedCourses.some((o) => o.id === f.id))];

  if (products.length === 0) {
    return (
      <div>
        <h1 className="heading-2 mb-8">Moji kursevi</h1>
        <EmptyState
          title="Još nisi upisao/la nijedan kurs"
          description="Kreni od besplatnog kursa ili pogledaj celu ponudu."
          action={<ButtonLink href="/kursevi">Pogledaj kurseve</ButtonLink>}
        />
      </div>
    );
  }

  // Compute progress per course
  const { data: coursesData } = await supabase
    .from('courses')
    .select('id, product_id, course_modules(id, course_lessons(id))')
    .in(
      'product_id',
      products.map((p) => p.id)
    );

  interface CourseTree extends Course {
    course_modules: { id: string; course_lessons: { id: string }[] }[];
  }
  const courses = (coursesData as unknown as CourseTree[]) ?? [];

  const allLessonIds = courses.flatMap((c) => c.course_modules.flatMap((m) => m.course_lessons.map((l) => l.id)));
  let completed = new Set<string>();
  if (allLessonIds.length > 0) {
    const { data: prog } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', allLessonIds);
    completed = new Set(((prog as { lesson_id: string }[]) ?? []).map((p) => p.lesson_id));
  }

  return (
    <div>
      <h1 className="heading-2 mb-8">Moji kursevi</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => {
          const course = courses.find((c) => c.product_id === p.id);
          const lessonIds = course?.course_modules.flatMap((m) => m.course_lessons.map((l) => l.id)) ?? [];
          const done = lessonIds.filter((id) => completed.has(id)).length;
          const percent = lessonIds.length > 0 ? (done / lessonIds.length) * 100 : 0;
          return (
            <Card key={p.id} className="p-5">
              <h2 className="font-bold text-ink">{p.title}</h2>
              <p className="mt-1 text-xs text-ink-muted">
                {done}/{lessonIds.length} lekcija završeno
              </p>
              <div className="mt-3">
                <ProgressBar percent={percent} />
              </div>
              <ButtonLink href={`/kursevi/${p.slug}`} size="sm" variant="secondary" className="mt-4">
                {done > 0 ? 'Nastavi' : 'Počni'}
              </ButtonLink>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
