'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowUpRight, Tag } from 'lucide-react';

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
  fetchPriority?: 'high' | 'low' | 'auto';
  onClick?: () => void;
}

export default function PortfolioCard({
  item,
  priority = false,
  fetchPriority,
  onClick,
}: PortfolioCardProps) {
  const categoryLabel = item.category?.trim() || 'Exclusive';

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View details for ${item.title}`}
      className="group relative overflow-hidden rounded-3xl bg-slate-950 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_45px_rgba(10,54,89,0.25)] transition-all duration-500 cursor-pointer w-full select-none flex flex-col border border-[#D4AF37]/25 hover:border-[#D4AF37]/75"
    >
      {/* ── Image Container (4:5 Aspect Ratio) ── */}
      <div className="relative w-full aspect-[4/5] bg-slate-950 overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : fetchPriority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-200/60 p-4 text-center">
            <Sparkles className="w-8 h-8 mb-2 opacity-50 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest">Tharika Decors</span>
          </div>
        )}

        {/* Top Badges in Refractive Liquid Glass */}
        <div className="absolute top-3.5 inset-x-3.5 z-10 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <div className="bg-white/90 backdrop-blur-xl px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider text-[#0A3659] uppercase shadow-md border border-white/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>{categoryLabel}</span>
          </div>

          {/* Featured Badge */}
          {item.isCover && (
            <div className="bg-gradient-to-r from-[#BF953F] to-[#D4AF37] text-[#0A3659] px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1 border border-[#FCF6BA]/60">
              <Sparkles className="w-3 h-3 fill-[#0A3659]" />
              <span>Featured</span>
            </div>
          )}
        </div>

        {/* Multi-layer Gradient Overlay for Optimal Legibility */}
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        {/* Content Details (Liquid Glass Bottom Drawer) */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white z-10 pointer-events-none flex flex-col justify-end">
          {/* Title & Arrow */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading font-serif text-lg sm:text-xl font-bold leading-snug tracking-tight text-white group-hover:text-[#FCF6BA] transition-colors line-clamp-1 drop-shadow-md">
              {item.title}
            </h3>
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] group-hover:text-[#0A3659] transition-all duration-300 text-white shadow-sm border border-white/20">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Caption */}
          {item.caption && (
            <p className="mt-1.5 text-xs text-slate-200/90 font-sans leading-relaxed line-clamp-2 drop-shadow-xs">
              {item.caption}
            </p>
          )}

          {/* Meta: Price Tag & Tap Indicator */}
          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-white/15 text-xs">
            {item.price?.trim() ? (
              <span className="inline-flex items-center gap-1 text-[#FCF6BA] font-extrabold text-[11px] bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-xs">
                <Tag className="w-3 h-3 text-[#D4AF37]" />
                <span>{item.price.trim()}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-300 font-medium">Custom Package</span>
            )}

            <span className="text-[11px] font-bold text-[#D4AF37] group-hover:text-[#FCF6BA] group-hover:underline transition-colors flex items-center gap-1">
              <span>View Details</span>
              <span>&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
