'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Layers,
  Database,
  Star,
  Calendar,
  Sparkles,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export interface PortfolioItemRecord {
  id: string;
  title: string;
  caption?: string | null;
  category: string;
  imageUrl: string;
  isCover?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface AdminRecordsListProps {
  initialItems: PortfolioItemRecord[];
}

type FilterTab = 'all' | 'wedding' | 'baby-shower' | 'ear-piercing' | 'covers';

export default function AdminRecordsList({ initialItems }: AdminRecordsListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { id: FilterTab; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Items', count: initialItems.length },
      {
        id: 'wedding',
        label: 'Weddings',
        count: initialItems.filter((i) => i.category.toLowerCase() === 'wedding').length,
      },
      {
        id: 'baby-shower',
        label: 'Baby Showers',
        count: initialItems.filter((i) => i.category.toLowerCase() === 'baby-shower').length,
      },
      {
        id: 'ear-piercing',
        label: 'Ear Piercing',
        count: initialItems.filter((i) => i.category.toLowerCase() === 'ear-piercing').length,
      },
      {
        id: 'covers',
        label: 'Category Covers',
        count: initialItems.filter((i) => i.isCover === true).length,
      },
    ];
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'wedding' && item.category.toLowerCase() !== 'wedding') return false;
      if (activeTab === 'baby-shower' && item.category.toLowerCase() !== 'baby-shower') return false;
      if (activeTab === 'ear-piercing' && item.category.toLowerCase() !== 'ear-piercing') return false;
      if (activeTab === 'covers' && !item.isCover) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesCaption = item.caption?.toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesCaption;
      }

      return true;
    });
  }, [initialItems, activeTab, searchQuery]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-tharika-blue/10 overflow-hidden flex flex-col">
      {/* ── 1. Sticky Top Sub-Navigation Bar with Filter Tabs ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-tharika-blue" />
            <h2 className="font-heading text-xl text-tharika-blue font-semibold">
              Published Records
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-tharika-blue/10 text-tharika-blue">
            {filteredItems.length} of {initialItems.length} Listed
          </span>
        </div>

        {/* Quick-Switch Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-tharika-blue text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-tharika-blue'
                }`}
              >
                {tab.id === 'covers' && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Quick 'Search & Filter' Bar ── */}
      <div className="p-6 border-b border-gray-100 bg-tharika-cream/30">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploads by title, caption, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900 placeholder:text-gray-400"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Filtered Records Grid ── */}
      <div className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-14 text-gray-400 flex flex-col items-center justify-center">
            <Layers className="w-12 h-12 mb-3 text-gray-300 stroke-[1.5]" />
            <p className="text-sm font-medium text-gray-700">No showcase items found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              {searchQuery
                ? `No items matched "${searchQuery}". Try modifying your search keyword.`
                : 'No items in this category yet. Upload a new item using the form.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-xl border border-gray-200/80 overflow-hidden bg-gray-50 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />

                    {/* Category Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-black/75 text-white backdrop-blur-sm uppercase tracking-wider">
                      {item.category}
                    </span>

                    {/* Cover Star Indicator */}
                    {item.isCover && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        Cover
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-medium text-sm text-tharika-blue line-clamp-1 group-hover:text-[#072844]">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-200/60 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[10px] font-mono text-gray-300">
                        {item.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
