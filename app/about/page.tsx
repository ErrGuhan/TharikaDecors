'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Award,
  Star,
  Heart,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Compass,
  Crown,
} from 'lucide-react';

const stats = [
  { icon: Award, label: '8+ Years', sub: 'of Master Craftsmanship' },
  { icon: Star, label: '500+', sub: 'Luxury Events Curated' },
  { icon: Heart, label: '100%', sub: 'Bespoke Custom Styling' },
  { icon: MapPin, label: 'Puducherry & TN', sub: 'Serving All South India' },
];

const pillars = [
  {
    icon: Crown,
    title: 'Royal Mandaps & Floral Architecture',
    desc: 'Grand muhurtham stages draped in fragrant south Indian jasmine, golden brass bells, authentic thali motifs, and opulent temple archways.',
  },
  {
    icon: Sparkles,
    title: 'Intimate Ceremonies & Milestones',
    desc: 'Bespoke valaikappu bangle backdrops, lotus blooms, ear piercing thrones, and baby showers designed with delicate cultural storytelling.',
  },
  {
    icon: Compass,
    title: 'End-to-End Bespoke Execution',
    desc: 'From initial 3D visualization to flawless day-of installation and breakdown, our dedicated design directors orchestrate every petal.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12 overflow-hidden">
      {/* ── 1. Full-Width Visual Hero Section with Golden Caustics ── */}
      <section className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] overflow-hidden flex items-center justify-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 bg-slate-950">
          <Image
            src="https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920"
            alt="Tharika Decors Luxury Stage Scenography"
            fill
            priority={true}
            fetchPriority="high"
            sizes="100vw"
            quality={80}
            className="object-cover object-center scale-105"
          />
        </div>

        {/* Ambient Moving Gold Caustic Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.45) 0%, rgba(10, 54, 89, 0.25) 60%, transparent 85%)',
          }}
          aria-hidden="true"
        />

        {/* Rich Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />

        {/* Hero Text Overlays */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-[#D4AF37]/50 text-[#FCF6BA] text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Puducherry &bull; Tamil Nadu &bull; South India</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
          >
            About Tharika Decors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/95 font-light leading-relaxed drop-shadow"
          >
            Crafting royal moments, traditional soul, and breathtaking event scenography across South India.
          </motion.p>
        </div>
      </section>

      {/* ── 2. Story & Heritage Section ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Intro Highlight Box */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-extrabold uppercase tracking-[0.25em] text-[#0A3659]/70 mb-2">
            Our Heritage &amp; Roots
          </span>
          <h2 className="font-heading font-serif text-3xl sm:text-5xl font-bold text-[#0A3659]">
            Tradition Infused With Modern Grandeur
          </h2>

          {/* Elegant Gold Divider */}
          <div className="w-20 h-1 rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-6 opacity-90 shadow-sm" />

          <p className="text-base sm:text-lg text-[#0A3659]/80 leading-relaxed font-normal">
            <strong>Based in the heart of Puducherry</strong>, Tharika Decors &amp; Events has been transforming celebrations across Tamil Nadu and South India for over eight years.
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            From grand royal muhurtham mandaps draped in fragrant jasmine and golden brass bells, to intimate baby shower stages adorned with auspicious glass bangles and lotus blooms — every stage is handcrafted with meticulous intention and deep love.
          </p>
        </motion.div>

        {/* ── 3. Elevated Stat Cards (Refractive Liquid Glass) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20"
        >
          {stats.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="liquid-glass-card flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl transition-all duration-300 hover:scale-[1.03] hover:border-[#D4AF37]/60 group text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A3659]/5 border border-[#D4AF37]/30 text-[#D4AF37] mb-3 group-hover:scale-110 group-hover:bg-[#0A3659] group-hover:text-white transition-all shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-heading font-serif text-2xl sm:text-3xl font-bold text-[#0A3659]">
                {label}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                {sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── 4. Vision & Mission (Frosted Liquid Glass Panels) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-20">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="liquid-glass-card p-8 sm:p-10 rounded-3xl flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A3659]/5 text-[#0A3659] text-xs font-extrabold uppercase tracking-wider mb-4 border border-[#0A3659]/10">
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                <span>Our Vision</span>
              </div>
              <h3 className="font-heading font-serif text-2xl sm:text-3xl font-bold text-[#0A3659] mb-3.5">
                Elevating Cultural Milestones
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be the premier bespoke event decoration atelier in South India, celebrated for preserving sacred traditional roots while innovating with ethereal, contemporary luxury styling that leaves lasting royal impressions.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#D4AF37]/20 flex items-center gap-2 text-xs font-bold text-[#0A3659]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Timeless Indian Aesthetics</span>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="liquid-glass-card p-8 sm:p-10 rounded-3xl flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A3659]/5 text-[#0A3659] text-xs font-extrabold uppercase tracking-wider mb-4 border border-[#0A3659]/10">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>Our Mission</span>
              </div>
              <h3 className="font-heading font-serif text-2xl sm:text-3xl font-bold text-[#0A3659] mb-3.5">
                Precision, Passion &amp; Warmth
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To turn every family&apos;s dream celebration into a stress-free masterpiece. We combine authentic floral mastery, bespoke structural design, transparent pricing, and punctual execution with warm South Indian hospitality.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#D4AF37]/20 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Dedicated Execution</span>
            </div>
          </motion.div>
        </div>

        {/* ── 5. What Sets Us Apart (3 Pillars) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#0A3659]/60">
              The Tharika Signature
            </span>
            <h3 className="mt-2 font-heading font-serif text-3xl sm:text-4xl font-bold text-[#0A3659]">
              Why Families Trust Us
            </h3>
            <div className="w-16 h-1 rounded-full bg-[#D4AF37] mx-auto mt-4 opacity-80" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="liquid-glass-card p-7 sm:p-8 rounded-3xl hover:border-[#D4AF37]/60 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0A3659] text-[#D4AF37] flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-serif text-xl font-bold text-[#0A3659] mb-2.5">
                  {title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 6. Contact & Consultation Sanctuary Callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="liquid-glass-card-dark rounded-3xl p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/25 via-transparent to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-[#FCF6BA] text-xs font-bold uppercase tracking-widest border border-white/20 mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Let&apos;s Create Your Dream Event</span>
            </span>

            <h3 className="font-heading font-serif text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to Craft Magic Together?
            </h3>

            <p className="text-sm sm:text-base text-slate-200 mb-8 leading-relaxed max-w-xl mx-auto">
              Connect with our design directors for date availability, tailored packages, and personalized stage conceptualization in Puducherry &amp; across Tamil Nadu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="gold-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-tharika-gold-gradient text-[#0A3659] font-extrabold text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(191,149,63,0.4)] hover:scale-105 active:scale-95 transition-all border border-white/50"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20would%20like%20to%20inquire%20about%20event%20decor%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/25 backdrop-blur-xl transition-all shadow-md"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>WhatsApp: +91 6384947914</span>
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
