'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { audit, ensureAdmin, ensureMentorOrAdmin } from '@/lib/admin';
import { isAdminDemoMode } from '@/lib/demo';
import {
  announcementSchema,
  faqSchema,
  lessonSchema,
  mentorshipTaskSchema,
  productSchema,
  testimonialSchema,
  type ProductInput,
} from '@/lib/validation';
import type { UserRole } from '@/lib/types';

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/**
 * Logs the real Supabase error to the server console and, while
 * ADMIN_DEMO_MODE is on, appends the detail to the UI message so
 * setup problems (missing tables, wrong keys) are easy to diagnose.
 */
function dbFail(userMessage: string, error: { code?: string; message?: string } | null): Result<never> {
  console.error('[admin action]', userMessage, error);
  const detail = error?.message ? ` (${error.code ?? 'DB'}: ${error.message})` : '';
  return {
    ok: false,
    error: isAdminDemoMode() ? `${userMessage}${detail}` : userMessage,
  };
}

function revalidateCatalog() {
  revalidatePath('/', 'layout');
}

// ---------------------------------------------------------------------------
// Orders (manual payment flow)
// ---------------------------------------------------------------------------

/**
 * Marks a pending order as paid after Darko/Ljubica verify the payment
 * off-site (bank transfer / DM). This ONLY records the payment status for
 * bookkeeping — there is no library or automatic delivery. Materials are
 * sent to the buyer personally.
 */
export async function markOrderPaid(orderId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: 'Porudžbina nije pronađena.' };
  if (order.status === 'cancelled') {
    return { ok: false, error: 'Porudžbina je otkazana — ne može se označiti kao plaćena.' };
  }

  const { error: updateError } = await admin
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId);
  if (updateError) return dbFail('Ažuriranje porudžbine nije uspelo.', updateError);

  await audit(guard.profile.id, 'order.mark_paid', 'orders', orderId);
  revalidatePath('/admin/porudzbine');
  return { ok: true };
}

/** Cancels a pending order. Paid orders must be handled via manual revoke. */
export async function cancelOrder(orderId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: 'Porudžbina nije pronađena.' };
  if (order.status === 'paid') {
    return { ok: false, error: 'Plaćena porudžbina se ne otkazuje ovde — ukini pristup kod korisnika.' };
  }

  const { error } = await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
  if (error) return dbFail('Otkazivanje nije uspelo.', error);

  await audit(guard.profile.id, 'order.cancel', 'orders', orderId);
  revalidatePath('/admin/porudzbine');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export async function upsertProduct(
  input: ProductInput,
  productId?: string
): Promise<Result<{ id: string }>> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const d = parsed.data;

  const row = {
    type: d.type,
    title: d.title,
    slug: d.slug,
    short_description: d.shortDescription || null,
    description: d.description || null,
    cover_url: d.coverUrl || null,
    price_cents: d.priceRsd != null ? d.priceRsd * 100 : null,
    sale_price_cents: d.salePriceRsd != null ? d.salePriceRsd * 100 : null,
    is_free: d.isFree,
    status: d.status,
    featured: d.featured,
    author_name: d.authorName || null,
    page_count: d.pageCount ?? null,
    seo_title: d.seoTitle || null,
    seo_description: d.seoDescription || null,
    // Editing content through the admin panel clears the demo flag.
    is_demo: false,
  };

  const admin = createAdminClient();

  if (productId) {
    const { error } = await admin.from('products').update(row).eq('id', productId);
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Slug je zauzet.' };
      return dbFail('Čuvanje nije uspelo.', error);
    }
    await audit(guard.profile.id, 'product.update', 'products', productId);
    revalidateCatalog();
    return { ok: true, data: { id: productId } };
  }

  const { data, error } = await admin.from('products').insert(row).select('id').single();
  if (error || !data) {
    if (error?.code === '23505') return { ok: false, error: 'Slug je zauzet.' };
    return dbFail('Kreiranje nije uspelo.', error);
  }

  // Create the subtype row automatically
  if (d.type === 'course') {
    await admin.from('courses').insert({ product_id: data.id });
  } else if (d.type === 'challenge') {
    await admin.from('challenges').insert({ product_id: data.id, status: 'draft' });
  } else if (d.type === 'mentorship') {
    await admin.from('mentorship_programs').insert({ product_id: data.id });
  }

  await audit(guard.profile.id, 'product.create', 'products', data.id);
  revalidateCatalog();
  return { ok: true, data: { id: data.id } };
}

