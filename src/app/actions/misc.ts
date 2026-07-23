'use server';

import { createClient } from '@/lib/supabase/server';
import { newsletterSchema } from '@/lib/validation';

/** Newsletter signup (public). Duplicate emails succeed silently. */
export async function subscribeToNewsletter(
  email: string
): Promise<{ ok: boolean; message: string }> {
  const parsed = newsletterSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Neispravna email adresa.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: parsed.data.email.toLowerCase().trim() });

  if (error && error.code !== '23505') {
    return { ok: false, message: 'Došlo je do greške. Pokušaj ponovo.' };
  }
  return { ok: true, message: 'Uspešno si se prijavio/la na obaveštenja.' };
}
