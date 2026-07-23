import { NotesManager, type NoteWithComments } from '@/components/notes/NotesManager';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';

export default async function NotesPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from('notes')
    .select('*, note_comments(*, author:profiles(full_name, role))')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const notes = (data as unknown as NoteWithComments[]) ?? [];

  return (
    <div>
      <h1 className="heading-2 mb-2">Beleške</h1>
      <p className="mb-8 text-ink-soft">
        Privatan prostor za učenje. Belešku možeš podeliti sa mentorom kada želiš povratnu
        informaciju.
      </p>
      <NotesManager initialNotes={notes} />
    </div>
  );
}