export async function deleteProduct(productId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', productId);
  if (error) {
    return {
      ok: false,
      error:
        'Brisanje nije uspelo. Ako proizvod ima porudžbine, arhiviraj ga umesto brisanja (status → arhivirano).',
    };
  }
  await audit(guard.profile.id, 'product.delete', 'products', productId);
  revalidateCatalog();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Course curriculum
// ---------------------------------------------------------------------------
export async function createModule(courseId: string, title: string, position: number): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  if (!title.trim()) return { ok: false, error: 'Unesi naziv modula.' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('course_modules')
    .insert({ course_id: courseId, title: title.trim(), position });
  if (error) return { ok: false, error: 'Kreiranje modula nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function updateModule(moduleId: string, title: string, position: number): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin
    .from('course_modules')
    .update({ title: title.trim(), position })
    .eq('id', moduleId);
  if (error) return { ok: false, error: 'Čuvanje modula nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteModule(moduleId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('course_modules').delete().eq('id', moduleId);
  if (error) return { ok: false, error: 'Brisanje modula nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function upsertLesson(
  input: unknown,
  lessonId?: string
): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos lekcije.' };
  }
  const d = parsed.data;
  const row = {
    module_id: d.moduleId,
    title: d.title,
    slug: d.slug,
    summary: d.summary || null,
    youtube_url: d.youtubeUrl || null,
    duration_minutes: d.durationMinutes ?? null,
    is_free_preview: d.isFreePreview,
    position: d.position,
  };

  const admin = createAdminClient();
  const { error } = lessonId
    ? await admin.from('course_lessons').update(row).eq('id', lessonId)
    : await admin.from('course_lessons').insert(row);
  if (error) return { ok: false, error: 'Čuvanje lekcije nije uspelo (proveri slug).' };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteLesson(lessonId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('course_lessons').delete().eq('id', lessonId);
  if (error) return { ok: false, error: 'Brisanje lekcije nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------
export async function updateChallengeMeta(
  challengeId: string,
  fields: {
    status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
    startsAt: string | null;
    endsAt: string | null;
    enrollOpensAt: string | null;
    enrollClosesAt: string | null;
    maxParticipants: number | null;
  }
): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin
    .from('challenges')
    .update({
      status: fields.status,
      starts_at: fields.startsAt,
      ends_at: fields.endsAt,
      enroll_opens_at: fields.enrollOpensAt,
      enroll_closes_at: fields.enrollClosesAt,
      max_participants: fields.maxParticipants,
    })
    .eq('id', challengeId);
  if (error) return { ok: false, error: 'Čuvanje izazova nije uspelo.' };
  await audit(guard.profile.id, 'challenge.update', 'challenges', challengeId);
  revalidateCatalog();
  return { ok: true };
}

export async function upsertChallengeTask(
  input: { challengeId: string; dayNumber: number; title: string; description: string | null },
  taskId?: string
): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  if (!input.title.trim()) return { ok: false, error: 'Unesi naziv zadatka.' };

  const admin = createAdminClient();
  const row = {
    challenge_id: input.challengeId,
    day_number: Math.max(1, input.dayNumber),
    title: input.title.trim(),
    description: input.description,
  };
  const { error } = taskId
    ? await admin.from('challenge_tasks').update(row).eq('id', taskId)
    : await admin.from('challenge_tasks').insert(row);
  if (error) return { ok: false, error: 'Čuvanje zadatka nije uspelo.' };
  revalidatePath('/admin/izazovi');
  return { ok: true };
}

export async function deleteChallengeTask(taskId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('challenge_tasks').delete().eq('id', taskId);
  if (error) return { ok: false, error: 'Brisanje zadatka nije uspelo.' };
  revalidatePath('/admin/izazovi');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Mentorship (admin/mentor)
// ---------------------------------------------------------------------------
export async function decideApplication(
  applicationId: string,
  approve: boolean
): Promise<Result> {
  const guard = await ensureMentorOrAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { data: app } = await admin
    .from('mentorship_applications')
    .select('id, program_id, user_id, status')
    .eq('id', applicationId)
    .maybeSingle();
  if (!app) return { ok: false, error: 'Prijava nije pronađena.' };

  const { error } = await admin
    .from('mentorship_applications')
    .update({
      status: approve ? 'approved' : 'rejected',
      decided_at: new Date().toISOString(),
      decided_by: guard.profile.id,
    })
    .eq('id', applicationId);
  if (error) return { ok: false, error: 'Čuvanje odluke nije uspelo.' };

  if (approve) {
    await admin.from('mentorship_enrollments').upsert(
      {
        program_id: app.program_id,
        user_id: app.user_id,
        mentor_id: guard.profile.id,
      },
      { onConflict: 'program_id,user_id', ignoreDuplicates: true }
    );
  }

  await audit(guard.profile.id, approve ? 'mentorship.approve' : 'mentorship.reject', 'mentorship_applications', applicationId);
  revalidatePath('/admin/mentorstvo');
  return { ok: true };
}

export async function updateEnrollmentAdmin(
  enrollmentId: string,
  fields: { status?: 'active' | 'paused' | 'completed'; nextSessionAt?: string | null }
): Promise<Result> {
  const guard = await ensureMentorOrAdmin();
  if (!guard.ok) return guard;

  const patch: Record<string, unknown> = {};
  if (fields.status) patch.status = fields.status;
  if (fields.nextSessionAt !== undefined) patch.next_session_at = fields.nextSessionAt;

  const admin = createAdminClient();
  const { error } = await admin.from('mentorship_enrollments').update(patch).eq('id', enrollmentId);
  if (error) return { ok: false, error: 'Čuvanje nije uspelo.' };
  revalidatePath('/admin/mentorstvo');
  return { ok: true };
}

export async function createMentorshipTask(input: {
  enrollmentId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: 'low' | 'normal' | 'high';
}): Promise<Result> {
  const guard = await ensureMentorOrAdmin();
  if (!guard.ok) return guard;

  const parsed = mentorshipTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }

  const admin = createAdminClient();
  const { error } = await admin.from('mentorship_tasks').insert({
    enrollment_id: parsed.data.enrollmentId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    due_at: parsed.data.dueAt || null,
    priority: parsed.data.priority,
    created_by: guard.profile.id,
  });
  if (error) return { ok: false, error: 'Kreiranje zadatka nije uspelo.' };
  revalidatePath('/admin/mentorstvo');
  return { ok: true };
}

export async function deleteMentorshipTask(taskId: string): Promise<Result> {
  const guard = await ensureMentorOrAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('mentorship_tasks').delete().eq('id', taskId);
  if (error) return { ok: false, error: 'Brisanje nije uspelo.' };
  revalidatePath('/admin/mentorstvo');
  return { ok: true };
}

export async function addMentorshipSession(input: {
  enrollmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  notes: string | null;
}): Promise<Result> {
  const guard = await ensureMentorOrAdmin();
  if (!guard.ok) return guard;
  if (!input.scheduledAt) return { ok: false, error: 'Unesi termin.' };

  const admin = createAdminClient();
  const { error } = await admin.from('mentorship_sessions').insert({
    enrollment_id: input.enrollmentId,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes || 60,
    notes: input.notes,
  });
  if (error) return { ok: false, error: 'Čuvanje konsultacije nije uspelo.' };
  revalidatePath('/admin/mentorstvo');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Users & entitlements
// ---------------------------------------------------------------------------
export async function setUserRole(userId: string, role: UserRole): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  if (userId === guard.profile.id) {
    return { ok: false, error: 'Ne možeš menjati sopstvenu ulogu.' };
  }

  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ role }).eq('id', userId);
  if (error) return { ok: false, error: 'Promena uloge nije uspela.' };
  await audit(guard.profile.id, 'user.role', 'profiles', userId, { role });
  revalidatePath('/admin/korisnici');
  return { ok: true };
}

export async function grantEntitlement(userId: string, productId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin.from('entitlements').upsert(
    { user_id: userId, product_id: productId, granted_by: guard.profile.id, revoked_at: null },
    { onConflict: 'user_id,product_id' }
  );
  if (error) return { ok: false, error: 'Dodela pristupa nije uspela.' };
  await audit(guard.profile.id, 'entitlement.grant', 'entitlements', `${userId}:${productId}`);
  revalidatePath('/admin/korisnici');
  return { ok: true };
}

export async function revokeEntitlement(entitlementId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin
    .from('entitlements')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', entitlementId);
  if (error) return { ok: false, error: 'Ukidanje pristupa nije uspelo.' };
  await audit(guard.profile.id, 'entitlement.revoke', 'entitlements', entitlementId);
  revalidatePath('/admin/korisnici');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Site content: settings, announcements, FAQs, testimonials
// ---------------------------------------------------------------------------
export async function saveSetting(key: string, value: Record<string, unknown>): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  if (!['hero', 'about', 'mentorship_highlight', 'contact', 'seo'].includes(key)) {
    return { ok: false, error: 'Nepoznato podešavanje.' };
  }

  const admin = createAdminClient();
  const { error } = await admin.from('site_settings').upsert({ key, value });
  if (error) return { ok: false, error: 'Čuvanje nije uspelo.' };
  await audit(guard.profile.id, 'settings.save', 'site_settings', key);
  revalidateCatalog();
  return { ok: true };
}

export async function upsertAnnouncement(
  input: { message: string; href: string | null; active: boolean },
  id?: string
): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };

  const admin = createAdminClient();
  // Only one active announcement at a time
  if (parsed.data.active) {
    await admin.from('announcements').update({ active: false }).eq('active', true);
  }
  const row = { message: parsed.data.message, href: parsed.data.href || null, active: parsed.data.active };
  const { error } = id
    ? await admin.from('announcements').update(row).eq('id', id)
    : await admin.from('announcements').insert(row);
  if (error) return { ok: false, error: 'Čuvanje najave nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('announcements').delete().eq('id', id);
  if (error) return { ok: false, error: 'Brisanje nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function upsertFaq(
  input: { question: string; answer: string; category: string; position: number; published: boolean },
  id?: string
): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };

  const admin = createAdminClient();
  const { error } = id
    ? await admin.from('faqs').update(parsed.data).eq('id', id)
    : await admin.from('faqs').insert(parsed.data);
  if (error) return { ok: false, error: 'Čuvanje pitanja nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteFaq(id: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('faqs').delete().eq('id', id);
  if (error) return { ok: false, error: 'Brisanje nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function upsertTestimonial(
  input: { name: string; role: string | null; content: string; published: boolean },
  id?: string
): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };

  const admin = createAdminClient();
  const row = { ...parsed.data, role: parsed.data.role ?? null, is_demo: false };
  const { error } = id
    ? await admin.from('testimonials').update(row).eq('id', id)
    : await admin.from('testimonials').insert(row);
  if (error) return { ok: false, error: 'Čuvanje utiska nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin.from('testimonials').delete().eq('id', id);
  if (error) return { ok: false, error: 'Brisanje nije uspelo.' };
  revalidateCatalog();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Files (protected PDFs + public covers)
// ---------------------------------------------------------------------------
const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadDigitalFile(formData: FormData): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const productId = String(formData.get('productId') ?? '');
  const file = formData.get('file');
  const downloadEnabled = formData.get('downloadEnabled') === 'on';
  if (!productId || !(file instanceof File)) return { ok: false, error: 'Izaberi proizvod i fajl.' };
  if (file.type !== 'application/pdf') return { ok: false, error: 'Dozvoljen je samo PDF.' };
  if (file.size > MAX_PDF_BYTES) return { ok: false, error: 'Fajl je veći od 50 MB.' };

  const admin = createAdminClient();
  const path = `${productId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
  const { error: uploadError } = await admin.storage
    .from('protected-files')
    .upload(path, file, { contentType: 'application/pdf' });
  if (uploadError) return { ok: false, error: 'Otpremanje nije uspelo.' };

  const { error } = await admin.from('digital_files').insert({
    product_id: productId,
    bucket: 'protected-files',
    storage_path: path,
    file_name: file.name,
    content_type: 'application/pdf',
    file_size_bytes: file.size,
    download_enabled: downloadEnabled,
  });
  if (error) return { ok: false, error: 'Upis fajla nije uspeo.' };
  await audit(guard.profile.id, 'file.upload', 'digital_files', path);
  revalidatePath('/admin/fajlovi');
  return { ok: true };
}

export async function deleteDigitalFile(fileId: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { data: file } = await admin.from('digital_files').select('*').eq('id', fileId).maybeSingle();
  if (!file) return { ok: false, error: 'Fajl nije pronađen.' };

  await admin.storage.from(file.bucket).remove([file.storage_path]);
  const { error } = await admin.from('digital_files').delete().eq('id', fileId);
  if (error) return { ok: false, error: 'Brisanje nije uspelo.' };
  await audit(guard.profile.id, 'file.delete', 'digital_files', fileId);
  revalidatePath('/admin/fajlovi');
  return { ok: true };
}

export async function setFileDownloadEnabled(fileId: string, enabled: boolean): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;
  const admin = createAdminClient();
  const { error } = await admin
    .from('digital_files')
    .update({ download_enabled: enabled })
    .eq('id', fileId);
  if (error) return { ok: false, error: 'Čuvanje nije uspelo.' };
  revalidatePath('/admin/fajlovi');
  return { ok: true };
}

/** Upload a cover/media image to the public bucket; returns its public URL. */
export async function uploadCoverImage(formData: FormData): Promise<Result<{ url: string }>> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'Izaberi sliku.' };
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    return { ok: false, error: 'Dozvoljeni formati: JPG, PNG, WEBP, SVG.' };
  }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Slika je veća od 5 MB.' };

  const admin = createAdminClient();
  const path = `covers/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
  const { error } = await admin.storage.from('covers').upload(path, file, { contentType: file.type });
  if (error) return { ok: false, error: 'Otpremanje nije uspelo.' };

  const { data } = admin.storage.from('covers').getPublicUrl(path);
  await admin.from('media_assets').insert({ bucket: 'covers', path, uploaded_by: guard.profile.id });
  return { ok: true, data: { url: data.publicUrl } };
}

/**
 * Sets (or clears) a product's cover image — the picture shown on the site
 * in listings and on the product page. Pass an empty string to remove it.
 */
export async function setProductCover(productId: string, coverUrl: string): Promise<Result> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({ cover_url: coverUrl || null })
    .eq('id', productId);
  if (error) return dbFail('Čuvanje slike nije uspelo.', error);

  await audit(guard.profile.id, 'product.set_cover', 'products', productId);
  revalidatePath('/admin/fajlovi');
  revalidatePath('/admin/proizvodi');
  return { ok: true };
}
