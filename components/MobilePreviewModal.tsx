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

  if (!isOpen) return null;

  const handleShareClick = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative flex flex-col items-center my-auto py-6">
        {/* Top Floating Close / Info Bar */}
        <div className="flex items-center justify-between w-full max-w-[385px] mb-3 text-white">
          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <Smartphone className="w-4 h-4 text-tharika-gold" />
            <span>Mobile Card Feed Preview</span>
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
          className="relative w-[375px] h-[760px] rounded-[48px] border-[10px] border-gray-900 shadow-2xl overflow-hidden bg-[#FBF9F5] flex flex-col select-none ring-1 ring-white/10"
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-28 h-6 bg-gray-900 rounded-full flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-black ring-1 ring-gray-800" />
            <div className="w-2 h-2 rounded-full bg-blue-950/80" />
          </div>

          {/* Status Bar */}
          <div className="pt-3 px-7 pb-2 flex items-center justify-between text-[11px] font-semibold text-gray-900 z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-gray-800 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-gray-900 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Header Bar */}
          <div className="px-5 py-3 border-b border-gray-200/80 bg-white flex items-center justify-between">
            <div className="relative w-28 h-8">
              <Image
                src="/logo.png"
                alt="Tharika Decors"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-tharika-gold px-2.5 py-0.5 rounded-full bg-tharika-gold/10">
              Feed View
            </span>
          </div>

          {/* Scrollable Feed Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* The Social Feed Card */}
            <article className="bg-white border border-gray-200/80 shadow-sm rounded-xl overflow-hidden">
              {/* Card Header: Title in Playfair Display (bold, top left) */}
              <header className="p-4 pb-2.5">
                <h3 className="font-heading font-serif text-base font-bold text-tharika-blue leading-snug">
                  {title || 'Showcase Design Name'}
                </h3>
              </header>

              {/* Card Image: Aspect-[4/3], object-cover, rounded-lg */}
              <div className="px-4">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title || 'Preview'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image Uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details: Category uppercase subtle gray + caption */}
              <div className="p-4 pt-2.5 pb-3 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {category || 'Wedding'}
                </p>
                {caption && (
                  <p className="text-xs text-gray-700 leading-relaxed font-normal">
                    {caption}
                  </p>
                )}
              </div>

              {/* Action Footer: Instagram button, Share button, Price badge */}
              <footer className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-full text-gray-600 hover:text-pink-600 bg-white border border-gray-200/60 shadow-2xs"
                    title={instagramUrl ? 'Instagram Link Attached' : 'Instagram Profile'}
                  >
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div
                    onClick={handleShareClick}
                    className="p-1.5 rounded-full text-gray-600 hover:text-tharika-blue bg-white border border-gray-200/60 shadow-2xs cursor-pointer"
                    title="Share Button"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Price Pill Tag */}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tharika-cream text-tharika-blue border border-tharika-gold/30 text-xs font-semibold shadow-2xs">
                  <Tag className="w-3 h-3 text-tharika-gold" />
                  <span>{price?.trim() || 'Price on Request'}</span>
                </span>
              </footer>
            </article>
          </div>

          {/* Home Indicator Bar */}
          <div className="py-2 flex justify-center bg-white border-t border-gray-100">
            <div className="w-32 h-1 bg-gray-900/40 rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
