'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowUpRight, Tag, Instagram } from 'lucide-react';

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
  onClick?: () => void;
}

export default function PortfolioCard({
  item,
  priority = false,
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
      className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-amber-900/10 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer w-full select-none flex flex-col"
    >
      {/* ── Image Container (4:5 Portrait Feed Card) ── */}
      <div className="relative w-full aspect-[4/5] bg-slate-950 overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-200/60 p-4 text-center">
            <Sparkles className="w-8 h-8 mb-2 opacity-50 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest">Tharika Decors</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 z-10 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-[#0F172A] uppercase shadow-md border border-white/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>{categoryLabel}</span>
          </div>

          {/* Featured Badge */}
          {item.isCover && (
            <div className="bg-[#D4AF37] text-[#0F172A] px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-[#0F172A]" />
              <span>Featured</span>
            </div>
          )}
        </div>

        {/* Refined Bottom Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />

        {/* Content Details (Bottom Overlay) */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white z-10 pointer-events-none flex flex-col justify-end">
          {/* Title & Arrow */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading font-serif text-lg sm:text-xl font-bold leading-snug tracking-tight text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 drop-shadow-md">
              {item.title}
            </h3>
            <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] group-hover:text-[#0F172A] transition-all text-white shadow-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Caption */}
          {item.caption && (
            <p className="mt-1 text-xs text-slate-300 font-sans leading-relaxed line-clamp-2 drop-shadow-xs">
              {item.caption}
            </p>
          )}

          {/* Meta: Price & Tap to view */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            {item.price?.trim() ? (
              <span className="inline-flex items-center gap-1 text-[#D4AF37] font-bold text-[11px] bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                <Tag className="w-3 h-3 text-[#D4AF37]" />
                <span>{item.price.trim()}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-300 font-medium">Custom Package</span>
            )}

            <span className="text-[11px] text-amber-200/90 font-semibold group-hover:underline">
              View Showcase &rarr;
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
