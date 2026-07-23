import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/components/cart/CartProvider';
import { siteUrl } from '@/lib/utils';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'], // č ć š ž đ
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Učenje medicine — uči pametnije, položi sigurnije',
    template: '%s | Učenje medicine',
  },
  description:
    'Kursevi, skripte, e-knjige, izazovi i mentorstvo za studente medicine — sve na jednom mestu.',
  openGraph: {
    siteName: 'Učenje medicine',
    locale: 'sr_RS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-Latn" className={inter.variable}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
