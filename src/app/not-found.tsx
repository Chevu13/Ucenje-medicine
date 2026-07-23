import Link from 'next/link';
import { Ekg } from '@/components/Ekg';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Ekg className="mb-6 h-10 w-32 opacity-60" />
      <h1 className="text-4xl font-extrabold text-ink">404</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Stranica koju tražiš ne postoji ili je premeštena.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Nazad na početnu
      </Link>
    </div>
  );
}
