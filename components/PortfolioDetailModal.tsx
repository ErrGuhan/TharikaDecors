'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, Instagram, Share2, Check, X, ShieldCheck } from 'lucide-react';
import { PortfolioCardItem } from '@/components/PortfolioCard';

interface PortfolioDetailModalProps {
  item: PortfolioCardItem | null;
  onClose: () => void;
  shareCopied: boolean;
  onShare: (item: PortfolioCardItem) => void;
  getWhatsAppUrl: (item: PortfolioCardItem) => string;
  formatInstagramUrl: (url?: string | null) => string;
  formatPrice: (price?: string | null) => string;
}

export default function PortfolioDetailModal({
  item,
  onClose,
  shareCopied,
  onShare,
  getWhatsAppUrl,
  formatInstagramUrl,
  formatPrice,
}: PortfolioDetailModalProps) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 pb-20 sm:pb-5 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] bg-white my-auto max-h-[88dvh] sm:max-h-[92vh] flex flex-col border border-[#D4AF37]/35"
      >
        {/* Specular top rim line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FCF6BA] to-transparent pointer-events-none z-30" />

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xl hover:bg-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md border border-white/20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Full Event Image Container */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] max-h-[260px] sm:max-h-[380px] bg-slate-950 overflow-hidden flex-shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-200/60 bg-slate-900">
              <Sparkles className="w-8 h-8 mb-2 opacity-60 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-wider">Tharika Decors</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Floating Category Tag inside image */}
          <div className="absolute top-3.5 left-3.5 z-10 bg-white/95 backdrop-blur-xl px-3.5 py-1 rounded-full text-[11px] font-extrabold text-[#0A3659] shadow-md uppercase border border-white/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>{item.category?.trim() || 'Exclusive Decor'}</span>
          </div>
        </div>

        {/* Details & Actions Section */}
        <div className="p-5 sm:p-6 bg-[#FAF7F2]/90 backdrop-blur-xl flex flex-col overflow-y-auto">
          {/* Category & Badge Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#0A3659]/10 text-[#0A3659] border border-[#0A3659]/15 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              {item.category?.trim() || 'Exclusive Decor'}
            </span>
            <span className="bg-[#D4AF37]/15 text-[#8A6D1C] text-[10px] px-3 py-1 rounded-full font-bold border border-[#D4AF37]/35 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Fully Customizable</span>
            </span>
          </div>

          {/* Full-width Title in Playfair Serif */}
          <h2
            id="modal-title"
            className="text-2xl font-heading font-serif font-bold text-[#0A3659] mb-2 leading-tight"
          >
            {item.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            {item.caption?.trim() ||
              'Handcrafted with meticulous detail, authentic floral artistry, and luxury styling to make your celebration memorable.'}
          </p>

          {/* Price Block & Action Toolbar Container */}
          <div className="pt-4 border-t border-[#D4AF37]/20 mt-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  STARTS FROM
                </span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#0A3659]">
                  {formatPrice(item.price)}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                *Setup &amp; styling included
              </span>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2.5">
              {/* Primary Button: Check Availability on WhatsApp */}
              <a
                href={getWhatsAppUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-shimmer flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-tharika-gold-gradient text-[#0A3659] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-md hover:shadow-xl active:scale-[0.98] cursor-pointer border border-white/50"
              >
                <MessageCircle className="w-4 h-4 fill-[#0A3659] text-[#0A3659]" />
                <span>Check Availability</span>
              </a>

              {/* Instagram Button */}
              <a
                href={formatInstagramUrl(item.instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 aspect-square rounded-xl bg-white/80 hover:bg-white text-[#E4405F] flex items-center justify-center transition-all border border-[#D4AF37]/30 flex-shrink-0 cursor-pointer shadow-xs hover:border-[#E4405F]/40"
                title="View on Instagram"
                aria-label="View on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              {/* Share Button with Native Web Share / Clipboard Copy */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => onShare(item)}
                  className="w-12 h-12 aspect-square rounded-xl bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center transition-all border border-[#D4AF37]/30 flex-shrink-0 cursor-pointer shadow-xs hover:border-slate-400"
                  title="Share showcase"
                  aria-label="Share showcase"
                >
                  {shareCopied ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {shareCopied && (
                    <motion.span
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: -38, scale: 1 }}
                      exit={{ opacity: 0, y: -25 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-3 py-1 rounded-md bg-[#0A3659] text-white text-[10px] font-bold whitespace-nowrap shadow-xl pointer-events-none z-20 border border-[#D4AF37]/50"
                    >
                      Link copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
