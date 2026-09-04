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
    <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-[#E5B842]/30 bg-[#FCFAF7]/90 backdrop-blur-xl shadow-[0_-8px_32px_0_rgba(11,43,74,0.12)] pb-[env(safe-area-inset-bottom,0px)] transition-all">
      {/* Specular top rim line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

      <div className="mx-auto flex max-w-md items-center justify-around py-2 sm:py-2.5">
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
                className="flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold text-[#0B2B4A]/70 hover:text-[#0B2B4A] active:scale-95 transition-all group"
              >
                <div className="p-1 rounded-xl text-[#0B2B4A]/60 group-hover:text-[#0B2B4A] group-hover:bg-[#0B2B4A]/5 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] text-[#0B2B4A]/70 group-hover:text-[#0B2B4A] transition-colors">
                  {label}
                </span>
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
                  ? 'text-[#0B2B4A] font-extrabold'
                  : 'text-[#0B2B4A]/65 font-semibold hover:text-[#0B2B4A]'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-2xl transition-all duration-300 relative',
                  active
                    ? 'bg-[#0B2B4A] text-white shadow-md border border-[#E5B842]/45 scale-105'
                    : 'text-[#0B2B4A]/70 group-hover:text-[#0B2B4A] group-hover:bg-white/70'
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight">{label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] absolute -bottom-0.5 shadow-[0_0_8px_#E5B842]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
