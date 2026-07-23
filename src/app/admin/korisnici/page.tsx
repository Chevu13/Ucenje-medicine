import { EmptyState } from '@/components/ui';
import { UsersAdmin, type UserRow } from '@/components/admin/UsersAdmin';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  const admin = createAdminClient();

  const [{ data: usersData }, { data: productsData }] = await Promise.all([
    admin
      .from('profiles')
      .select('*, entitlements(*, product:products(title))')
      .order('created_at', { ascending: false })
      .limit(200),
    admin.from('products').select('id, title').order('title'),
  ]);

  const users = (usersData as unknown as UserRow[]) ?? [];
  const products = (productsData as Pick<Product, 'id' | 'title'>[] | null) ?? [];

  return (
    <div>
      <h1 className="heading-2 mb-2">Korisnici</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Uloge, ručna dodela pristupa i pregled kupljenog sadržaja. Uloga „mentor“ daje pristup samo
        mentorskom delu admina.
      </p>
      {users.length === 0 ? (
        <EmptyState title="Još nema korisnika" />
      ) : (
        <UsersAdmin users={users} products={products} currentAdminId={profile.id} />
      )}
    </div>
  );
}
