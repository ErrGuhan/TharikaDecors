'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  isExternal?: boolean;
  icon: (props: { className?: string }) => JSX.Element;
};

const WHATSAPP_BOOKING_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20works%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function PortfolioIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
      <path d="M15 9v11" />
    </svg>
  );
}

function StoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Our Works', href: '/portfolio', icon: PortfolioIcon },
  { label: 'About Us', href: '/about', icon: StoryIcon },
  {
    label: 'Book',
    href: '/book',
    isExternal: false,
    icon: BookIcon,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on admin and login studio pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200/80 bg-white/95 backdrop-blur-lg shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5 sm:py-2">
        {navItems.map(({ label, href, isExternal, icon: Icon }) => {
          const active =
            !isExternal &&
            (pathname === href || (href !== '/' && pathname.startsWith(href)));

          if (isExternal) {
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium text-slate-500 hover:text-[#0F172A] active:scale-95 transition-all group"
              >
                <div className="p-1 rounded-xl text-slate-400 group-hover:text-[#0F172A] group-hover:bg-[#0F172A]/5 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] text-slate-500 group-hover:text-[#0F172A] transition-colors">{label}</span>
              </a>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all relative group',
                active
                  ? 'text-[#0F172A] font-bold'
                  : 'text-slate-500 font-medium hover:text-[#0F172A]'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-xl transition-colors',
                  active ? 'bg-[#0F172A]/10 text-[#0F172A]' : 'text-slate-400 group-hover:text-[#0F172A]'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px]">{label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] absolute -bottom-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
