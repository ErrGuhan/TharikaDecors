'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Database,
  Star,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  UploadCloud,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  updatePortfolioItem,
  deletePortfolioItem,
  setCoverPhoto,
} from '@/app/actions/adminActions';

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
  const [items, setItems] = useState<PortfolioItemRecord[]>(initialItems);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<PortfolioItemRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('wedding');
  const [editCaption, setEditCaption] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<PortfolioItemRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Loading & Notification
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const editFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Tabs with live item counts
  const filterTabs: { id: FilterTab; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Items', count: items.length },
      {
        id: 'wedding',
        label: 'Weddings',
        count: items.filter((i) => i.category.toLowerCase() === 'wedding').length,
      },
      {
        id: 'baby-shower',
        label: 'Baby Showers',
        count: items.filter((i) => i.category.toLowerCase() === 'baby-shower').length,
      },
      {
        id: 'ear-piercing',
        label: 'Ear Piercing',
        count: items.filter((i) => i.category.toLowerCase() === 'ear-piercing').length,
      },
      {
        id: 'covers',
        label: 'Category Covers',
        count: items.filter((i) => i.isCover === true).length,
      },
    ];
  }, [items]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'wedding' && item.category.toLowerCase() !== 'wedding') return false;
      if (activeTab === 'baby-shower' && item.category.toLowerCase() !== 'baby-shower') return false;
      if (activeTab === 'ear-piercing' && item.category.toLowerCase() !== 'ear-piercing') return false;
      if (activeTab === 'covers' && !item.isCover) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesCaption = item.caption?.toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesCaption;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (item: PortfolioItemRecord) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditCaption(item.caption || '');
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    if (editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
      setEditPreviewUrl(null);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
    }
  };

  // Submit Update
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('category', editCategory);
      formData.append('caption', editCaption.trim());
      if (editFile) {
        formData.append('file', editFile);
      }

      const res = await updatePortfolioItem(editingItem.id, formData);

      if (!res.success) {
        throw new Error(res.error || 'Failed to update item.');
      }

      // Update local state
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...res.item } : i))
      );

      showToast('success', `Updated "${editTitle}" successfully!`);
      handleCloseEdit();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to save changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle / Set Cover Photo
  const handleSetCover = async (item: PortfolioItemRecord) => {
    setLoadingActionId(item.id);

    try {
      const res = await setCoverPhoto(item.id, item.category);

      if (!res.success) {
        throw new Error(res.error || 'Failed to set cover photo.');
      }

      // Update local state: reset covers in this category and set target to true
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === item.id) {
            return { ...i, isCover: true };
          }
          if (i.category.toLowerCase() === item.category.toLowerCase()) {
            return { ...i, isCover: false };
          }
          return i;
        })
      );

      showToast('success', `"${item.title}" is now the primary cover photo for ${item.category}!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to set cover photo.');
    } finally {
      setLoadingActionId(null);
    }
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      const res = await deletePortfolioItem(itemToDelete.id);

      if (!res.success) {
        throw new Error(res.error || 'Failed to delete item.');
      }

      // Remove from local state
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));

      showToast('success', `Deleted "${itemToDelete.title}" successfully.`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-tharika-blue/10 overflow-hidden flex flex-col relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium text-white ${
              toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
            {filteredItems.length} of {items.length} Records
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
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-tharika-blue text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-tharika-blue'
                }`}
              >
                {tab.id === 'covers' && (
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                )}
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
      <div className="p-5 border-b border-gray-100 bg-tharika-cream/30">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploads by title, caption, or category..."
            className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900 placeholder:text-gray-400"
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

      {/* ── 3. Record Cards Grid ── */}
      <div className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-14 text-gray-400 flex flex-col items-center justify-center">
            <Layers className="w-12 h-12 mb-3 text-gray-300 stroke-[1.5]" />
            <p className="text-sm font-medium text-gray-700">No showcase items found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              {searchQuery
                ? `No items matched "${searchQuery}".`
                : 'No items in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-2xl border border-gray-200/90 overflow-hidden bg-white flex flex-col shadow-sm hover:shadow-lg transition-all"
                >
                  {/* Image Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />

                    {/* Category Tag */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/75 text-white backdrop-blur-sm uppercase tracking-wider">
                      {item.category}
                    </span>

                    {/* 'Active Cover' Badge */}
                    {item.isCover && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white flex items-center gap-1.5 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Active Cover
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-tharika-blue line-clamp-1">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    {/* Date & Quick Actions Footer */}
                    <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Set As Cover Button */}
                        <button
                          type="button"
                          onClick={() => handleSetCover(item)}
                          disabled={loadingActionId === item.id || item.isCover}
                          title={item.isCover ? 'Already Cover' : 'Set as Category Cover'}
                          className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                            item.isCover
                              ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default'
                              : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                          }`}
                        >
                          {loadingActionId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Star
                              className={`w-3.5 h-3.5 ${
                                item.isCover ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                          )}
                          <span className="hidden sm:inline">
                            {item.isCover ? 'Cover' : 'Set Cover'}
                          </span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Item"
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-tharika-blue hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          title="Delete Item"
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── 4. Edit Modal ── */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-tharika-blue" />
                  <h3 className="font-heading text-xl text-tharika-blue font-semibold">
                    Edit Portfolio Item
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                {/* Photo Preview / Replace */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Item Photo
                  </label>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <Image
                      src={editPreviewUrl || editingItem.imageUrl}
                      alt="Edit Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity font-medium text-xs cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Click to Replace Photo</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleEditFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm text-gray-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm text-gray-900 bg-white cursor-pointer"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="baby-shower">Baby Shower</option>
                    <option value="ear-piercing">Ear Piercing</option>
                  </select>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Caption / Description
                  </label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    placeholder="Add an optional description or decor highlight..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm text-gray-900"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={isUpdating}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2.5 rounded-xl bg-tharika-blue text-white text-sm font-medium hover:bg-[#072844] shadow-md flex items-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 5. Delete Confirmation Modal ── */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl text-gray-900 font-semibold mb-2">
                Delete Portfolio Showcase?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{itemToDelete.title}"</span>? This record will be permanently removed from your database.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Yes, Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
