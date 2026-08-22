'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Instagram,
  Share2,
  Check,
  X,
  MessageCircle,
  Camera,
  Tag,
  Calendar,
} from 'lucide-react';
import PortfolioCard, { PortfolioCardItem } from '@/components/PortfolioCard';

interface PortfolioFeedProps {
  initialItems: PortfolioCardItem[];
  title?: string;
  subtitle?: string;
  defaultCategory?: string;
  hideFilterTabs?: boolean;
}

const WHATSAPP_BOOKING_BASE_URL = 'https://wa.me/916384947914';
const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/tharikadecors';

/**
 * Normalizes an Instagram string from the database (e.g. handle, @handle, full URL)
 * into a safe, valid clickable external URL.
 */
function formatInstagramUrl(url?: string | null): string {
  if (!url || !url.trim()) return DEFAULT_INSTAGRAM_URL;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, '');
  return `https://www.instagram.com/${handle}`;
}

/**
 * Formats raw price input (e.g. 30000, 75000, Starts at 75000) into ₹30,000 Indian currency format.
 */
function formatPrice(rawPrice?: string | null): string {
  if (!rawPrice || !rawPrice.trim()) return 'Custom Quote';
  const trimmed = rawPrice.trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits && !isNaN(Number(digits))) {
    return `₹${Number(digits).toLocaleString('en-IN')}`;
  }
  return trimmed.startsWith('₹') ? trimmed : `₹${trimmed}`;
}

export default function PortfolioFeed({
  initialItems = [],
  title = 'Our Works',
  subtitle = 'Discover our hand-crafted wedding stages, intimate family ceremonies, and luxury event decors.',
  defaultCategory = 'all',
  hideFilterTabs = false,
}: PortfolioFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioCardItem | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Sync state with URL search parameters on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const itemParam = params.get('item');

      if (catParam) {
        setSelectedCategory(catParam);
      }
      if (itemParam && initialItems.length > 0) {
        const found = initialItems.find((i) => i.id === itemParam);
        if (found) setActiveModalItem(found);
      }
    }
  }, [initialItems]);

  // Lock body scroll when detail modal is active
  useEffect(() => {
    if (activeModalItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalItem]);

  // Extract unique categories from items
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((item) => {
      if (item.category?.trim()) set.add(item.category.trim());
    });
    return Array.from(set);
  }, [initialItems]);

  // Filter items dynamically
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();
        if (!itemCat.includes(selectedCat) && !selectedCat.includes(itemCat)) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCaption = item.caption?.toLowerCase().includes(q) || false;
        const matchesCat = item.category?.toLowerCase().includes(q) || false;
        const matchesPrice = item.price?.toLowerCase().includes(q) || false;
        return matchesTitle || matchesCaption || matchesCat || matchesPrice;
      }

      return true;
    });
  }, [initialItems, selectedCategory, searchQuery]);

  // Close modal handler
  const closeModal = useCallback(() => {
    setActiveModalItem(null);
    setShareCopied(false);
  }, []);

  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalItem) {
        closeModal();
      }
    };
    if (activeModalItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalItem, closeModal]);

  // Native Web Share API with Clipboard Copy Fallback
  const handleShare = async (item: PortfolioCardItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const itemUrl = `${origin}/portfolio?item=${encodeURIComponent(item.id)}`;
    const shareData = {
      title: `${item.title} | Tharika Decors & Events`,
      text: item.caption
        ? `${item.title}: ${item.caption}`
        : `Check out ${item.title} by Tharika Decors`,
      url: itemUrl,
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
        await navigator.clipboard.writeText(itemUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch (err) {
        console.warn('Copy error:', err);
      }
    }
  };

  // WhatsApp prefilled message
  const getWhatsAppUrl = (item: PortfolioCardItem) => {
    const formattedPrice = formatPrice(item.price);
    const priceText = item.price?.trim() ? ` (Budget: ${formattedPrice})` : '';
    const msg = `Hello Tharika Decors! I am interested in the "${item.title}" ${item.category || 'decor'}${priceText} and would like to check availability and package details.`;
    return `${WHATSAPP_BOOKING_BASE_URL}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="w-full min-h-screen bg-[#FAF7F2] pt-6 sm:pt-10 pb-16 font-sans">
      {/* ── Top Header / Hero Section ── */}
      <div className="max-w-xl mx-auto text-center px-4 mb-6 sm:mb-8">
        {/* Subtle Gold Brand Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Tharika Showcase</span>
        </div>

        {/* Heading in Playfair Display Serif */}
        <h1 className="font-heading font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* ── Live Search Bar ── */}
        <div className="mt-5 relative max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by decor style, theme, or budget..."
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-slate-200 bg-white shadow-xs text-xs sm:text-sm text-[#0F172A] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Category Filter Tabs ── */}
        {!hideFilterTabs && categoryOptions.length > 0 && (
          <div className="w-full max-w-xl mx-auto mt-4 px-2">
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 px-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  selectedCategory === 'all'
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                All Works
              </button>
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Grid of Showcase Cards ── */}
      <div className="max-w-md mx-auto px-4 sm:px-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-serif text-lg font-bold text-slate-800">
              No Showcases Found
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? `No items match "${searchQuery}". Try a different keyword.`
                : 'No decor showcases found in this collection.'}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                View All Works
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-7">
            {filteredItems.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                priority={index < 2}
                onClick={() => setActiveModalItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Interactive Detail Modal (Expanded Story View) ── */}
      <AnimatePresence>
        {activeModalItem && (
          <div
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 pb-20 sm:pb-5 overflow-y-auto"
            onClick={closeModal}
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
                onClick={closeModal}
                className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer shadow-md"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Full Event Image Container */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] max-h-[260px] sm:max-h-[380px] bg-slate-950 overflow-hidden flex-shrink-0">
                {activeModalItem.imageUrl ? (
                  <Image
                    src={activeModalItem.imageUrl}
                    alt={activeModalItem.title}
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
                  {activeModalItem.category?.trim() || 'Exclusive Decor'}
                </div>
              </div>

              {/* Details & Actions Section */}
              <div className="p-5 sm:p-6 bg-white flex flex-col overflow-y-auto">
                {/* Category & Badge Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-[#0A3659]/5 text-[#0A3659] border border-[#0A3659]/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                    {activeModalItem.category?.trim() || 'Exclusive Decor'}
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
                  {activeModalItem.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {activeModalItem.caption?.trim() ||
                    'Handcrafted with meticulous detail, floral artistry, and luxury styling to make your celebration memorable.'}
                </p>

                {/* Price Block & Action Toolbar Container */}
                <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
                  {/* Price Tag Makeover: Two-line price block */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                        STARTS FROM
                      </span>
                      <span className="text-xl font-bold font-serif text-[#0A3659]">
                        {formatPrice(activeModalItem.price)}
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
                      href={getWhatsAppUrl(activeModalItem)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold tracking-wide transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                      <span>Check Availability</span>
                    </a>

                    {/* Instagram Button: Perfectly Square Aspect-square w-12 */}
                    <a
                      href={formatInstagramUrl(activeModalItem.instagramUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 aspect-square rounded-xl bg-pink-50/50 hover:bg-pink-100/80 text-[#E4405F] flex items-center justify-center transition-all border border-gray-200 flex-shrink-0 cursor-pointer shadow-2xs hover:border-pink-200"
                      title="View on Instagram"
                      aria-label="View on Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>

                    {/* Share Button: Perfectly Square Aspect-square w-12 */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleShare(activeModalItem)}
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
        )}
      </AnimatePresence>
    </section>
  );
}
