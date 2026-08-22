'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, Instagram, Share2, Check, X } from 'lucide-react';
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
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 pb-20 sm:pb-5 overflow-y-auto"
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
        className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl shadow-2xl bg-white my-auto max-h-[85dvh] sm:max-h-[90vh] flex flex-col border border-slate-100"
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer shadow-md"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Floating Category Tag inside image */}
          <div className="absolute top-3.5 left-3.5 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#0F172A] shadow-md uppercase">
            {item.category?.trim() || 'Exclusive Decor'}
          </div>
        </div>

        {/* Details & Actions Section */}
        <div className="p-5 sm:p-6 bg-white flex flex-col overflow-y-auto">
          {/* Category & Badge Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#0A3659]/5 text-[#0A3659] border border-[#0A3659]/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              {item.category?.trim() || 'Exclusive Decor'}
            </span>
            <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-medium border border-amber-200/60 inline-flex items-center gap-1">
              <span>✨ Fully Customizable</span>
            </span>
          </div>

          {/* Full-width Title */}
          <h2
            id="modal-title"
            className="text-2xl font-serif font-bold text-gray-900 mb-2 leading-tight"
          >
            {item.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {item.caption?.trim() ||
              'Handcrafted with meticulous detail, floral artistry, and luxury styling to make your celebration memorable.'}
          </p>

          {/* Price Block & Action Toolbar Container */}
          <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  STARTS FROM
                </span>
                <span className="text-xl font-bold font-serif text-[#0A3659]">
                  {formatPrice(item.price)}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">
                *Taxes &amp; setup included
              </span>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2.5">
              {/* Primary Button: Check Availability */}
              <a
                href={getWhatsAppUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold tracking-wide transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>Check Availability</span>
              </a>

              {/* Instagram Button */}
              <a
                href={formatInstagramUrl(item.instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 aspect-square rounded-xl bg-pink-50/50 hover:bg-pink-100/80 text-[#E4405F] flex items-center justify-center transition-all border border-gray-200 flex-shrink-0 cursor-pointer shadow-2xs hover:border-pink-200"
                title="View on Instagram"
                aria-label="View on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              {/* Share Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => onShare(item)}
                  className="w-12 h-12 aspect-square rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-all border border-gray-200 flex-shrink-0 cursor-pointer shadow-2xs hover:border-gray-300"
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
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-medium whitespace-nowrap shadow-lg pointer-events-none z-20"
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
