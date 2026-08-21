'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Smartphone,
  Sparkles,
  Instagram,
  Share2,
  Check,
  Tag,
  MessageCircle,
} from 'lucide-react';

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  caption?: string;
  price?: string;
  instagramUrl?: string;
  imageUrl: string;
}

export default function MobilePreviewModal({
  isOpen,
  onClose,
  title,
  category,
  caption,
  price,
  instagramUrl,
  imageUrl,
}: MobilePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative flex flex-col items-center my-auto py-6">
        {/* Top Floating Close / Info Bar */}
        <div className="flex items-center justify-between w-full max-w-[385px] mb-3 text-white">
          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
            <span>iOS Card Feed & Expand Preview</span>
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

        {/* ── Simulated iPhone Frame (375px x 760px) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[375px] h-[760px] rounded-[48px] border-[10px] border-slate-900 shadow-2xl overflow-hidden bg-[#FAF7F2] flex flex-col select-none ring-1 ring-white/10"
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-28 h-6 bg-slate-900 rounded-full flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-black ring-1 ring-gray-800" />
            <div className="w-2 h-2 rounded-full bg-blue-950/80" />
          </div>

          {/* Status Bar */}
          <div className="pt-3 px-7 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-900 z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-slate-800 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-900 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Header Bar */}
          <div className="px-5 py-3 border-b border-amber-900/10 bg-white/90 backdrop-blur-xs flex items-center justify-between">
            <div className="relative w-28 h-7">
              <Image
                src="/logo.png"
                alt="Tharika Decors"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15">
              Feed Preview
            </span>
          </div>

          {/* Scrollable Feed Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            <p className="text-[10px] text-center text-slate-500 italic">
              Tap the card to test the iOS expand modal view
            </p>

            {/* The iOS Card (aspect-[4/5]) */}
            <article
              onClick={() => setIsExpanded(true)}
              className="relative overflow-hidden rounded-3xl shadow-lg aspect-[4/5] cursor-pointer transition-transform active:scale-[0.98] group bg-slate-900 w-full"
            >
              {/* Image */}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || 'Preview'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-amber-200/60 bg-slate-900">
                  <Sparkles className="w-8 h-8 mb-2 opacity-60 text-[#D4AF37]" />
                  <span className="text-xs uppercase tracking-wider">Tharika Decors</span>
                </div>
              )}

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-amber-800 uppercase shadow-xs flex items-center gap-1.5 border border-amber-900/10">
                <span>{category || 'Wedding'}</span>
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Bottom Content */}
              <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none z-10">
                <h3 className="font-heading font-serif text-lg font-bold leading-tight line-clamp-1">
                  {title || 'Showcase Decor Title'}
                </h3>
                <p className="mt-1 text-xs text-slate-200 font-sans leading-relaxed line-clamp-1">
                  {caption || 'Tap to expand full details & pricing'}
                </p>
              </div>
            </article>

            {/* Simulated In-Device Expanded Modal */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsExpanded(false)}
                  className="absolute inset-0 z-40 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-[320px] overflow-hidden rounded-3xl shadow-2xl bg-white"
                  >
                    {/* Floating Circular Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image Half */}
                    <div className="h-56 relative w-full bg-slate-900 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={title || 'Preview'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-200/60">
                          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                      )}
                    </div>

                    {/* Details Bottom Sheet */}
                    <div className="p-4 bg-white">
                      <p className="text-[10px] font-bold tracking-widest text-amber-700 uppercase mb-1">
                        {category || 'Wedding'}
                      </p>
                      <h4 className="text-lg font-bold font-serif text-slate-900 leading-tight mb-1.5">
                        {title || 'Showcase Decor Title'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                        {caption ||
                          'Bespoke hand-crafted event styling with auspicious florals and royal stage decor.'}
                      </p>

                      {/* Action Footer */}
                      <footer className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-8 h-8 rounded-full bg-pink-50 text-[#E4405F] flex items-center justify-center"
                            title="Instagram"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                          <div
                            onClick={handleShareClick}
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                            title="Share"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>

                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          {price?.trim() || 'Price on Request'}
                        </span>
                      </footer>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Home Indicator Bar */}
          <div className="py-2 flex justify-center bg-white border-t border-amber-900/10">
            <div className="w-32 h-1 bg-slate-900/40 rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
