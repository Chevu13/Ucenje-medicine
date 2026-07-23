import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { demoAdminProfile, isAdminDemoMode } from '@/lib/demo';
import type { Profile, UserRole } from '@/lib/types';

/** Current auth user, or null. */
export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Current user's profile row (source of truth for role), or null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return (data as Profile | null) ?? null;
}

/** Redirects to /prijava when not logged in. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/prijava');
  return user;
}

/** Redirects to /neovlascen when the profile role is insufficient. */
export async function requireRole(roles: UserRole[]): Promise<Profile> {
  const profile = await getProfile();
  if (isAdminDemoMode()) {
    // Preview mode: admin pages open without login (see src/lib/demo.ts).
    if (profile && roles.includes(profile.role)) return profile;
    return demoAdminProfile();
  }
  if (!profile) redirect('/prijava');
  if (!roles.includes(profile.role)) redirect('/neovlascen');
  return profile;
}

export const requireAdmin = () => requireRole(['admin']);
export const requireMentorOrAdmin = () => requireRole(['mentor', 'admin']);
