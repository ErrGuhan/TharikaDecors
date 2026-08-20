import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import BottomNav from '@/components/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tharika Decors',
  description: 'Tharika Decors — Bespoke and luxurious event styling & decor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body
        className={`${inter.className} bg-[#FAFAFA] text-gray-900 antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
