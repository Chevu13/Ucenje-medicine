import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DigitalFile } from '@/lib/types';

/**
 * Protected file access.
 * 1. Authenticates the user.
 * 2. Verifies an active entitlement for the file's product (or admin role).
 * 3. Issues a SHORT-LIVED signed URL for the private bucket and redirects.
 *
 * Files are never publicly reachable — the bucket has no client policies.
 * ?download=1 forces attachment download when the file allows it.
 */
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Prijava je obavezna.' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: fileData } = await admin
    .from('digital_files')
    .select('*')
    .eq('id', params.fileId)
    .maybeSingle();
  const file = fileData as DigitalFile | null;
  if (!file || !file.product_id) {
    return NextResponse.json({ error: 'Fajl nije pronađen.' }, { status: 404 });
  }

  // Access check: active entitlement OR admin
  const [{ data: entitlement }, { data: profile }] = await Promise.all([
    admin
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', file.product_id)
      .is('revoked_at', null)
      .maybeSingle(),
    admin.from('profiles').select('role').eq('id', user.id).single(),
  ]);

  const isAdmin = (profile as { role?: string } | null)?.role === 'admin';
  if (!entitlement && !isAdmin) {
    return NextResponse.json({ error: 'Nemaš pristup ovom fajlu.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const wantsDownload = url.searchParams.get('download') === '1';
  if (wantsDownload && !file.download_enabled && !isAdmin) {
    return NextResponse.json({ error: 'Preuzimanje nije omogućeno za ovaj fajl.' }, { status: 403 });
  }

  const { data: signed, error } = await admin.storage
    .from(file.bucket)
    .createSignedUrl(file.storage_path, 60, {
      download: wantsDownload ? file.file_name : undefined,
    });

  if (error || !signed) {
    return NextResponse.json(
      { error: 'Fajl trenutno nije dostupan (da li je otpremljen u bucket?).' },
      { status: 404 }
    );
  }

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
