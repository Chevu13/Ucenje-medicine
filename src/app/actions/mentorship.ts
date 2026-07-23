'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { mentorshipApplicationSchema } from '@/lib/validation';

type Result = { ok: true } | { ok: false; error: string };

/** User applies for a mentorship program (application mode). */
export async function applyForMentorship(programId: string, message: string): Promise<Result> {
  const parsed = mentorshipApplicationSchema.safeParse({ message });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se da bi poslao/la prijavu.' };

  // Prevent duplicate pending applications
  const { data: existing } = await supabase
    .from('mentorship_applications')
    .select('id')
    .eq('program_id', programId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) return { ok: false, error: 'Već imaš prijavu koja čeka odgovor.' };

  const { error } = await supabase.from('mentorship_applications').insert({
    program_id: programId,
    user_id: user.id,
    message: parsed.data.message,
  });
  if (error) return { ok: false, error: 'Greška pri slanju prijave. Pokušaj ponovo.' };

  revalidatePath('/mentorstvo');
  return { ok: true };
}

/** Mentee updates their own goals / study plan in the mentorship workspace. */
export async function updateMentorshipWorkspace(
  enrollmentId: string,
  fields: { goals?: string; studyPlan?: string }
): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  const patch: Record<string, unknown> = {};
  if (fields.goals !== undefined) patch.goals = fields.goals.slice(0, 5000);
  if (fields.studyPlan !== undefined) patch.study_plan = fields.studyPlan.slice(0, 10000);

  const { error } = await supabase
    .from('mentorship_enrollments')
    .update(patch)
    .eq('id', enrollmentId)
    .eq('user_id', user.id);
  if (error) return { ok: false, error: 'Greška pri čuvanju.' };
  revalidatePath('/nalog/mentorstvo');
  return { ok: true };
}

/** Mentee marks a mentorship task as done / not done. */
export async function setMentorshipTaskDone(taskId: string, done: boolean): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  const { error } = await supabase
    .from('mentorship_tasks')
    .update({ status: done ? 'done' : 'todo', completed_at: done ? new Date().toISOString() : null })
    .eq('id', taskId);
  if (error) return { ok: false, error: 'Greška pri čuvanju zadatka.' };
  revalidatePath('/nalog/mentorstvo');
  return { ok: true };
}
