import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react';
import { Badge, ButtonLink, Card } from '@/components/ui';
import { MarkCompleteButton, LessonNote } from '@/components/courses/LessonActions';
import { createClient } from '@/lib/supabase/server';
import { getProductBySlug, userOwnsProduct } from '@/lib/queries';
import type { Course, CourseLesson, CourseModule, Note } from '@/lib/types';
import { youtubeVideoId } from '@/lib/utils';

interface Props {
  params: { slug: string; lessonId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return { title: product ? `Lekcija — ${product.title}` : 'Lekcija', robots: { index: false } };
}

export default async function LessonPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.type !== 'course') notFound();

  const supabase = createClient();

  // Verify the lesson belongs to this course
  const { data: lessonRow } = await supabase
    .from('course_lessons')
    .select('*, course_modules!inner(*, courses!inner(id, product_id))')
    .eq('id', params.lessonId)
    .maybeSingle();
  if (!lessonRow) notFound();

  const lesson = lessonRow as unknown as CourseLesson & {
    course_modules: CourseModule & { courses: Pick<Course, 'id' | 'product_id'> };
  };
  if (lesson.course_modules.courses.product_id !== product.id) notFound();
  const courseId = lesson.course_modules.courses.id;

  const owned = product.is_free ? true : await userOwnsProduct(product.id);
  const accessible = owned || lesson.is_free_preview;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!accessible) {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <Lock className="mx-auto mb-4 h-10 w-10 text-brand-600" aria-hidden="true" />
        <h1 className="heading-2">Ova lekcija je deo plaćenog kursa</h1>
        <p className="mt-3 text-ink-soft">
          Da bi otvorio/la lekciju „{lesson.title}“, potrebno je da kupiš kurs „{product.title}“.
        </p>
        <ButtonLink href={`/kursevi/${product.slug}`} size="lg" className="mt-6">
          Pogledaj kurs
        </ButtonLink>
      </div>
    );
  }

  // Video URL is only rendered server-side after the access check above.
  const videoId = youtubeVideoId(lesson.youtube_url);
  const hasRealUrl = Boolean(lesson.youtube_url && lesson.youtube_url.startsWith('http'));

  let completed = false;
  let existingNote: Note | null = null;
  if (user) {
    const [{ data: prog }, { data: note }] = await Promise.all([
      supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle(),
      supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    completed = Boolean(prog);
    existingNote = (note as Note | null) ?? null;
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <Link
        href={`/kursevi/${product.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Nazad na kurs
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="light">{lesson.course_modules.title}</Badge>
        {lesson.is_free_preview ? <Badge tone="green">Besplatan pregled</Badge> : null}
      </div>
      <h1 className="heading-1">{lesson.title}</h1>

      <div className="mt-8">
        {videoId ? (
          <div className="aspect-video overflow-hidden rounded-2xl shadow-card">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="font-semibold text-ink">
              {hasRealUrl
                ? 'Video za ovu lekciju se otvara direktno na YouTube-u.'
                : 'Video link za ovu lekciju još nije postavljen (dodaje se u admin panelu).'}
            </p>
          </Card>
        )}
        {hasRealUrl ? (
          <a
            href={lesson.youtube_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:underline"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Otvori na YouTube-u
          </a>
        ) : null}
      </div>

      {lesson.summary ? (
        <div className="prose-simple mt-8">
          <h2 className="heading-3 mb-3">Ukratko</h2>
          <p>{lesson.summary}</p>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        {user ? (
          <MarkCompleteButton lessonId={lesson.id} initialCompleted={completed} />
        ) : (
          <p className="text-sm text-ink-soft">
            <Link href="/prijava" className="font-semibold text-brand-700 underline">
              Prijavi se
            </Link>{' '}
            da bi označavao/la lekcije kao završene i pisao/la beleške.
          </p>
        )}
      </div>

      {user ? (
        <Card className="mt-8 p-6">
          <LessonNote
            lessonId={lesson.id}
            courseId={courseId}
            initialContent={existingNote?.content ?? ''}
          />
        </Card>
      ) : null}
    </div>
  );
}
