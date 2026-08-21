'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { createCategory, deleteCategory } from '@/app/actions/adminActions';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  createdAt: string | Date;
  _count?: {
    items: number;
  };
}

interface CategoryManagerProps {
  initialCategories: CategoryData[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    try {
      let res: any = null;
      try {
        const apiRes = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
        });
        const resData = await apiRes.json().catch(() => null);
        if (apiRes.ok && resData?.success) {
          res = resData;
        } else if (resData?.error) {
          throw new Error(resData.error);
        }
      } catch (fetchErr: any) {
        console.warn('API category create note, using server action fallback:', fetchErr?.message);
        res = await createCategory(name.trim(), slug.trim());
      }

      if (!res || !res.success) {
        throw new Error(res?.error || 'Failed to create category.');
      }

      if (res.category) {
        setCategories((prev) => {
          if (prev.some((c) => c.id === res.category.id)) return prev;
          return [...prev, res.category];
        });
        showToast('success', `Category "${res.category.name}" created!`);
        setName('');
        setSlug('');
      }
    } catch (err: any) {
      console.error('Create category error:', err);
      showToast('error', err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete "${catName}"? Linked items will also be removed.`)) {
      return;
    }

    setDeletingId(id);

    try {
      let res: any = null;
      try {
        const apiRes = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        const resData = await apiRes.json().catch(() => null);
        if (apiRes.ok && resData?.success) {
          res = resData;
        } else if (resData?.error) {
          throw new Error(resData.error);
        }
      } catch (fetchErr: any) {
        console.warn('API category delete note, using server action fallback:', fetchErr?.message);
        res = await deleteCategory(id);
      }

      if (!res || !res.success) {
        throw new Error(res?.error || 'Failed to delete category.');
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('success', `Deleted category "${catName}".`);
    } catch (err: any) {
      console.error('Delete category error:', err);
      showToast('error', err.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium text-white ${
              toastMessage.type === 'success' ? 'bg-[#0F172A]' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F172A]/5 text-[#0F172A] border border-[#0F172A]/10">
            <Tag className="w-5 h-5 text-[#0F172A]" />
          </div>
          <div>
            <h2 className="font-heading text-xl text-[#0F172A] font-bold">
              Manage Dynamic Categories
            </h2>
            <p className="text-xs text-slate-500">
              Create, inspect, and organize bespoke event decor categories.
            </p>
          </div>
        </div>
      </div>

      {/* Create New Category Form */}
      <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-[#FAF7F2]/60 border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Add New Category</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Corporate Galas, Haldi Decor"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. corporate-galas"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs bg-white text-slate-900 font-mono"
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Save Category</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Categories List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Existing Categories ({categories.length})
        </h3>
        {categories.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-300" />
            <p className="text-xs">No categories created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A]">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    /{cat.slug}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete category"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
