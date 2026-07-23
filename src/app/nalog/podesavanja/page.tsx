import { PasswordForm, ProfileForm } from '@/components/account/SettingsForms';
import { getProfile } from '@/lib/auth';

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="heading-2">Podešavanja</h1>
      <ProfileForm initialName={profile?.full_name ?? ''} email={profile?.email ?? ''} />
      <PasswordForm />
    </div>
  );
}
