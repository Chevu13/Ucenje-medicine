'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  mentorshipInquirySchema,
  orderRequestSchema,
  type MentorshipInquiryInput,
  type OrderRequestInput,
} from '@/lib/validation';
import { effectivePriceCents } from '@/lib/utils';
import { isAdminDemoMode } from '@/lib/demo';
import type { Product } from '@/lib/types';

export interface CheckoutError {
  ok: false;
  error: string;
}

/**
 * GUEST ORDER FLOW (no account, no online payment).
 * A visitor leaves name, email and Instagram; Darko/Ljubica contact them to
 * arrange payment and delivery off-site. No login required, nothing is hosted
 * for the buyer on the site. Prices are ALWAYS read from the database
 * server-side — the client cart is only a list of product ids.
 */
export async function submitOrderRequest(input: OrderRequestInput): Promise<CheckoutError | never> {
  const parsed = orderRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const d = parsed.data;

  const admin = createAdminClient();

  // Load and validate products (must be published)
  const { data: productsData } = await admin
    .from('products')
    .select('*')
    .in('id', d.productIds)
    .eq('status', 'published');
  const products = (productsData as Product[] | null) ?? [];
  if (products.length === 0) return { ok: false, error: 'Proizvodi iz korpe nisu dostupni.' };

  const items = products.map((p) => ({ product: p, price: effectivePriceCents(p) ?? 0 }));
  const total = items.reduce((sum, i) => sum + i.price, 0);

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: null,
      status: 'pending',
      total_cents: total,
      currency: 'RSD',
      contact_name: d.fullName,
      contact_email: d.email,
      contact_instagram: d.instagram,
      customer_note: d.note || null,
    })
    .select('id')
    .single();
  if (orderError || !order) {
    console.error('[submitOrderRequest] order insert failed', orderError);
    const detail = isAdminDemoMode() && orderError?.message ? ` (${orderError.message})` : '';
    return { ok: false, error: `Slanje porudžbine nije uspelo. Pokušaj ponovo.${detail}` };
  }

  const { error: itemsError } = await admin.from('order_items').insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      title_snapshot: i.product.title,
      unit_price_cents: i.price,
      quantity: 1,
    }))
  );
  if (itemsError) {
    console.error('[submitOrderRequest] items insert failed', itemsError);
    const detail = isAdminDemoMode() && itemsError.message ? ` (${itemsError.message})` : '';
    return { ok: false, error: `Slanje porudžbine nije uspelo. Pokušaj ponovo.${detail}` };
  }

  redirect(`/placanje/uspesno?order=${order.id}`);
}

/**
 * MENTORSHIP INQUIRY (no account, no online payment).
 * Same idea as a product order: the visitor leaves contact details plus a
 * short description of what they need. It is stored as a pending order for
 * the active mentorship product so it shows up in Admin → Porudžbine next to
 * everything else, and Darko replies personally.
 */
export async function submitMentorshipInquiry(
  input: MentorshipInquiryInput
): Promise<CheckoutError | never> {
  const parsed = mentorshipInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const d = parsed.data;

  const admin = createAdminClient();

  // Resolve the mentorship product server-side (never trusted from the client).
  const { data: productRow } = await admin
    .from('products')
    .select('*')
    .eq('type', 'mentorship')
    .eq('status', 'published')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();
  const product = (productRow as Product | null) ?? null;

  const price = product ? (effectivePriceCents(product) ?? 0) : 0;

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: null,
      status: 'pending',
      total_cents: price,
      currency: 'RSD',
      contact_name: d.fullName,
      contact_email: d.email,
      contact_instagram: d.instagram,
      customer_note: `UPIT ZA MENTORSTVO — ${d.message}`,
    })
    .select('id')
    .single();
  if (orderError || !order) {
    console.error('[submitMentorshipInquiry] order insert failed', orderError);
    const detail = isAdminDemoMode() && orderError?.message ? ` (${orderError.message})` : '';
    return { ok: false, error: `Slanje upita nije uspelo. Pokušaj ponovo.${detail}` };
  }

  const { error: itemsError } = await admin.from('order_items').insert({
    order_id: order.id,
    product_id: product?.id ?? null,
    title_snapshot: product?.title ?? 'Mentorstvo (upit)',
    unit_price_cents: price,
    quantity: 1,
  });
  if (itemsError) {
    console.error('[submitMentorshipInquiry] item insert failed', itemsError);
    const detail = isAdminDemoMode() && itemsError.message ? ` (${itemsError.message})` : '';
    return { ok: false, error: `Slanje upita nije uspelo. Pokušaj ponovo.${detail}` };
  }

  redirect('/mentorstvo/hvala');
}

/**
 * PRODUCT INQUIRY (no account, no online payment).
 * A visitor leaves contact details for a single product (e.g. a course) plus
 * an optional message. Stored as a pending order so it appears in
 * Admin → Porudžbine; Darko then sends the links / material personally.
 */
export async function submitProductInquiry(input: {
  productId: string;
  fullName: string;
  email: string;
  instagram: string;
  message?: string;
}): Promise<CheckoutError | never> {
  const parsed = orderRequestSchema
    .pick({ fullName: true, email: true, instagram: true })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Neispravan unos.' };
  }
  const d = parsed.data;

  const admin = createAdminClient();
  const { data: productRow } = await admin
    .from('products')
    .select('*')
    .eq('id', input.productId)
    .eq('status', 'published')
    .maybeSingle();
  const product = (productRow as Product | null) ?? null;
  if (!product) return { ok: false, error: 'Proizvod nije dostupan.' };

  const price = effectivePriceCents(product) ?? 0;
  const msg = (input.message ?? '').trim();
  const note = `UPIT: ${product.title}${msg ? ` — ${msg}` : ''}`;

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: null,
      status: 'pending',
      total_cents: price,
      currency: 'RSD',
      contact_name: d.fullName,
      contact_email: d.email,
      contact_instagram: d.instagram,
      customer_note: note,
    })
    .select('id')
    .single();
  if (orderError || !order) {
    console.error('[submitProductInquiry] order insert failed', orderError);
    const detail = isAdminDemoMode() && orderError?.message ? ` (${orderError.message})` : '';
    return { ok: false, error: `Slanje upita nije uspelo. Pokušaj ponovo.${detail}` };
  }

  const { error: itemsError } = await admin.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    title_snapshot: product.title,
    unit_price_cents: price,
    quantity: 1,
  });
  if (itemsError) {
    console.error('[submitProductInquiry] item insert failed', itemsError);
    const detail = isAdminDemoMode() && itemsError.message ? ` (${itemsError.message})` : '';
    return { ok: false, error: `Slanje upita nije uspelo. Pokušaj ponovo.${detail}` };
  }

  redirect(`/placanje/uspesno?order=${order.id}`);
}
