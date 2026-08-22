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
  Image as ImageIcon,
  PlusCircle,
  Layers,
  X,
  TrendingUp,
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

type AdminTab = 'dashboard' | 'works' | 'categories' | 'settings';

export default function AdminDashboardShell({
  userEmail,
  initialItems,
  initialCategories,
}: AdminDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('works');
  const [items, setItems] = useState<PortfolioItemRecord[]>(initialItems);
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  React.useEffect(() => { setItems(initialItems); }, [initialItems]);
  React.useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleItemCreated = (newItem: PortfolioItemRecord) => {
    setItems((prev) => [newItem, ...prev]);
    setIsDrawerOpen(false);
  };

  const tabConfig: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />,
    },
    {
      id: 'works',
      label: 'Manage Works',
      icon: <Layers className="w-4 h-4 text-[#D4AF37]" />,
      badge: items.length,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <Tag className="w-4 h-4 text-[#D4AF37]" />,
      badge: categories.length,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 text-[#D4AF37]" />,
    },
  ];

  const tabTitle: Record<AdminTab, string> = {
    dashboard: 'Studio Overview',
    works: 'Manage Works',
    categories: 'Manage Categories',
    settings: 'CMS Settings',
  };
  const tabSubtitle: Record<AdminTab, string> = {
    dashboard: 'A live snapshot of your published portfolio and categories.',
    works: 'Browse, edit, and delete published showcase items. Click "Add New Work" to upload.',
    categories: 'Create and manage custom event categories for Tharika Decors.',
    settings: 'View Supabase storage, Prisma connectivity, and admin permissions.',
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col md:flex-row">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 z-30 shadow-xs">
        <div>
          {/* Brand header */}
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

          {/* Nav tabs */}
          <nav className="p-4 space-y-1.5">
            {tabConfig.map(({ id, label, icon, badge }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <span>{label}</span>
                </div>
                {badge !== undefined ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {badge}
                  </span>
                ) : (
                  activeTab === id && <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                )}
              </button>
            ))}
          </nav>

          {/* Quick links */}
          <div className="p-4 pt-2 border-t border-slate-100 space-y-1">
            <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Showcase
            </span>
            {[
              { href: '/portfolio', label: 'Our Works', icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> },
              { href: '/weddings', label: 'Weddings', icon: <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> },
              { href: '/', label: 'Website Homepage', icon: <Home className="w-3.5 h-3.5 text-slate-400" /> },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#FAF7F2] hover:text-[#0F172A] transition-colors"
              >
                <span className="flex items-center gap-2">{icon}<span>{label}</span></span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* User footer */}
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

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 bg-[#FAF7F2] min-h-screen overflow-y-auto p-4 sm:p-7 lg:p-9 space-y-6">

        {/* Top header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight">
              {tabTitle[activeTab]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{tabSubtitle[activeTab]}</p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'works' && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                Add New Work
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>{items.length} Published</span>
            </span>
          </div>
        </div>

        {/* ── TAB 1: Dashboard (Stats Overview) ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                {
                  label: 'Published Works',
                  value: items.length,
                  icon: <Layers className="w-5 h-5 text-[#D4AF37]" />,
                  sub: 'Total portfolio items live',
                  color: 'bg-[#0F172A]/5',
                },
                {
                  label: 'Categories',
                  value: categories.length,
                  icon: <Tag className="w-5 h-5 text-[#D4AF37]" />,
                  sub: 'Active event categories',
                  color: 'bg-[#D4AF37]/8',
                },
                {
                  label: 'Cover Photos',
                  value: items.filter((i) => i.isCover).length,
                  icon: <ImageIcon className="w-5 h-5 text-[#D4AF37]" />,
                  sub: 'Category covers set',
                  color: 'bg-emerald-50',
                },
              ].map(({ label, value, icon, sub, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
                  <div>
                    <p className="text-2xl font-bold text-[#0F172A] font-heading">{value}</p>
                    <p className="text-xs font-semibold text-slate-700">{label}</p>
                    <p className="text-[11px] text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action prompt */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Action</span>
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">Ready to add a new showcase?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Head to <strong>Manage Works</strong> and click "Add New Work" to upload your latest event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('works')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                Go to Manage Works
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: Manage Works (Records list, upload in drawer) ── */}
        {activeTab === 'works' && (
          <AdminRecordsList initialItems={items} />
        )}

        {/* ── TAB 3: Categories ── */}
        {activeTab === 'categories' && (
          <CategoryManager initialCategories={categories} />
        )}

        {/* ── TAB 4: Settings ── */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-[#0F172A]/5 border border-[#0F172A]/10">
                <Sliders className="w-5 h-5 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-[#0F172A] font-bold">
                  CMS &amp; Cloud Infrastructure
                </h3>
                <p className="text-xs text-slate-500">Current database and storage services status.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: 'PostgreSQL Database',
                  detail: 'Prisma ORM connected via Supabase transaction pooler (port 6543).',
                },
                {
                  label: 'Supabase Storage Bucket',
                  detail: 'Bucket: portfolio-images',
                },
                {
                  label: 'Mobile-First Aspect Ratio',
                  detail: 'Enforced standard: 9:16 Portrait Ratio.',
                },
                {
                  label: 'Security & Authorization',
                  detail: `Admin: ${userEmail}`,
                },
              ].map(({ label, detail }) => (
                <div key={label} className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── UPLOAD DRAWER (slide-in from right) ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white flex-shrink-0">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#0F172A]">Add New Work</h2>
                  <p className="text-xs text-slate-500">Upload a 9:16 portrait showcase image</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer body — scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <UploadForm
                  categories={categories}
                  onItemCreated={handleItemCreated}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
