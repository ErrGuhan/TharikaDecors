'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  MessageCircle,
  Camera,
  Filter,
  ArrowLeft,
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

const WHATSAPP_BOOKING_URL =
  'https://wa.me/916384947914?text=Hello%20Tharika%20Decors!%20I%20am%20browsing%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20event%20decor%20booking.';

export default function PortfolioFeed({
  initialItems = [],
  title = 'Portfolio Showcase',
  subtitle = 'Explore bespoke wedding stages, traditional valaikappu setups, and luxury floral decors curated by Tharika Decors.',
  defaultCategory = 'all',
  hideFilterTabs = false,
}: PortfolioFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories from items
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((item) => {
      if (item.category) set.add(item.category);
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

  return (
    <section className="w-full min-h-screen bg-[#FBF9F5] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* ── Top Header / Hero Section ── */}
      <div className="max-w-xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-tharika-gold bg-tharika-gold/10 border border-tharika-gold/20 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Portfolio</span>
        </div>

        <h1 className="font-heading font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-tharika-blue tracking-tight leading-tight">
          {title}
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* ── Live Search & Filter Bar ── */}
        <div className="mt-6 relative max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by design, category, or budget..."
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-gray-200 bg-white shadow-2xs text-xs sm:text-sm focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none transition-all placeholder:text-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-xs text-gray-400 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Category Filter Tabs (Pills) ── */}
        {!hideFilterTabs && categoryOptions.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-5 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-tharika-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All ({initialItems.length})
            </button>
            {categoryOptions.map((cat) => {
              const count = initialItems.filter((i) => i.category === cat).length;
              const isSelected =
                selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-tharika-blue text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Vertical Card Feed (Mobile-First Scrolling List) ── */}
      <div className="max-w-lg mx-auto">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center shadow-sm my-6">
            <div className="w-14 h-14 rounded-full bg-tharika-blue/5 text-tharika-gold flex items-center justify-center mx-auto mb-4 border border-tharika-gold/20">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-serif text-xl text-tharika-blue font-bold mb-2">
              No Showcases Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-6">
              {searchQuery
                ? `No portfolio records matched "${searchQuery}". Try a different keyword.`
                : 'New luxury event decor showcases will be published soon.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={WHATSAPP_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-tharika-blue text-white text-xs font-semibold shadow hover:bg-[#072844] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View All Showcases
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                priority={index < 2}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Floating Action CTA for Mobile ── */}
      <div className="max-w-lg mx-auto text-center mt-6 pt-6 border-t border-gray-200/60 pb-8">
        <p className="text-xs text-gray-500 mb-3">
          Looking for a customized decor concept for your special celebration?
        </p>
        <a
          href={WHATSAPP_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-tharika-blue hover:bg-[#072844] text-white text-xs font-semibold tracking-wider uppercase shadow-md hover:shadow-lg transition-all active:scale-98"
        >
          <MessageCircle className="w-4 h-4 fill-tharika-gold text-transparent" />
          <span>Chat with Decor Specialist</span>
        </a>
      </div>
    </section>
  );
}
