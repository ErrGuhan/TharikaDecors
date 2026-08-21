'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

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
      className="relative overflow-hidden rounded-3xl shadow-lg aspect-[4/5] cursor-pointer transition-transform duration-300 hover:shadow-xl active:scale-[0.98] group bg-slate-900 w-full select-none"
    >
      {/* ── Image ── */}
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, 448px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          unoptimized={item.imageUrl.startsWith('http')}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-amber-200/60 p-4 text-center">
          <Sparkles className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs uppercase tracking-widest">Tharika Decors</span>
        </div>
      )}

      {/* ── Top Badge ── */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-amber-800 uppercase shadow-xs flex items-center gap-1.5 border border-amber-900/10">
        <span>{categoryLabel}</span>
      </div>

      {/* ── Optional Featured Indicator for Cover Items ── */}
      {item.isCover && (
        <div className="absolute top-4 right-4 z-10 bg-amber-500/90 text-white backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-white" />
          <span>Featured</span>
        </div>
      )}

      {/* ── Bottom Gradient Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

      {/* ── Bottom Content ── */}
      <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none z-10">
        <h3 className="font-heading font-serif text-lg sm:text-xl font-bold leading-tight tracking-tight drop-shadow-sm group-hover:text-amber-200 transition-colors line-clamp-1">
          {item.title}
        </h3>
        {item.caption && (
          <p className="mt-1 text-xs sm:text-sm text-slate-200/90 font-sans leading-relaxed line-clamp-1 drop-shadow-xs">
            {item.caption}
          </p>
        )}
      </div>
    </article>
  );
}
