'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, MessageCircle } from 'lucide-react';
import { PortfolioImage, weddingImages } from '@/lib/data';

export interface PortfolioSlide {
  id: string | number;
  title: string;
  url?: string;
  image?: string;
  category?: string;
  description?: string;
}

const SWIPE_CONFIDENCE_THRESHOLD = 50;

const WHATSAPP_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

interface PortfolioSliderProps {
  slides?: (PortfolioSlide | PortfolioImage)[];
  images?: (PortfolioSlide | PortfolioImage)[];
}

export default function PortfolioSlider({
  slides,
  images,
}: PortfolioSliderProps) {
  const activeSlides = (slides || images || weddingImages) as (PortfolioSlide & { url?: string; image?: string })[];

  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  // Wrap around index
  const currentIndex =
    ((page % activeSlides.length) + activeSlides.length) % activeSlides.length;
  const currentSlide = activeSlides[currentIndex];
  const imageSource = currentSlide?.url || currentSlide?.image || '';

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  const handlePrev = () => paginate(-1);
  const handleNext = () => paginate(1);

  // Keyboard navigation support (Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Swipe gesture handler
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipe = offset.x;

    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD || velocity.x < -0.2) {
      paginate(1); // Swiped left -> show next
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD || velocity.x > 0.2) {
      paginate(-1); // Swiped right -> show prev
    }
  };

  const fadeVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  if (!activeSlides.length) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black select-none">
      {/* ── Top Header Brand Watermark ── */}
      <div className="absolute top-5 left-5 z-40 flex items-center gap-3 pointer-events-auto">
        <Link
          href="/"
          className="relative w-28 sm:w-36 h-12 block drop-shadow-lg hover:scale-105 transition-transform"
        >
          <Image
            src="/logo.png"
            alt="Tharika Decors Logo"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </Link>
      </div>

      {/* Top Right Quick Action */}
      <div className="absolute top-5 right-5 z-40 flex items-center gap-2 pointer-events-auto">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-tharika-gold-gradient text-tharika-blue font-bold text-xs shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-tharika-blue text-transparent" />
          <span>Inquire</span>
        </a>
      </div>

      {/* ── 1. Full Screen Image Container with Gestures ── */}
      <motion.div
        className="relative h-full w-full cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={page}
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 h-full w-full"
          >
            {/* Render single large Next.js Image with object-cover */}
            {imageSource && (
              <Image
                src={imageSource}
                alt={currentSlide.title}
                fill
                priority
                sizes="100vw"
                className="object-cover pointer-events-none"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── 2. Minimalist Chevron Navigation Arrows ── */}
      {/* Left Chevron */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous image"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-white/30 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
      >
        <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
      </button>

      {/* Right Chevron */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next image"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-white/30 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
      >
        <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
      </button>

      {/* ── 3. Slide Indicators (Luxury Dots) ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {activeSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPage([idx, idx > currentIndex ? 1 : -1])}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── 4. Bottom Dark Gradient & Title Text Overlay ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-28 pb-20 md:pb-14 px-6 md:px-12 pointer-events-none">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentSlide.category && (
                <span className="inline-block text-xs md:text-sm font-medium tracking-widest uppercase text-tharika-gold mb-2">
                  {currentSlide.category}
                </span>
              )}
              {/* Event title in Playfair Display Serif font in white */}
              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight drop-shadow-md">
                {currentSlide.title}
              </h2>
              {currentSlide.description && (
                <p className="mt-2 text-sm sm:text-base text-white/80 max-w-2xl font-light drop-shadow-sm">
                  {currentSlide.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
