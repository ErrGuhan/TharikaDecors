'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  Share2,
  Check,
  Tag,
  MessageCircle,
} from 'lucide-react';

export interface PortfolioCardItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string | null;
  category?: string;
  price?: string | null;
  instagramUrl?: string | null;
  isCover?: boolean;
}

export interface PortfolioCardProps {
  item: PortfolioCardItem;
  priority?: boolean;
}

export default function PortfolioCard({ item, priority = false }: PortfolioCardProps) {
  const [copied, setCopied] = useState(false);

  // Native Web Share API with Clipboard Copy Fallback
  const handleShare = async () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `${item.title} | Tharika Decors & Events`,
      text: item.caption
        ? `${item.title}: ${item.caption}`
        : `Check out ${item.title} by Tharika Decors`,
      url: pageUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.warn('Copy error:', err);
      }
    }
  };

  const formattedPrice = item.price?.trim() || null;
  const instagramLink = item.instagramUrl?.trim() || null;

  // WhatsApp prefilled message
  const whatsappUrl = `https://wa.me/916384947914?text=${encodeURIComponent(
    `Hello Tharika Decors! I love the "${item.title}" (${item.category || 'Decor'}${
      formattedPrice ? ` - ${formattedPrice}` : ''
    }) design and would like to check availability and quote for our upcoming event.`
  )}`;

  return (
    <article className="bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl mb-8 overflow-hidden max-w-lg mx-auto w-full relative">
      {/* ── 1. Header: Design Name / Title in Playfair Display (bold, top left) ── */}
      <header className="p-4 sm:p-5 pb-3">
        <h2 className="font-heading font-serif text-lg sm:text-xl font-bold text-tharika-blue leading-snug tracking-tight text-left">
          {item.title}
        </h2>
      </header>

      {/* ── 2. Image: Aspect-[4/3] container with Next.js <Image/>, object-cover & rounded-lg ── */}
      <div className="px-4 sm:px-5">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-100/80 group">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 600px, 600px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={item.imageUrl.startsWith('http')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
              No image available
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Details: Category Name (subtle gray uppercase) & Description / Caption ── */}
      <div className="p-4 sm:p-5 pt-3 pb-4 space-y-1.5">
        {item.category && (
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {item.category}
          </p>
        )}

        {item.caption && (
          <p className="text-sm text-gray-700 leading-relaxed font-normal">
            {item.caption}
          </p>
        )}
      </div>

      {/* ── 4. Action Footer: Flexbox row at absolute bottom ── */}
      <footer className="px-4 sm:px-5 py-3.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3">
        {/* Left Action Buttons: Instagram & Share */}
        <div className="flex items-center gap-2">
          {/* Instagram Icon Button */}
          {instagramLink ? (
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-600 hover:text-[#E4405F] hover:bg-pink-50 transition-colors cursor-pointer flex items-center justify-center"
              aria-label={`View ${item.title} on Instagram`}
              title="View on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          ) : (
            <a
              href="https://www.instagram.com/tharikadecors"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-400 hover:text-[#E4405F] hover:bg-pink-50 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Visit Tharika Decors on Instagram"
              title="Visit Tharika Decors on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}

          {/* Share Icon Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full text-gray-600 hover:text-tharika-blue hover:bg-tharika-blue/10 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Share this design"
              title="Share Design"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>

            {/* Copied Feedback Toast/Badge */}
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded-md bg-gray-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md pointer-events-none z-20"
                >
                  Link copied!
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Quick WhatsApp Inquire Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            title="Inquire on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-transparent" />
            <span>Inquire</span>
          </a>
        </div>

        {/* Right Action: Price Tag aligned to right side, styled as small pill/badge */}
        <div className="flex items-center">
          {formattedPrice ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-tharika-cream text-tharika-blue border border-tharika-gold/30 text-xs sm:text-sm font-semibold shadow-2xs tracking-wide">
              <Tag className="w-3 h-3 text-tharika-gold" />
              <span>{formattedPrice}</span>
            </span>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-tharika-cream text-tharika-blue border border-tharika-gold/30 text-xs font-semibold hover:bg-tharika-gold/10 transition-colors"
            >
              <span>Price on Request</span>
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}
