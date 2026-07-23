import type { Profile } from '@/lib/types';

/**
 * ADMIN DEMO MODE
 * ---------------
 * When ADMIN_DEMO_MODE=true, the /admin section opens WITHOUT login so the
 * design can be reviewed. Anyone with the URL can view AND edit demo data.
 *
 * ⚠️ Preview only. Remove the variable (or set "false") before going live
 * with real data. One env change turns auth back on — no code changes needed.
 */
export function isAdminDemoMode(): boolean {
  return process.env.ADMIN_DEMO_MODE === 'true';
}

/** Fixed placeholder identity used while demo mode is active. */
export function demoAdminProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'demo@ucenjemedicine.local',
    full_name: 'Demo pregled',
    avatar_url: null,
    role: 'admin',
    created_at: now,
    updated_at: now,
  };
}
