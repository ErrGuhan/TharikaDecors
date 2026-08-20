'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
    <div className="w-full bg-[#FAFAFA]">
      {/* ── 1. The Hero Section ── */}
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />

        {/* Luxurious Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center flex flex-col items-center justify-center">
          {/* H1 Heading in Playfair Display */}
          <motion.h1
            className="font-heading text-4xl sm:text-6xl md:text-7xl font-normal leading-tight tracking-tight text-white max-w-3xl drop-shadow-sm"
            variants={fadeUpVariants}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            Crafting Unforgettable Moments
          </motion.h1>

          {/* Subtitle in Inter */}
          <motion.p
            className="mt-6 text-base sm:text-lg md:text-xl font-light tracking-wide text-white/90 max-w-xl leading-relaxed"
            variants={fadeUpVariants}
            custom={0.2}
            initial="hidden"
            animate="visible"
          >
            Luxurious Event Styling &amp; Decor
          </motion.p>

          {/* ── 2. WhatsApp Integration (The Call to Action) ── */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.4}
            initial="hidden"
            animate="visible"
            className="mt-10"
          >
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold tracking-wide text-[#0A3659] rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] shadow-lg shadow-black/20 hover:shadow-2xl transition-shadow cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Inquire on WhatsApp</span>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── 3. The Category Grid ── */}
      <section className="bg-[#FAFAFA] py-24 px-6 sm:px-8 lg:px-12">
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
                      <p className="mt-1 text-xs uppercase tracking-widest text-white/75 group-hover:text-white transition-colors">
                        Explore Decor &rarr;
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
