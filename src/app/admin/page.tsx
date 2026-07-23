import Link from 'next/link';
import { Card } from '@/components/ui';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [products, users, orders, paidOrders, applications, subscribers] = await Promise.all([
    admin.from('products').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('total_cents').eq('status', 'paid'),
    admin.from('mentorship_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
  ]);

  const revenue = ((paidOrders.data as { total_cents: number }[] | null) ?? []).reduce(
    (sum, o) => sum + o.total_cents,
    0
  );

  const stats = [
    { label: 'Proizvoda', value: String(products.count ?? 0), href: '/admin/proizvodi' },
    { label: 'Korisnika', value: String(users.count ?? 0), href: '/admin/korisnici' },
    { label: 'Porudžbina', value: String(orders.count ?? 0), href: '/admin/porudzbine' },
    { label: 'Prihod (plaćeno)', value: formatPrice(revenue), href: '/admin/porudzbine' },
    { label: 'Prijave za mentorstvo', value: String(applications.count ?? 0), href: '/admin/mentorstvo' },
    { label: 'Newsletter pretplatnika', value: String(subscribers.count ?? 0), href: '/admin/podesavanja' },
  ];

  return (
    <div>
      <h1 className="heading-2 mb-6">Pregled</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-shadow hover:shadow-lift">
              <p className="text-2xl font-extrabold text-brand-700">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-ink-soft">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-6 p-5 text-sm text-ink-soft">
        Podsetnik: sadržaj označen kao „Demo sadržaj“ na sajtu treba zameniti pravim opisima,
        cenama i fajlovima pre objavljivanja. Sve se menja u sekcijama Proizvodi, Sadržaj sajta i
        Fajlovi.
      </Card>
    </div>
  );
}
