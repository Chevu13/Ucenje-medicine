'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** Mark or unmark a lesson as completed for the current user. */
export async function setLessonComplete(
  lessonId: string,
  completed: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se da bi pratio/la napredak.' };

  if (completed) {
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert(
        { user_id: user.id, lesson_id: lessonId },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
      );
    if (error) return { ok: false, error: 'Greška pri čuvanju napretka.' };
  } else {
    const { error } = await supabase
      .from('user_lesson_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);
    if (error) return { ok: false, error: 'Greška pri čuvanju napretka.' };
  }

  revalidatePath('/nalog');
  return { ok: true };
}
