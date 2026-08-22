'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Home,
  Camera,
  Calendar,
} from 'lucide-react';

export interface PortfolioItemData {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string | null;
  category?: string;
  isCover?: boolean;
}

export interface PortfolioSliderProps {
  items?: PortfolioItemData[];
  slides?: any[];
  categoryTitle?: string;
  emptyMessage?: string;
}

const SWIPE_CONFIDENCE_THRESHOLD = 50;

const WHATSAPP_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20was%20looking%20at%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20booking%20event%20decor';

export default function PortfolioSlider({
  items,
  slides,
  categoryTitle = 'Event Decor',
  emptyMessage = 'New luxury showcases are currently being curated for this collection.',
}: PortfolioSliderProps) {
  // Normalize items array
  const rawList = items || slides || [];
  const normalizedItems: PortfolioItemData[] = rawList.map((item: any) => ({
    id: item.id?.toString() || Math.random().toString(),
    title: item.title || 'Untitled Showcase',
    imageUrl: item.imageUrl || item.url || item.image || '',
    caption: item.caption || item.description || '',
    category: item.category || item.category?.name || categoryTitle,
    isCover: !!item.isCover,
  }));

  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  const paginate = useCallback(
    (newDirection: number) => {
      if (normalizedItems.length === 0) return;
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    [normalizedItems.length]
  );

  const handlePrev = () => paginate(-1);
  const handleNext = () => paginate(1);

  // Keyboard navigation
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
      paginate(1);
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD || velocity.x > 0.2) {
      paginate(-1);
    }
  };

  const fadeVariants = {
    initial: { opacity: 0 },
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

  // ── Clean Fallback UI for Empty Database State ──
  if (normalizedItems.length === 0) {
    return (
      <div className="relative min-h-[90vh] w-full flex flex-col items-center justify-center bg-black px-6 text-center text-white select-none">
        {/* Background Ambient Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(179, 135, 40, 0.2) 0%, transparent 60%)',
          }}
        />

        {/* Top Header Logo */}
        <div className="absolute top-6 left-6 z-40">
          <Link href="/" className="relative w-36 h-14 block hover:scale-105 transition-transform">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md relative z-10 space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 text-tharika-gold flex items-center justify-center mx-auto border border-white/15 shadow-inner">
            <Camera className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-tharika-gold bg-tharika-gold/10 border border-tharika-gold/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{categoryTitle}</span>
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-white font-normal">
              New Showcases Coming Soon
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              {emptyMessage}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-tharika-gold-gradient text-tharika-blue font-bold text-xs tracking-wider uppercase shadow-lg hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4 fill-tharika-blue text-transparent" />
              <span>Inquire on WhatsApp</span>
            </a>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentIndex =
    ((page % normalizedItems.length) + normalizedItems.length) % normalizedItems.length;
  const currentSlide = normalizedItems[currentIndex];

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

      {/* Top Right WhatsApp Inquire Button */}
      <div className="absolute top-5 right-5 z-40 flex items-center gap-2 pointer-events-auto">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-tharika-gold-gradient text-tharika-blue font-bold text-xs shadow-lg hover:scale-105 transition-transform"
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
            {currentSlide?.imageUrl && (
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                fill
                priority
                sizes="100vw"
                quality={75}
                className="object-cover pointer-events-none"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── 2. Chevron Navigation Arrows ── */}
      {normalizedItems.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-white/30 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-white/30 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </>
      )}

      {/* ── 3. Slide Indicators (Luxury Dots) ── */}
      {normalizedItems.length > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {normalizedItems.map((_, idx) => (
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
      )}

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
              {currentSlide?.category && (
                <span className="inline-block text-xs md:text-sm font-medium tracking-widest uppercase text-tharika-gold mb-2">
                  {currentSlide.category}
                </span>
              )}
              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight drop-shadow-md">
                {currentSlide?.title}
              </h2>
              {currentSlide?.caption && (
                <p className="mt-2 text-sm sm:text-base text-white/80 max-w-2xl font-light drop-shadow-sm leading-relaxed">
                  {currentSlide.caption}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
