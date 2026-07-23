import 'server-only';
import { getProfile } from '@/lib/auth';
import { demoAdminProfile, isAdminDemoMode } from '@/lib/demo';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/lib/types';

export type AdminCheck = { ok: true; profile: Profile } | { ok: false; error: string };

/** Non-redirecting admin check for server actions. */
export async function ensureAdmin(): Promise<AdminCheck> {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    // Demo mode: admin actions work without login so the panel is fully clickable.
    if (isAdminDemoMode()) return { ok: true, profile: demoAdminProfile() };
    return { ok: false, error: 'Nemaš dozvolu za ovu akciju.' };
  }
  return { ok: true, profile };
}

/** Non-redirecting mentor-or-admin check. */
export async function ensureMentorOrAdmin(): Promise<AdminCheck> {
  const profile = await getProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'mentor')) {
    if (isAdminDemoMode()) return { ok: true, profile: demoAdminProfile() };
    return { ok: false, error: 'Nemaš dozvolu za ovu akciju.' };
  }
  return { ok: true, profile };
}

/** Best-effort audit trail for admin actions. */
export async function audit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId ?? null,
      meta: meta ?? null,
    });
  } catch {
    // auditing must never break the action itself
  }
}
