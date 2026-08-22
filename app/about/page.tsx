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
  Mail,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
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
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── 1. Full-Width Visual Hero Section ── */}
      <section className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden flex items-center justify-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 bg-slate-950">
          <Image
            src="https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920"
            alt="Tharika Decors Luxury Stage Scenography"
            fill
            priority={true}
            fetchPriority="high"
            sizes="100vw"
            quality={75}
            className="object-cover object-center scale-105"
          />
        </div>

        {/* Rich Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />

        {/* Hero Text Overlays */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Puducherry &bull; Tamil Nadu</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg"
          >
            About Tharika Decors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-3.5 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/90 font-light leading-relaxed drop-shadow"
          >
            Crafting royal moments, traditional soul, and breathtaking event scenography across South India.
          </motion.p>
        </div>
      </section>

      {/* ── 2. Story & Heritage Section ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Intro Highlight Box */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#0A3659]/70">
            Our Heritage &amp; Roots
          </span>
          <h2 className="mt-2 font-heading font-serif text-2xl sm:text-4xl font-bold text-[#0A3659]">
            Tradition Infused With Modern Grandeur
          </h2>

          {/* Elegant Gold Divider */}
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-5 opacity-85" />

          <p className="text-base sm:text-lg text-[#0A3659]/80 leading-relaxed font-normal">
            <strong>Based in the heart of Puducherry</strong>, Tharika Decors &amp; Events has been transforming celebrations across Tamil Nadu and South India for over eight years.
          </p>

          <p className="mt-4 text-sm sm:text-base text-[#0A3659]/70 leading-relaxed">
            From grand royal muhurtham mandaps draped in fragrant jasmine and golden brass bells, to intimate baby shower stages adorned with auspicious glass bangles and lotus blooms — every stage is handcrafted with meticulous intention and deep love.
          </p>
        </motion.div>

        {/* ── 3. Elevated Stat Cards (Horizontal Glassmorphism) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mb-16"
        >
          {stats.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border border-amber-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-[#D4AF37] hover:bg-white transition-all text-center group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3659]/5 text-[#D4AF37] mb-2.5 group-hover:scale-110 transition-transform">
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-heading font-serif text-xl sm:text-2xl font-bold text-[#0A3659]">
                {label}
              </span>
              <span className="text-[11px] font-semibold text-[#0A3659]/60 uppercase tracking-wider mt-1">
                {sub}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── 4. Vision & Mission (Two-Column Layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="p-7 sm:p-8 rounded-3xl border border-[#0A3659]/10 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A3659]/5 text-[#0A3659] text-xs font-bold uppercase tracking-wider mb-4">
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                Our Vision
              </div>
              <h3 className="font-heading font-serif text-2xl font-bold text-[#0A3659] mb-3">
                Elevating Cultural Milestones
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be the premier bespoke event decoration atelier in South India, celebrated for preserving sacred traditional roots while innovating with ethereal, contemporary luxury styling that leaves lasting royal impressions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
              <span>Timeless Indian Aesthetics</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="p-7 sm:p-8 rounded-3xl border border-[#0A3659]/10 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A3659]/5 text-[#0A3659] text-xs font-bold uppercase tracking-wider mb-4">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                Our Mission
              </div>
              <h3 className="font-heading font-serif text-2xl font-bold text-[#0A3659] mb-3">
                Precision, Passion &amp; Warmth
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To turn every family's dream celebration into a stress-free masterpiece. We combine authentic floral mastery, bespoke structural design, transparent pricing, and punctual execution with warm South Indian hospitality.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#0A3659]">
              <span>100% Dedicated Execution</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </motion.div>
        </div>

        {/* ── 5. What Sets Us Apart (3 Pillars) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0A3659]/60">
              The Tharika Signature
            </span>
            <h3 className="mt-1.5 font-heading font-serif text-2xl sm:text-3xl font-bold text-[#0A3659]">
              Why Families Trust Us
            </h3>
            <div className="w-12 h-0.5 rounded-full bg-[#D4AF37] mx-auto mt-3 opacity-80" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-[#D4AF37]/50 shadow-2xs hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0A3659] text-[#D4AF37] flex items-center justify-center mb-4 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-serif text-lg font-bold text-[#0A3659] mb-2">
                  {title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 6. Contact & Consultation Callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#0A3659] via-[#0F172A] to-[#0A3659] p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold uppercase tracking-widest border border-white/15 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Let's Create Your Dream Event
            </span>

            <h3 className="font-heading font-serif text-2xl sm:text-4xl font-bold text-white mb-3">
              Ready to Craft Magic Together?
            </h3>

            <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Connect with our design team for date availability, tailored packages, and personalized stage conceptualization in Puducherry &amp; across Tamil Nadu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#c4a030] text-[#0A3659] font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20would%20like%20to%20inquire%20about%20event%20decor%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all"
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
