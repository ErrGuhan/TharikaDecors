'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

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
    <div className="w-full bg-[#FAF7F2]">
      {/* ── 1. The Hero Section ── */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] sm:min-h-[85vh] w-full items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />

        {/* Luxurious Dark Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85"
          aria-hidden="true"
        />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:py-16 text-center flex flex-col items-center justify-center">
          {/* Official Tharika Decors Logo Emblem */}
          <motion.div
            variants={fadeUpVariants}
            custom={0}
            initial="hidden"
            animate="visible"
            className="relative w-56 sm:w-80 md:w-96 h-28 sm:h-40 md:h-48 mb-4 sm:mb-6 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          >
            <Image
              src="/logo.png"
              alt="Tharika Decors & Events"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </motion.div>

          {/* H1 Heading in Playfair Display */}
          <motion.h1
            className="font-heading text-3xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-tight text-white max-w-3xl drop-shadow-lg"
            variants={fadeUpVariants}
            custom={0.2}
            initial="hidden"
            animate="visible"
          >
            Crafting Royal Moments &amp; Grand Celebrations
          </motion.h1>

          {/* Subtitle in Inter */}
          <motion.p
            className="mt-4 text-sm sm:text-base md:text-lg font-light tracking-wide text-white/95 max-w-xl leading-relaxed drop-shadow"
            variants={fadeUpVariants}
            custom={0.3}
            initial="hidden"
            animate="visible"
          >
            Bespoke Mandaps, Floral Stage Scenography &amp; Ethereal Milestone Decor
          </motion.p>

          {/* ── 2. Call to Action (WhatsApp & Full Portfolio) ── */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.4}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold tracking-wide text-[#0A3659] rounded-full bg-tharika-gold-gradient shadow-lg shadow-black/25 hover:shadow-2xl transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5 fill-tharika-blue text-transparent" />
              <span>Inquire on WhatsApp</span>
            </motion.a>

            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm sm:text-base font-semibold tracking-wide text-white rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-tharika-gold" />
              <span>Explore Our Works</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 3. The Category Grid (High-Contrast Theme-Aligned Typography) ── */}
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
            {/* Tagline Badge in Deep Royal Navy & Radiant Gold */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tharika-blue text-tharika-gold text-xs font-bold uppercase tracking-widest shadow-xs mb-4 border border-tharika-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-tharika-gold" />
              <span>Curated Services</span>
            </div>

            {/* Main Section Heading */}
            <h2 className="font-heading text-3xl sm:text-5xl text-tharika-blue font-bold tracking-tight">
              Celebrations We Curate
            </h2>

            {/* Subtitle Description with High Contrast */}
            <p className="mt-3.5 max-w-xl text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
              Thoughtfully conceived designs crafted to transform every milestone into an enduring royal memory.
            </p>

            {/* Subtle Gold Accent Divider */}
            <div className="w-16 h-1 rounded-full bg-tharika-gold-gradient mt-4 opacity-90" />
          </motion.div>

          {/* Grid of Dynamic Category Cards */}
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
                  className="group relative block aspect-square overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-tharika-blue/10"
                >
                  {/* Image */}
                  {cat.imageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                      style={{ backgroundImage: `url(${cat.imageUrl})` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500">
                      <Sparkles className="w-10 h-10 text-tharika-gold opacity-50" />
                    </div>
                  )}

                  {/* Dark Gradient Overlay at bottom for maximum legibility */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                    aria-hidden="true"
                  />

                  {/* High-Contrast Card Content */}
                  <div className="absolute inset-0 flex items-end p-8">
                    <div>
                      <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-white tracking-wide drop-shadow-md">
                        {cat.title}
                      </h3>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-tharika-gold group-hover:text-white transition-colors flex items-center gap-1.5 drop-shadow">
                        <span>Explore Decor</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
