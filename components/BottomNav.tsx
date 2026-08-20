'use client';

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
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

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

function ProcessIcon({ className }: { className?: string }) {
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
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="6" cy="18" r="2" />
      <path d="M8 6h8" />
      <path d="M18 8v8" />
      <path d="M8 18h8" />
      <path d="M6 8v8" />
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
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 5v14" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Portfolio', href: '/portfolio', icon: PortfolioIcon },
  { label: 'Process', href: '/process', icon: ProcessIcon },
  {
    label: 'Book',
    href: WHATSAPP_BOOKING_URL,
    isExternal: true,
    icon: BookIcon,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on admin and login pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-tharika-peacock-blue/10 bg-white shadow-md">
      <div className="mx-auto flex max-w-md items-center justify-around py-3">
        {navItems.map(({ label, href, isExternal, icon: Icon }) => {
          const active =
            !isExternal &&
            (pathname === href || pathname.startsWith(`${href}/`));

          if (isExternal) {
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[64px] flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-tharika-peacock-blue/80 hover:text-tharika-peacock-blue hover:scale-105 transition-all"
              >
                <Icon className="h-6 w-6 text-tharika-gold" />
                <span className="font-semibold text-tharika-peacock-blue">{label}</span>
              </a>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                active
                  ? 'text-tharika-peacock-blue font-semibold'
                  : 'text-gray-400 hover:text-tharika-peacock-blue',
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
