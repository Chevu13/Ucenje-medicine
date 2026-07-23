import { FilesManager, type FileRow } from '@/components/admin/FilesManager';
import { ProductCoversManager, type CoverRow } from '@/components/admin/ProductCoversManager';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

export default async function AdminFilesPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: filesData }, { data: productsData }, { data: coversData }] = await Promise.all([
    admin
      .from('digital_files')
      .select('*, product:products(title, cover_url)')
      .order('created_at', { ascending: false }),
    admin
      .from('products')
      .select('id, title')
      .in('type', ['ebook', 'script', 'mentorship', 'challenge'])
      .order('title'),
    // Covers can be set for every product type, PDF or not.
    admin.from('products').select('id, title, type, cover_url').order('type').order('title'),
  ]);

  const files = (filesData as unknown as FileRow[]) ?? [];
  const products = (productsData as Pick<Product, 'id' | 'title'>[] | null) ?? [];
  const covers = (coversData as CoverRow[] | null) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="heading-2">Fajlovi i slike</h1>
      <ProductCoversManager products={covers} />
      <FilesManager files={files} products={products} />
    </div>
  );
}
