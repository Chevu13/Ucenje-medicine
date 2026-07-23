'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error monitoring hook: forward to Sentry/etc. when configured.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Nešto je pošlo naopako</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Došlo je do neočekivane greške. Pokušaj ponovo — ako se greška ponavlja, javi nam se.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Pokušaj ponovo
      </button>
    </div>
  );
}
