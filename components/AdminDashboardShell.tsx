'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Tag,
  Settings,
  Sparkles,
  Home,
  LogOut,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Database,
  Sliders,
  CheckCircle2,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import UploadForm, { CategoryOption } from '@/components/UploadForm';
import AdminRecordsList, { PortfolioItemRecord } from '@/components/AdminRecordsList';
import CategoryManager, { CategoryData } from '@/components/CategoryManager';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AdminDashboardShellProps {
  userEmail: string;
  initialItems: PortfolioItemRecord[];
  initialCategories: CategoryData[];
}

type AdminTab = 'dashboard' | 'categories' | 'settings';

export default function AdminDashboardShell({
  userEmail,
  initialItems,
  initialCategories,
}: AdminDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [items, setItems] = useState<PortfolioItemRecord[]>(initialItems);
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const router = useRouter();

  // Sync state if props update
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleItemCreated = (newItem: PortfolioItemRecord) => {
    setItems((prev) => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col md:flex-row">
      {/* ── 1. Left Sidebar: Minimalist Brand Theme ── */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 z-30 shadow-xs">
        <div>
          {/* Brand Header with Official Logo */}
          <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
            <Link
              href="/"
              className="relative w-40 h-16 mb-2 block hover:scale-105 transition-transform"
            >
              <Image
                src="/logo.png"
                alt="Tharika Decors & Events"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </Link>
            <span className="text-[10px] font-extrabold tracking-widest text-[#D4AF37] uppercase px-3 py-0.5 rounded-full bg-[#0F172A]/5 border border-[#0F172A]/10">
              Admin Studio CMS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
                <span>Dashboard &amp; Uploads</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-[#D4AF37]" />
                <span>Manage Categories</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'categories'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {categories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <span>CMS Settings</span>
              </div>
              {activeTab === 'settings' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          </nav>

          {/* Quick Links to Frontend */}
          <div className="p-4 pt-2 border-t border-slate-100 space-y-1">
            <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Showcase
            </span>
            <Link
              href="/portfolio"
              target="_blank"
              className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Full Portfolio</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/weddings"
              target="_blank"
              className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A] transition-colors"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Weddings</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Website Homepage</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#FAF7F2]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-xs">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Verified</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── 2. Right Main Content Area: Soft Warm Cream (#FAF7F2) ── */}
      <main className="flex-1 bg-[#FAF7F2] min-h-screen overflow-y-auto p-4 sm:p-7 lg:p-9 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight">
              {activeTab === 'dashboard' && 'Portfolio Studio & Showcase'}
              {activeTab === 'categories' && 'Dynamic Categories Management'}
              {activeTab === 'settings' && 'CMS & Infrastructure Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {activeTab === 'dashboard' &&
                'Upload 9:16 mobile portrait photography, organize showcases, set primary covers, and update live content.'}
              {activeTab === 'categories' &&
                'Create and manage custom event categories for Tharika Decors.'}
              {activeTab === 'settings' &&
                'View Supabase cloud storage, Prisma database connectivity, and administrative permissions.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>{items.length} Published Items</span>
            </span>
          </div>
        </div>

        {/* Tab 1: Dashboard (Two-Column Layout on Desktop) */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left / Top Column: Upload Showcase Card (5 cols on lg) */}
            <div className="lg:col-span-5 xl:col-span-5 sticky lg:top-4">
              <UploadForm
                categories={categories}
                onItemCreated={handleItemCreated}
              />
            </div>

            {/* Right / Bottom Column: Published Items Management (7 cols on lg) */}
            <div className="lg:col-span-7 xl:col-span-7">
              <AdminRecordsList initialItems={items} />
            </div>
          </div>
        )}

        {/* Tab 2: Categories */}
        {activeTab === 'categories' && (
          <CategoryManager initialCategories={categories} />
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-[#0F172A]/5 text-[#0F172A] border border-[#0F172A]/10">
                <Sliders className="w-5 h-5 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-[#0F172A] font-bold">
                  CMS &amp; Cloud Infrastructure
                </h3>
                <p className="text-xs text-slate-500">
                  Current database connection and storage services status.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PostgreSQL Database</span>
                </div>
                <p className="text-xs text-slate-500">
                  Prisma ORM connected via Supabase PostgreSQL transaction pooler.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Supabase Storage Bucket</span>
                </div>
                <p className="text-xs text-slate-500">
                  Bucket: <code className="font-mono font-bold text-[#0F172A]">portfolio-images</code>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobile-First Aspect Ratio</span>
                </div>
                <p className="text-xs text-slate-500">
                  Enforced standard: <span className="font-bold text-[#0F172A]">9:16 Portrait Ratio</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Security &amp; Authorization</span>
                </div>
                <p className="text-xs text-slate-500">
                  Authorized Admin: <span className="font-bold text-slate-800">{userEmail}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
