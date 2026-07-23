'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';

const NAV = [
  { href: '/kursevi', label: 'Kursevi' },
  { href: '/e-knjige', label: 'E-knjige' },
  { href: '/skripte', label: 'Skripte' },
  { href: '/mentorstvo', label: 'Mentorstvo' },
  { href: '/izazovi', label: 'Izazovi' },
  { href: '/o-darku', label: 'O Darku' },
];

export function HeaderClient({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { items, ready } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Učenje medicine — početna" onClick={() => setOpen(false)}>
          <Image src="/brand/logo.svg" alt="Učenje medicine" width={150} height={42} priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Glavna navigacija">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-surface-blue text-brand-700'
                  : 'text-ink-soft hover:bg-surface-subtle hover:text-ink'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {isAdmin ? (
            <Link
              href="/admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-surface-blue sm:block"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/korpa"
            aria-label={`Korpa${ready && items.length > 0 ? ` (${items.length})` : ''}`}
            className="relative rounded-lg p-2.5 text-ink-soft hover:bg-surface-subtle hover:text-ink"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {ready && items.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {items.length}
              </span>
            ) : null}
          </Link>
          <Link
            href={isLoggedIn ? '/nalog' : '/prijava'}
            aria-label={isLoggedIn ? 'Moj nalog' : 'Prijava'}
            className="rounded-lg p-2.5 text-ink-soft hover:bg-surface-subtle hover:text-ink"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2.5 text-ink-soft hover:bg-surface-subtle lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobilna navigacija"
          className="border-t border-brand-100 bg-white px-4 pb-4 pt-2 lg:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-lg px-3 py-3 text-base font-semibold',
                pathname.startsWith(item.href)
                  ? 'bg-surface-blue text-brand-700'
                  : 'text-ink hover:bg-surface-subtle'
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={isLoggedIn ? '/nalog' : '/prijava'}
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg bg-brand-600 px-3 py-3 text-center text-base font-semibold text-white"
          >
            {isLoggedIn ? 'Moj nalog' : 'Prijavi se'}
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-lg px-3 py-3 text-base font-semibold text-brand-700 hover:bg-surface-blue"
            >
              Admin panel
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
