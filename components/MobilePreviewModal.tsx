'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Smartphone, Sparkles, ChevronUp } from 'lucide-react';

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  caption?: string;
  imageUrl: string;
}

export default function MobilePreviewModal({
  isOpen,
  onClose,
  title,
  category,
  caption,
  imageUrl,
}: MobilePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative flex flex-col items-center my-auto">
        {/* Top Floating Close / Info Bar */}
        <div className="flex items-center justify-between w-full max-w-[375px] mb-3 text-white">
          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <Smartphone className="w-4 h-4 text-tharika-gold" />
            <span>Live Mobile Slider Preview</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Simulated iPhone Frame (375px x 812px) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[375px] h-[812px] rounded-[52px] border-[10px] border-gray-900 shadow-2xl overflow-hidden bg-black flex flex-col select-none ring-1 ring-white/10"
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-28 h-7 bg-gray-900 rounded-full flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-black ring-1 ring-gray-800" />
            <div className="w-2 h-2 rounded-full bg-blue-950/80" />
          </div>

          {/* Status Bar */}
          <div className="absolute top-4 left-7 right-7 z-20 flex items-center justify-between text-[11px] font-semibold text-white/90">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-white/80 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Full Screen Image Slider Simulation */}
          <div className="relative w-full h-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Showcase Preview'}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500 text-sm">
                No image selected
              </div>
            )}

            {/* Gradient Overlays (exact match to public PortfolioSlider) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

            {/* Top Logo Watermark */}
            <div className="absolute top-14 left-6 z-20 pointer-events-none">
              <div className="relative w-28 h-10 drop-shadow-lg">
                <Image
                  src="/logo.png"
                  alt="Tharika Decors"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-12 p-6 z-10 flex flex-col justify-end text-white pointer-events-none">
              {/* Category Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium tracking-widest uppercase text-tharika-gold w-max mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{category || 'Wedding'}</span>
              </div>

              {/* Title Overlay in Playfair Display */}
              <h2 className="font-heading text-3xl font-normal text-white leading-tight tracking-tight drop-shadow-md">
                {title || 'Showcase Title'}
              </h2>

              {/* Caption */}
              {caption && (
                <p className="text-xs text-white/80 font-light mt-2 line-clamp-3 leading-relaxed drop-shadow">
                  {caption}
                </p>
              )}

              {/* Swipe Indicator */}
              <div className="flex items-center justify-center gap-1 mt-6 text-white/50 text-[11px] font-medium animate-pulse">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Swipe to explore more</span>
              </div>
            </div>
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-32 h-1 bg-white/70 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
