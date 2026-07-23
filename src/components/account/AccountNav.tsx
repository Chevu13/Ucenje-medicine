'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import {
  LayoutDashboard,
  Library,
  GraduationCap,
  NotebookPen,
  Users,
  Flag,
  Receipt,
  Settings,
  LogOut,
} from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/nalog', label: 'Pregled', icon: LayoutDashboard, exact: true },
  { href: '/nalog/biblioteka', label: 'Moja biblioteka', icon: Library },
  { href: '/nalog/kursevi', label: 'Moji kursevi', icon: GraduationCap },
  { href: '/nalog/beleske', label: 'Beleške', icon: NotebookPen },
  { href: '/nalog/mentorstvo', label: 'Mentorstvo', icon: Users },
  { href: '/nalog/izazovi', label: 'Izazovi', icon: Flag },
  { href: '/nalog/kupovine', label: 'Kupovine', icon: Receipt },
  { href: '/nalog/podesavanja', label: 'Podešavanja', icon: Settings },
];

export function AccountNav({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <aside>
      <p className="mb-4 hidden truncate text-sm font-bold text-ink lg:block">
        {fullName || 'Moj nalog'}
      </p>
      <nav
        aria-label="Navigacija naloga"
        className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-soft hover:bg-surface-blue hover:text-ink'
              )}
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => signOut())}
          className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {pending ? 'Odjava…' : 'Odjavi se'}
        </button>
      </nav>
    </aside>
  );
}
