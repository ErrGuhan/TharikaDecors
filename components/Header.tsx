'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calendar, Sparkles } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  // Hide top header on admin & login studio pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  const navLinks = [
    { label: 'Weddings', href: '/weddings' },
    { label: 'Baby Showers', href: '/baby-showers' },
    { label: 'Our Works', href: '/portfolio' },
    { label: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCFAF7]/85 backdrop-blur-xl border-b border-[#E5B842]/25 shadow-[0_8px_32px_0_rgba(11,43,74,0.06)] transition-all select-none">
      {/* Specular top edge highlight for optical glass realism */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Title with gentle hover scale */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-28 sm:h-14 sm:w-36 transition-transform group-hover:scale-105 duration-300 drop-shadow-sm">
            <Image
              src="/logo.png"
              alt="Tharika Decors & Events Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>

        {/* Desktop Navigation Links with Liquid Glass Pill Micro-Interactions */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-bold uppercase tracking-widest text-[#0B2B4A]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0B2B4A] text-white shadow-md border border-[#E5B842]/45'
                    : 'text-[#0B2B4A]/80 hover:text-[#0B2B4A] hover:bg-white/80 hover:border-white border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] animate-pulse" />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button (Book Consultation) with Refractive Gold Shimmer */}
        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="gold-shimmer relative inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-tharika-gold-gradient text-[#0B2B4A] font-extrabold text-xs tracking-wider uppercase shadow-[0_4px_16px_0_rgba(229,184,66,0.35)] hover:shadow-[0_6px_24px_0_rgba(229,184,66,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all border border-white/60"
          >
            <Calendar className="w-4 h-4 text-[#0B2B4A]" />
            <span className="hidden sm:inline">Book Consultation</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
