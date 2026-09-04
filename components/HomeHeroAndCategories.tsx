'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, ArrowRight, Award, Crown, Heart } from 'lucide-react';

export interface DynamicCategoryCard {
  title: string;
  href: string;
  imageUrl: string;
  itemCount: number;
}

interface HomeHeroAndCategoriesProps {
  categories: DynamicCategoryCard[];
}

const heroImage =
  'https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920';

const WHATSAPP_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
};

export default function HomeHeroAndCategories({ categories }: HomeHeroAndCategoriesProps) {
  return (
    <div className="w-full bg-[#FAF7F2] overflow-hidden">
      {/* ── 1. The Luxury Hero Section with Ambient Golden Caustics ── */}
      <section className="relative flex min-h-[calc(100dvh-4.5rem)] sm:min-h-[88vh] w-full items-center justify-center overflow-hidden">
        {/* Optimized Next.js Hero Background Image */}
        <Image
          src={heroImage}
          alt="Tharika Decors Luxury Stage Scenography"
          fill
          priority={true}
          fetchPriority="high"
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Ambient Moving Gold Caustic Glow (vibe-coding-visuals) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.45) 0%, rgba(10, 54, 89, 0.2) 50%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        {/* Luxurious Dark Vignette Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/90 pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:py-20 text-center flex flex-col items-center justify-center">
          {/* Official Tharika Decors Logo Emblem with Liquid Glass Specular Halo */}
          <motion.div
            variants={fadeUpVariants}
            custom={0}
            initial="hidden"
            animate="visible"
            className="relative w-56 sm:w-80 md:w-96 h-28 sm:h-40 md:h-48 mb-5 sm:mb-7 drop-shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
            <Image
              src="/logo.png"
              alt="Tharika Decors & Events"
              fill
              priority
              sizes="(max-width: 640px) 224px, (max-width: 768px) 320px, 384px"
              className="object-contain"
            />
          </motion.div>

          {/* Luxury Curated Eyebrow Tag */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.15}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-[#D4AF37]/45 text-[#FCF6BA] text-xs font-bold uppercase tracking-[0.2em] shadow-lg mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Puducherry &bull; Tamil Nadu &bull; South India</span>
          </motion.div>

          {/* H1 Heading in Playfair Display with High Contrast */}
          <motion.h1
            className="font-heading font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white max-w-3xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
            variants={fadeUpVariants}
            custom={0.25}
            initial="hidden"
            animate="visible"
          >
            Crafting Royal Moments &amp; Grand Celebrations
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-4 text-sm sm:text-base md:text-lg font-light tracking-wide text-white/95 max-w-xl leading-relaxed drop-shadow"
            variants={fadeUpVariants}
            custom={0.35}
            initial="hidden"
            animate="visible"
          >
            Bespoke Mandaps, Floral Stage Scenography &amp; Ethereal Milestone Decor
          </motion.p>

          {/* ── Call to Action Buttons with Liquid Glass Physics ── */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.45}
            initial="hidden"
            animate="visible"
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-extrabold tracking-wider uppercase text-[#0A3659] rounded-full bg-tharika-gold-gradient shadow-[0_8px_32px_0_rgba(191,149,63,0.45)] hover:shadow-[0_12px_40px_0_rgba(191,149,63,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-white/50"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5 fill-[#0A3659] text-transparent" />
              <span>Inquire on WhatsApp</span>
            </motion.a>

            <Link
              href="/portfolio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-sm sm:text-base font-bold tracking-wider uppercase text-white rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Explore Our Works</span>
            </Link>
          </motion.div>

          {/* Trust Highlights Capsule Bar */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.55}
            initial="hidden"
            animate="visible"
            className="mt-12 hidden sm:flex items-center gap-6 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/90 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>8+ Years Mastery</span>
            </span>
            <span className="text-white/30">&bull;</span>
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>500+ Royal Stages</span>
            </span>
            <span className="text-white/30">&bull;</span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              <span>100% Bespoke Styling</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── 2. The Category Grid (Liquid Glass Art Frames) ── */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 lg:px-12 bg-[#FAF7F2]">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            className="mb-14 text-center flex flex-col items-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A3659] text-[#FCF6BA] text-xs font-bold uppercase tracking-widest shadow-md mb-4 border border-[#D4AF37]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Curated Services</span>
            </div>

            {/* Main Section Heading */}
            <h2 className="font-heading font-serif text-3xl sm:text-5xl text-[#0A3659] font-bold tracking-tight">
              Celebrations We Curate
            </h2>

            {/* Subtitle Description */}
            <p className="mt-3.5 max-w-xl text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
              Thoughtfully conceived designs crafted to transform every milestone into an enduring royal memory.
            </p>

            {/* Subtle Gold Accent Divider */}
            <div className="w-20 h-1 rounded-full bg-tharika-gold-gradient mt-4 opacity-90 shadow-sm" />
          </motion.div>

          {/* Grid of Refractive Liquid Glass Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: EASE,
                }}
              >
                <Link
                  href={cat.href}
                  className="group relative block aspect-[4/5] sm:aspect-square overflow-hidden rounded-3xl shadow-[0_12px_36px_0_rgba(10,54,89,0.1)] hover:shadow-[0_20px_50px_0_rgba(10,54,89,0.2)] transition-all duration-500 cursor-pointer border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 bg-slate-950"
                >
                  {/* Category Image with Smooth Zoom */}
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={80}
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500">
                      <Sparkles className="w-10 h-10 text-[#D4AF37] opacity-50" />
                    </div>
                  )}

                  {/* Multi-layered Dark Vignette */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none transition-opacity duration-300 group-hover:opacity-90"
                    aria-hidden="true"
                  />

                  {/* Top Floating Glass Badge */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-extrabold tracking-widest uppercase shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      <span>{cat.itemCount > 0 ? `${cat.itemCount}+ Designs` : 'Exclusive'}</span>
                    </div>
                  </div>

                  {/* Bottom Liquid Glass Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 z-10 flex flex-col justify-end">
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg group-hover:border-[#D4AF37]/40 transition-all duration-300">
                      <h3 className="font-heading font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide group-hover:text-[#FCF6BA] transition-colors drop-shadow-md">
                        {cat.title}
                      </h3>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] group-hover:text-white transition-colors flex items-center justify-between drop-shadow">
                        <span>Explore Showcase</span>
                        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A3659] transition-all">
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
