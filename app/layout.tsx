import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/Header';
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
  title: 'Tharika Decors & Events | Luxury Event Styling & Decor',
  description:
    'Bespoke wedding stages, mandaps, baby shower themes, and luxury event styling curated with royal peacock elegance by Tharika Decors.',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className={`${inter.className} bg-[#FAF7F2] text-gray-900 antialiased min-h-screen flex flex-col`}
      >
        <Header />
        {/* pb-28 ensures content clears the fixed bottom nav on mobile; md:pb-12 for desktop */}
        <main className="flex-1 w-full pb-28 md:pb-12">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
