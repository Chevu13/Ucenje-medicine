/**
 * Domain types mirroring the database schema (supabase/migrations/0001_schema.sql).
 * For full end-to-end type safety you can later replace these with generated
 * types: `supabase gen types typescript --linked > src/lib/database.types.ts`.
 */

export type UserRole = 'user' | 'mentor' | 'admin';
export type ProductType = 'course' | 'ebook' | 'script' | 'mentorship' | 'challenge';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'initiated' | 'succeeded' | 'failed' | 'cancelled';
export type MentorshipMode = 'purchase' | 'application';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type EnrollmentStatus = 'active' | 'paused' | 'completed';
export type TaskStatus = 'todo' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';
export type ChallengeStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
}

export interface Product {
  id: string;
  type: ProductType;
  category_id: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  cover_url: string | null;
  price_cents: number | null;
  sale_price_cents: number | null;
  currency: string;
  is_free: boolean;
  status: ContentStatus;
  featured: boolean;
  is_demo: boolean;
  author_name: string | null;
  page_count: number | null;
  seo_title: string | null;
  seo_description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  product_id: string;
  level: string | null;
  subject: string | null;
  duration_text: string | null;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  position: number;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  summary: string | null;
  youtube_url: string | null;
  duration_minutes: number | null;
  is_free_preview: boolean;
  position: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface DigitalFile {
  id: string;
  product_id: string | null;
  bucket: string;
  storage_path: string;
  file_name: string;
  content_type: string;
  file_size_bytes: number | null;
  download_enabled: boolean;
  preview_page_count: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_instagram: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  title_snapshot: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  granted_by: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  course_id: string | null;
  lesson_id: string | null;
  category: string | null;
  shared_with_mentor: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteComment {
  id: string;
  note_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface MentorshipProgram {
  id: string;
  product_id: string;
  mode: MentorshipMode;
  weekly_session_minutes: number;
  active: boolean;
}

export interface MentorshipApplication {
  id: string;
  program_id: string;
  user_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  decided_at: string | null;
}

export interface MentorshipEnrollment {
  id: string;
  program_id: string;
  user_id: string;
  mentor_id: string | null;
  status: EnrollmentStatus;
  goals: string | null;
  study_plan: string | null;
  next_session_at: string | null;
  created_at: string;
}

export interface MentorshipSession {
  id: string;
  enrollment_id: string;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
}

export interface MentorshipTask {
  id: string;
  enrollment_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Challenge {
  id: string;
  product_id: string;
  status: ChallengeStatus;
  starts_at: string | null;
  ends_at: string | null;
  enroll_opens_at: string | null;
  enroll_closes_at: string | null;
  max_participants: number | null;
}

export interface ChallengeTask {
  id: string;
  challenge_id: string;
  day_number: number;
  title: string;
  description: string | null;
  position: number;
}

export interface ChallengeEnrollment {
  id: string;
  challenge_id: string;
  user_id: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  message: string;
  href: string | null;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  published: boolean;
  is_demo: boolean;
  position: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  published: boolean;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  image_url: string;
}

export interface ContactSettings {
  email: string;
  instagram: string;
  instagram_personal: string;
  youtube: string;
  tiktok: string;
}

export interface AboutSettings {
  headline: string;
  body: string;
  image_url: string;
}

export interface MentorshipHighlightSettings {
  image_url: string;
}

/** Product joined with its subtype rows where relevant. */
export interface ProductWithCourse extends Product {
  courses: Course[] | null;
}

export interface ModuleWithLessons extends CourseModule {
  course_lessons: CourseLesson[];
}
