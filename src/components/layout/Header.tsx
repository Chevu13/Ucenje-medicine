import { getProfile } from '@/lib/auth';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const profile = await getProfile();
  return <HeaderClient isLoggedIn={Boolean(profile)} isAdmin={profile?.role === 'admin'} />;
}
