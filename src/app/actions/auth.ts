'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  newPasswordSchema,
  profileSchema,
  registerSchema,
  resetRequestSchema,
} from '@/lib/validation';
import { siteUrl } from '@/lib/utils';

export interface AuthResult {
  ok: boolean;
  error?: string;
  message?: string;
}

/** Only allow internal redirect targets (prevents open redirects). */
function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/nalog';
}

export async function signUp(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: siteUrl('/auth/callback'),
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { ok: false, error: 'Nalog sa ovom email adresom već postoji. Probaj prijavu.' };
    }
    return { ok: false, error: 'Registracija nije uspela. Pokušaj ponovo.' };
  }
  return {
    ok: true,
    message:
      'Nalog je kreiran. Ako je uključena potvrda mejla, proveri inbox i klikni na link za potvrdu.',
  };
}

export async function signIn(
  input: { email: string; password: string },
  next?: string | null
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: 'Pogrešan email ili lozinka.' };
  }
  revalidatePath('/', 'layout');
  redirect(safeNext(next));
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: siteUrl('/auth/callback?next=/nova-lozinka'),
  });
  // Same answer regardless of whether the email exists (no user enumeration).
  return {
    ok: true,
    message: 'Ako nalog postoji, poslali smo ti mejl sa linkom za promenu lozinke.',
  };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const parsed = newPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: 'Promena lozinke nije uspela. Zatraži novi link.' };
  return { ok: true, message: 'Lozinka je promenjena.' };
}

export async function updateProfile(fullName: string): Promise<AuthResult> {
  const parsed = profileSchema.safeParse({ fullName });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Prijavi se.' };

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('id', user.id);
  if (error) return { ok: false, error: 'Čuvanje nije uspelo.' };
  revalidatePath('/nalog/podesavanja');
  return { ok: true, message: 'Podaci su sačuvani.' };
}
