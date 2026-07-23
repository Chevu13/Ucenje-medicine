import { Card } from '@/components/ui';
import { ContactEditor } from '@/components/admin/ContentEditors';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_CONTACT } from '@/lib/queries';
import type { ContactSettings } from '@/lib/types';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: contactData }, { data: subscribers }] = await Promise.all([
    admin.from('site_settings').select('value').eq('key', 'contact').maybeSingle(),
    admin
      .from('newsletter_subscribers')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const contact = ((contactData?.value as ContactSettings | undefined) ?? DEFAULT_CONTACT);
  const subs = (subscribers as { email: string; created_at: string }[] | null) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="heading-2">Podešavanja</h1>
      <ContactEditor initial={contact} />

      <Card className="p-6">
        <h2 className="heading-3 mb-3">Newsletter pretplatnici ({subs.length})</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-ink-soft">Još nema prijava.</p>
        ) : (
          <>
            <p className="mb-3 text-xs text-ink-muted">
              Za slanje mejlova poveži servis za newsletter (vidi README). Lista je ovde radi
              izvoza.
            </p>
            <textarea
              readOnly
              aria-label="Lista email adresa"
              className="h-40 w-full rounded-xl border border-brand-200 p-3 font-mono text-xs"
              value={subs.map((s) => s.email).join('\n')}
            />
          </>
        )}
      </Card>
    </div>
  );
}
