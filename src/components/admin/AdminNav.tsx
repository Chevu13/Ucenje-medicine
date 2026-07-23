'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  GraduationCap,
  Flag,
  Users,
  UserCog,
  Receipt,
  PanelsTopLeft,
  FileUp,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Pregled', icon: LayoutDashboard, exact: true, adminOnly: true },
  { href: '/admin/proizvodi', label: 'Proizvodi', icon: Package, adminOnly: true },
  { href: '/admin/kursevi', label: 'Kursevi', icon: GraduationCap, adminOnly: true },
  { href: '/admin/izazovi', label: 'Izazovi', icon: Flag, adminOnly: true },
  { href: '/admin/mentorstvo', label: 'Mentorstvo', icon: Users, adminOnly: false },
  { href: '/admin/korisnici', label: 'Korisnici', icon: UserCog, adminOnly: true },
  { href: '/admin/porudzbine', label: 'Porudžbine', icon: Receipt, adminOnly: true },
  { href: '/admin/sadrzaj', label: 'Sadržaj sajta', icon: PanelsTopLeft, adminOnly: true },
  { href: '/admin/fajlovi', label: 'Fajlovi i slike', icon: FileUp, adminOnly: true },
  { href: '/admin/podesavanja', label: 'Podešavanja', icon: Settings, adminOnly: true },
];

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = ADMIN_LINKS.filter((l) => isAdmin || !l.adminOnly);

  return (
    <nav
      aria-label="Admin navigacija"
      className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
              active ? 'bg-brand-600 text-white' : 'text-ink-soft hover:bg-white hover:text-ink'
            )}
          >
            <link.icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
