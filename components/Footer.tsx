'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, Phone, Mail, MapPin, ArrowUp, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin & login studio pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#FAF7F2] text-[#0A3659] border-t border-[#D4AF37]/30 pt-16 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-[#D4AF37]/10 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-12 border-b border-[#D4AF37]/20">
          {/* Col 1: Brand & Bio (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-36 sm:h-16 sm:w-44">
                <Image
                  src="/logo.png"
                  alt="Tharika Decors Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>

            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Bespoke wedding stages, royal muhurtham mandaps, traditional valaikappu setups, and luxury event styling curated with South Indian hospitality and artistic mastery.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/916384947914"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#0A3659] hover:text-emerald-700 hover:scale-105 transition-all shadow-xs"
                title="WhatsApp Direct"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href="https://www.instagram.com/tharikadecors"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#0A3659] hover:text-[#E4405F] hover:scale-105 transition-all shadow-xs"
                title="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="tel:6384947914"
                className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#0A3659] hover:text-[#D4AF37] hover:scale-105 transition-all shadow-xs"
                title="Direct Phone"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Curated Collections (3 cols) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-heading font-serif text-lg font-bold text-[#0A3659] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Collections</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <li>
                <Link href="/weddings" className="hover:text-[#D4AF37] transition-colors">
                  Wedding Mandaps &amp; Stages
                </Link>
              </li>
              <li>
                <Link href="/baby-showers" className="hover:text-[#D4AF37] transition-colors">
                  Baby Showers &amp; Valaikappu
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#D4AF37] transition-colors">
                  Complete Showcase Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D4AF37] transition-colors">
                  About Our Atelier
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-[#0A3659] hover:text-[#D4AF37] transition-colors">
                  Book A Consultation &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Location (4 cols) */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="font-heading font-serif text-lg font-bold text-[#0A3659] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Studio &amp; Inquiries</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Headquartered in Puducherry, serving all of Tamil Nadu &amp; South India.</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <a href="tel:6384947914" className="font-bold text-[#0A3659] hover:underline">
                  +91 6384947914
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <a href="mailto:campuscartsvcet@gmail.com" className="font-bold text-[#0A3659] hover:underline break-all">
                  campuscartsvcet@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and Back-to-Top row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} Tharika Decors &amp; Events. All Rights Reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="liquid-glass-pill px-4 py-2 rounded-full text-xs font-bold text-[#0A3659] hover:text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-[#D4AF37]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
