'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

const heroImage =
  'https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920';

const WHATSAPP_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

const categories = [
  {
    title: 'Weddings',
    href: '/weddings',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Baby Showers',
    href: '/baby-showers',
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ear Piercing',
    href: '/portfolio',
    image:
      'https://images.pexels.com/photos/28389453/pexels-photo-28389453.jpeg?auto=compress&cs=tinysrgb&h=800&w=800',
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
};

export default function Home() {
  return (
    <div className="w-full bg-tharika-cream">
      {/* ── 1. The Hero Section ── */}
      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />

        {/* Luxurious Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" aria-hidden="true" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center flex flex-col items-center justify-center">
          {/* Official Tharika Decors Logo Emblem */}
          <motion.div
            variants={fadeUpVariants}
            custom={0}
            initial="hidden"
            animate="visible"
            className="relative w-64 sm:w-80 md:w-96 h-32 sm:h-40 md:h-48 mb-6 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
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
            className="font-heading text-3xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-tight text-white max-w-3xl drop-shadow-md"
            variants={fadeUpVariants}
            custom={0.2}
            initial="hidden"
            animate="visible"
          >
            Crafting Royal Moments &amp; Grand Celebrations
          </motion.h1>

          {/* Subtitle in Inter */}
          <motion.p
            className="mt-4 text-sm sm:text-base md:text-lg font-light tracking-wide text-white/90 max-w-xl leading-relaxed"
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
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold tracking-wide text-[#0A3659] rounded-full bg-tharika-gold-gradient shadow-lg shadow-black/20 hover:shadow-2xl transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5 fill-tharika-blue text-transparent" />
              <span>Inquire on WhatsApp</span>
            </motion.a>

            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm sm:text-base font-semibold tracking-wide text-white rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-tharika-gold" />
              <span>Explore Portfolio</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 3. The Category Grid ── */}
      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#0D593F]">
              Curated Services
            </span>
            <h2 className="mt-3 font-heading text-3xl sm:text-4xl text-[#0A3659] tracking-tight">
              Celebrations We Curate
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-[#0A3659]/70">
              Thoughtfully conceived designs crafted to transform every milestone into an enduring memory.
            </p>
          </motion.div>

          {/* 3-Column Grid of Square Cards */}
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
                  className="group relative block aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                    style={{ backgroundImage: `url(${cat.image})` }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    aria-hidden="true"
                  />

                  {/* Dark Gradient Overlay at bottom */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Elegant White Card Title */}
                  <div className="absolute inset-0 flex items-end p-8">
                    <div>
                      <h3 className="font-heading text-2xl sm:text-3xl font-medium text-white tracking-wide">
                        {cat.title}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-widest text-white/75 group-hover:text-white transition-colors flex items-center gap-1">
                        <span>Explore Decor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
