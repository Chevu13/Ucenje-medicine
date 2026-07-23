'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { noteCommentSchema, noteSchema, type NoteInput } from '@/lib/validation';
import type { Note } from '@/lib/types';

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export async function createNote(input: Partial<NoteInput>): Promise<Result<Note>> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category ?? null,
      course_id: parsed.data.courseId ?? null,
      lesson_id: parsed.data.lessonId ?? null,
      shared_with_mentor: parsed.data.sharedWithMentor,
    })
    .select('*')
    .single();

  if (error) return { ok: false, error: 'Greška pri čuvanju beleške.' };
  revalidatePath('/nalog/beleske');
  return { ok: true, data: data as Note };
}

export async function updateNote(noteId: string, input: Partial<NoteInput>): Promise<Result> {
  const parsed = noteSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Neispravan unos.' };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  const patch: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) patch.title = parsed.data.title;
  if (parsed.data.content !== undefined) patch.content = parsed.data.content;
  if (parsed.data.category !== undefined) patch.category = parsed.data.category;
  if (parsed.data.sharedWithMentor !== undefined) patch.shared_with_mentor = parsed.data.sharedWithMentor;

  const { error } = await supabase.from('notes').update(patch).eq('id', noteId).eq('user_id', user.id);
  if (error) return { ok: false, error: 'Greška pri čuvanju beleške.' };
  revalidatePath('/nalog/beleske');
  return { ok: true };
}

export async function deleteNote(noteId: string): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('user_id', user.id);
  if (error) return { ok: false, error: 'Greška pri brisanju beleške.' };
  revalidatePath('/nalog/beleske');
  return { ok: true };
}

/** Upsert the user's note attached to a specific lesson (used on lesson pages). */
export async function saveLessonNote(
  lessonId: string,
  courseId: string | null,
  content: string
): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se da bi pisao/la beleške.' };
  if (content.length > 50_000) return { ok: false, error: 'Beleška je predugačka.' };

  const { data: existing } = await supabase
    .from('notes')
    .select('id')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', (existing as { id: string }).id)
      .eq('user_id', user.id);
    if (error) return { ok: false, error: 'Greška pri čuvanju beleške.' };
  } else {
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      title: 'Beleška uz lekciju',
      content,
    });
    if (error) return { ok: false, error: 'Greška pri čuvanju beleške.' };
  }
  return { ok: true };
}

/** Mentor/admin comment on a note that was shared with mentors. */
export async function addNoteComment(noteId: string, content: string): Promise<Result> {
  const parsed = noteCommentSchema.safeParse({ noteId, content });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };

  const profile = await getProfile();
  if (!profile || (profile.role !== 'mentor' && profile.role !== 'admin')) {
    return { ok: false, error: 'Nemaš dozvolu za komentarisanje.' };
  }

  const supabase = createClient();
  const { error } = await supabase.from('note_comments').insert({
    note_id: parsed.data.noteId,
    author_id: profile.id,
    content: parsed.data.content,
  });
  if (error) return { ok: false, error: 'Greška pri slanju komentara (da li je beleška podeljena?).' };
  revalidatePath('/admin/mentorstvo');
  revalidatePath('/nalog/beleske');
  return { ok: true };
}
