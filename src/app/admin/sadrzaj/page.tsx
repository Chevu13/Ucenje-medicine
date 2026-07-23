import {
  AboutEditor,
  AnnouncementsEditor,
  FaqEditor,
  HeroEditor,
  MentorshipHighlightEditor,
  TestimonialsEditor,
} from '@/components/admin/ContentEditors';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_ABOUT, DEFAULT_HERO, DEFAULT_MENTORSHIP_HIGHLIGHT } from '@/lib/queries';
import type {
  AboutSettings,
  Announcement,
  Faq,
  HeroSettings,
  MentorshipHighlightSettings,
  Testimonial,
} from '@/lib/types';

export default async function AdminContentPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: settings }, { data: announcements }, { data: faqs }, { data: testimonials }] =
    await Promise.all([
      admin.from('site_settings').select('key, value').in('key', ['hero', 'about', 'mentorship_highlight']),
      admin.from('announcements').select('*').order('created_at', { ascending: false }),
      admin.from('faqs').select('*').order('position'),
      admin.from('testimonials').select('*').order('position'),
    ]);

  const settingsMap = new Map(((settings as { key: string; value: unknown }[]) ?? []).map((s) => [s.key, s.value]));
  const hero = (settingsMap.get('hero') as HeroSettings | undefined) ?? DEFAULT_HERO;
  const about = (settingsMap.get('about') as AboutSettings | undefined) ?? DEFAULT_ABOUT;
  const mentorshipHighlight =
    (settingsMap.get('mentorship_highlight') as MentorshipHighlightSettings | undefined) ??
    DEFAULT_MENTORSHIP_HIGHLIGHT;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="heading-2">Sadržaj sajta</h1>
      <HeroEditor initial={hero} />
      <AboutEditor initial={about} />
      <MentorshipHighlightEditor initial={mentorshipHighlight} />
      <AnnouncementsEditor announcements={(announcements as Announcement[]) ?? []} />
      <FaqEditor faqs={(faqs as Faq[]) ?? []} />
      <TestimonialsEditor testimonials={(testimonials as Testimonial[]) ?? []} />
    </div>
  );
}
