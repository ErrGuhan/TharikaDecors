'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, MessageCircle, Calendar } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20works%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

export default function Header() {
  const pathname = usePathname();

  // Hide top header on admin & login studio pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-tharika-blue/10 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-28 sm:h-14 sm:w-36 transition-transform group-hover:scale-105 duration-300">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-gray-700">
          <Link
            href="/weddings"
            className={`hover:text-tharika-blue transition-colors ${
              pathname === '/weddings' ? 'text-tharika-blue font-bold border-b-2 border-tharika-blue pb-0.5' : ''
            }`}
          >
            Weddings
          </Link>
          <Link
            href="/baby-showers"
            className={`hover:text-tharika-blue transition-colors ${
              pathname === '/baby-showers' ? 'text-tharika-blue font-bold border-b-2 border-tharika-blue pb-0.5' : ''
            }`}
          >
            Baby Showers
          </Link>
          <Link
            href="/portfolio"
            className={`hover:text-tharika-blue transition-colors ${
              pathname === '/portfolio' ? 'text-tharika-blue font-bold border-b-2 border-tharika-blue pb-0.5' : ''
            }`}
          >
            Our Works
          </Link>
          <Link
            href="/about"
            className={`hover:text-tharika-blue transition-colors ${
              pathname === '/about' ? 'text-tharika-blue font-bold border-b-2 border-tharika-blue pb-0.5' : ''
            }`}
          >
            About Us
          </Link>
        </nav>

        {/* Action Button (Book Consultation) */}
        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-tharika-gold-gradient text-tharika-blue font-bold text-xs tracking-wider uppercase shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Calendar className="w-4 h-4 text-tharika-blue" />
            <span className="hidden sm:inline">Book Consultation</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
