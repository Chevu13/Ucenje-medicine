'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type Result = { ok: true } | { ok: false; error: string };

/** Participant marks a challenge task complete/incomplete. */
export async function setChallengeTaskDone(
  enrollmentId: string,
  taskId: string,
  done: boolean
): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  if (done) {
    const { error } = await supabase
      .from('challenge_task_progress')
      .upsert(
        { enrollment_id: enrollmentId, task_id: taskId },
        { onConflict: 'enrollment_id,task_id', ignoreDuplicates: true }
      );
    if (error) return { ok: false, error: 'Greška pri čuvanju.' };
  } else {
    const { error } = await supabase
      .from('challenge_task_progress')
      .delete()
      .eq('enrollment_id', enrollmentId)
      .eq('task_id', taskId);
    if (error) return { ok: false, error: 'Greška pri čuvanju.' };
  }
  revalidatePath('/nalog/izazovi');
  return { ok: true };
}
