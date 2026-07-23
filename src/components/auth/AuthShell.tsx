import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center">
          <Image src="/brand/logo.svg" alt="Učenje medicine" width={180} height={50} className="mx-auto" />
        </Link>
        <Card className="p-7 sm:p-8">
          <h1 className="mb-1 text-2xl font-extrabold text-ink">{title}</h1>
          {subtitle ? <p className="mb-6 text-sm text-ink-soft">{subtitle}</p> : <div className="mb-6" />}
          {children}
        </Card>
      </div>
    </div>
  );
}
