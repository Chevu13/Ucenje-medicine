import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Unesi ime i prezime').max(120),
  email: z.string().email('Unesi ispravnu email adresu'),
  password: z.string().min(8, 'Lozinka mora imati bar 8 karaktera').max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Unesi ispravnu email adresu'),
  password: z.string().min(1, 'Unesi lozinku'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const resetRequestSchema = z.object({
  email: z.string().email('Unesi ispravnu email adresu'),
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, 'Lozinka mora imati bar 8 karaktera').max(72),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Unesi ime i prezime').max(120),
});

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
export const noteSchema = z.object({
  title: z.string().max(200).default(''),
  content: z.string().max(50_000).default(''),
  category: z.string().max(80).nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
  lessonId: z.string().uuid().nullable().optional(),
  sharedWithMentor: z.boolean().default(false),
});
export type NoteInput = z.infer<typeof noteSchema>;

export const noteCommentSchema = z.object({
  noteId: z.string().uuid(),
  content: z.string().min(1, 'Komentar ne može biti prazan').max(5000),
});

// ---------------------------------------------------------------------------
// Contact / newsletter / mentorship
// ---------------------------------------------------------------------------
export const contactSchema = z.object({
  name: z.string().min(2, 'Unesi ime').max(120),
  email: z.string().email('Unesi ispravnu email adresu'),
  message: z.string().min(10, 'Poruka je prekratka').max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email('Unesi ispravnu email adresu'),
});

export const mentorshipApplicationSchema = z.object({
  message: z.string().min(20, 'Napiši nam nešto više o sebi i ciljevima (bar 20 karaktera)').max(3000),
});

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
export const checkoutSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'Korpa je prazna').max(20),
});

export const mentorshipInquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Unesi ime i prezime.').max(120),
  email: z.string().trim().email('Unesi ispravan mejl.').max(200),
  instagram: z
    .string()
    .trim()
    .min(2, 'Unesi Instagram korisničko ime.')
    .max(60)
    .transform((v) => v.replace(/^@+/, '')),
  message: z
    .string()
    .trim()
    .min(10, 'Napiši par rečenica o tome šta ti treba.')
    .max(2000),
});
export type MentorshipInquiryInput = z.infer<typeof mentorshipInquirySchema>;

export const orderRequestSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'Korpa je prazna').max(20),
  fullName: z.string().trim().min(2, 'Unesi ime i prezime.').max(120),
  email: z.string().trim().email('Unesi ispravan mejl.').max(200),
  instagram: z
    .string()
    .trim()
    .min(2, 'Unesi Instagram korisničko ime.')
    .max(60)
    .transform((v) => v.replace(/^@+/, '')),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
});
export type OrderRequestInput = z.infer<typeof orderRequestSchema>;

// ---------------------------------------------------------------------------
// Admin — products & content
// ---------------------------------------------------------------------------
export const productSchema = z.object({
  type: z.enum(['course', 'ebook', 'script', 'mentorship', 'challenge']),
  title: z.string().min(2, 'Unesi naziv').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug sme da sadrži samo mala slova, brojeve i crtice'),
  shortDescription: z.string().max(300).nullable().optional(),
  description: z.string().max(20_000).nullable().optional(),
  coverUrl: z.string().url('Unesi ispravan URL').nullable().optional().or(z.literal('')),
  priceRsd: z.coerce.number().int().min(0).nullable().optional(),
  salePriceRsd: z.coerce.number().int().min(0).nullable().optional(),
  isFree: z.coerce.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.coerce.boolean().default(false),
  authorName: z.string().max(120).nullable().optional(),
  pageCount: z.coerce.number().int().min(0).nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const lessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().max(2000).nullable().optional(),
  youtubeUrl: z.string().max(500).nullable().optional(),
  durationMinutes: z.coerce.number().int().min(0).nullable().optional(),
  isFreePreview: z.coerce.boolean().default(false),
  position: z.coerce.number().int().min(0).default(0),
});

export const mentorshipTaskSchema = z.object({
  enrollmentId: z.string().uuid(),
  title: z.string().min(1, 'Unesi naziv zadatka').max(200),
  description: z.string().max(5000).nullable().optional(),
  dueAt: z.string().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

export const faqSchema = z.object({
  question: z.string().min(3).max(500),
  answer: z.string().min(3).max(5000),
  category: z.string().max(80).default('opste'),
  position: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(120).nullable().optional(),
  content: z.string().min(3).max(2000),
  published: z.coerce.boolean().default(false),
});

export const announcementSchema = z.object({
  message: z.string().min(3).max(300),
  href: z.string().max(300).nullable().optional(),
  active: z.coerce.boolean().default(false),
});
