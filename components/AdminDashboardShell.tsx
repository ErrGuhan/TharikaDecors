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
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* ── 1. Left Column: Modern Minimalist Fixed/Sticky Sidebar ── */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200/80 flex flex-col justify-between flex-shrink-0 z-30">
        <div>
          {/* Brand Header with Official Logo */}
          <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
            <Link href="/" className="relative w-40 h-16 mb-2 block hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Tharika Decors & Events"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-tharika-gold uppercase px-2.5 py-0.5 rounded-full bg-tharika-blue/5 border border-tharika-blue/10">
              CMS Studio Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-tharika-blue text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-tharika-blue'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard &amp; Uploads</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-tharika-blue text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-tharika-blue'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4" />
                <span>Manage Categories</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'categories'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {initialCategories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-tharika-blue text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-tharika-blue'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
              {activeTab === 'settings' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          </nav>

          {/* Quick Links to Frontend */}
          <div className="p-4 pt-2 border-t border-gray-100 space-y-1">
            <span className="px-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Live Showcase
            </span>
            <Link
              href="/portfolio"
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-tharika-blue transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-tharika-gold" />
                <span>Full Portfolio</span>
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-tharika-blue transition-colors"
            >
              <span className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-gray-400" />
                <span>Website Homepage</span>
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-900 truncate">{userEmail}</p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Verified</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-red-200 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── 2. Right Column: Main Content Area (bg-gray-50) ── */}
      <main className="flex-1 bg-gray-50/70 min-h-screen overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl text-tharika-blue font-bold tracking-tight">
              {activeTab === 'dashboard' && 'Portfolio Studio & Uploads'}
              {activeTab === 'categories' && 'Dynamic Categories Management'}
              {activeTab === 'settings' && 'CMS Configuration & Settings'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {activeTab === 'dashboard' &&
                'Upload 9:16 mobile portrait photography, adjust crops, and organize your showcase records.'}
              {activeTab === 'categories' &&
                'Create and manage custom event decor categories for your website.'}
              {activeTab === 'settings' &&
                'View Supabase connection status, Prisma configuration, and admin authorization.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-tharika-blue" />
              <span>{initialItems.length} Published Showcases</span>
            </span>
          </div>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <UploadForm categories={initialCategories} />
            <AdminRecordsList initialItems={initialItems} />
          </div>
        )}

        {/* Tab 2: Categories */}
        {activeTab === 'categories' && (
          <CategoryManager initialCategories={initialCategories} />
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-tharika-blue/10 text-tharika-blue">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-tharika-blue font-semibold">
                  CMS &amp; Cloud Infrastructure
                </h3>
                <p className="text-xs text-gray-500">
                  Current database connection and storage services.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PostgreSQL Database</span>
                </div>
                <p className="text-xs text-gray-500">Connected via Prisma ORM on Supabase pooler.</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Supabase Storage</span>
                </div>
                <p className="text-xs text-gray-500">
                  Bucket: <code className="font-mono font-bold text-tharika-blue">portfolio-images</code>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Image Aspect Ratio</span>
                </div>
                <p className="text-xs text-gray-500">
                  Standardized to <span className="font-bold text-tharika-blue">9:16 Portrait</span> (Mobile-First).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Admin Security</span>
                </div>
                <p className="text-xs text-gray-500">
                  Authorized Admin: <span className="font-bold text-gray-800">{userEmail}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
