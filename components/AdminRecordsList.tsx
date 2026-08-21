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
  Eye,
  LayoutGrid,
  List,
  Tag,
} from 'lucide-react';
import {
  updatePortfolioItem,
  deletePortfolioItem,
  setCoverPhoto,
} from '@/app/actions/adminActions';
import MobilePreviewModal from '@/components/MobilePreviewModal';
import ImageCropper from '@/components/ImageCropper';
import { Instagram } from 'lucide-react';

export interface PortfolioItemRecord {
  id: string;
  title: string;
  caption?: string | null;
  price?: string | null;
  instagramUrl?: string | null;
  category: string;
  categoryId?: string;
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<PortfolioItemRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('wedding');
  const [editCaption, setEditCaption] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editInstagramUrl, setEditInstagramUrl] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [isEditCropperOpen, setIsEditCropperOpen] = useState(false);
  const [rawEditImageSrc, setRawEditImageSrc] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<PortfolioItemRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile Preview Modal State
  const [previewItem, setPreviewItem] = useState<PortfolioItemRecord | null>(null);

  // Action Loading & Toast
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
        count: items.filter((i) => i.category.toLowerCase().includes('wedding')).length,
      },
      {
        id: 'baby-shower',
        label: 'Baby Showers',
        count: items.filter((i) => i.category.toLowerCase().includes('baby')).length,
      },
      {
        id: 'ear-piercing',
        label: 'Ear Piercing',
        count: items.filter((i) => i.category.toLowerCase().includes('ear')).length,
      },
      {
        id: 'covers',
        label: 'Category Covers',
        count: items.filter((i) => i.isCover === true).length,
      },
    ];
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const catLower = item.category.toLowerCase();
      if (activeTab === 'wedding' && !catLower.includes('wedding')) return false;
      if (activeTab === 'baby-shower' && !catLower.includes('baby')) return false;
      if (activeTab === 'ear-piercing' && !catLower.includes('ear')) return false;
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
    setEditCategory(item.categoryId || item.category);
    setEditCaption(item.caption || '');
    setEditPrice(item.price || '');
    setEditInstagramUrl(item.instagramUrl || '');
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
      const url = URL.createObjectURL(file);
      setRawEditImageSrc(url);
      setIsEditCropperOpen(true);
    }
  };

  const handleEditCropComplete = (cropped: File, croppedUrl: string) => {
    setEditFile(cropped);
    setEditPreviewUrl(croppedUrl);
    setIsEditCropperOpen(false);
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
      formData.append('price', editPrice.trim());
      formData.append('instagramUrl', editInstagramUrl.trim());
      if (editFile) {
        formData.append('file', editFile);
      }

      const res = await updatePortfolioItem(editingItem.id, formData);

      if (!res.success) {
        throw new Error(res.error || 'Failed to update item.');
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                ...res.item,
                category: res.item.category?.name || i.category,
                price: res.item.price !== undefined ? res.item.price : editPrice.trim() || null,
                instagramUrl: res.item.instagramUrl !== undefined ? res.item.instagramUrl : editInstagramUrl.trim() || null,
              }
            : i
        )
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

  // Toggle Cover Photo
  const handleSetCover = async (item: PortfolioItemRecord) => {
    setLoadingActionId(item.id);

    try {
      const res = await setCoverPhoto(item.id, item.categoryId || item.category);

      if (!res.success) {
        throw new Error(res.error || 'Failed to set cover photo.');
      }

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

      showToast('success', `"${item.title}" is now the primary cover photo!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to set cover photo.');
    } finally {
      setLoadingActionId(null);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      const res = await deletePortfolioItem(itemToDelete.id);

      if (!res.success) {
        throw new Error(res.error || 'Failed to delete item.');
      }

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden flex flex-col relative">
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

      {/* ── 1. Sticky Sub-Navigation Header with Filter Tabs & View Switcher ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 pt-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-tharika-blue" />
            <h2 className="font-heading text-xl text-tharika-blue font-semibold">
              Published Portfolio Showcase
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tharika-blue/10 text-tharika-blue">
              {filteredItems.length}
            </span>
          </div>

          {/* View Mode Toggle: Table vs Grid */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-tharika-blue shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-tharika-blue shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
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

      {/* ── 2. Real-Time Search Bar ── */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/60">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, or caption..."
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

      {/* ── 3. Content Area: Clean Tailwind CSS Data Table or Card Grid ── */}
      <div className="p-0 sm:p-6 overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400 flex flex-col items-center justify-center">
            <Layers className="w-12 h-12 mb-3 text-gray-300 stroke-[1.5]" />
            <p className="text-sm font-medium text-gray-700">No portfolio items found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              {searchQuery
                ? `No results matched "${searchQuery}".`
                : 'Upload your first item using the form above.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* ── Clean Tailwind CSS Data Table ── */
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Thumbnail
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Title &amp; Details
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Cover
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Thumbnail (9:16 Portrait Preview) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          onClick={() => setPreviewItem(item)}
                          className="relative w-12 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-xs cursor-pointer group-hover:scale-105 transition-transform"
                          title="Click to preview on mobile screen"
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </td>

                      {/* Title & Caption */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <h4 className="font-heading text-sm font-semibold text-tharika-blue">
                            {item.title}
                          </h4>
                          {item.caption && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {item.caption}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {item.price && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-tharika-cream text-tharika-blue border border-tharika-gold/30">
                                {item.price}
                              </span>
                            )}
                            {item.instagramUrl && (
                              <a
                                href={item.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Instagram Post"
                                className="inline-flex items-center gap-1 text-[11px] text-pink-600 hover:text-pink-700 font-medium"
                              >
                                <Instagram className="w-3.5 h-3.5" />
                                <span>Post</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category (from Relation) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-tharika-blue/10 text-tharika-blue uppercase tracking-wider">
                          <Tag className="w-3 h-3 text-tharika-gold" />
                          {item.category}
                        </span>
                      </td>

                      {/* Cover Photo Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSetCover(item)}
                          disabled={loadingActionId === item.id || item.isCover}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            item.isCover
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold cursor-default'
                              : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          {loadingActionId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Star
                              className={`w-3.5 h-3.5 ${
                                item.isCover
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          )}
                          <span>{item.isCover ? 'Active Cover' : 'Set Cover'}</span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Quick Action Icons */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Live Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            title="Preview on Mobile"
                            className="p-2 rounded-xl text-gray-500 hover:text-tharika-blue hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Item"
                            className="p-2 rounded-xl text-gray-500 hover:text-tharika-blue hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            title="Delete Item"
                            className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── Responsive Card Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 sm:p-0">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-gray-200 overflow-hidden bg-white flex flex-col shadow-xs hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative aspect-[9/16] max-h-72 w-full overflow-hidden bg-black cursor-pointer"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/75 text-white uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.isCover && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Active Cover
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-tharika-blue line-clamp-1">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.price && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tharika-cream text-tharika-blue border border-tharika-gold/30">
                          {item.price}
                        </span>
                      )}
                      {item.instagramUrl && (
                        <a
                          href={item.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 text-xs flex items-center gap-1 font-medium"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>Instagram</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleSetCover(item)}
                      disabled={item.isCover}
                      className={`text-xs font-medium px-3 py-1 rounded-lg ${
                        item.isCover ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.isCover ? 'Primary Cover' : 'Set Cover'}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Edit Modal with 9:16 Cropper Support ── */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-tharika-blue" />
                  <h3 className="font-heading text-xl text-tharika-blue font-semibold">
                    Edit Portfolio Showcase
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
                    Showcase Photo (9:16)
                  </label>
                  <div className="relative aspect-[9/16] max-h-56 rounded-2xl overflow-hidden bg-black border border-gray-200 flex items-center justify-center mx-auto shadow-sm">
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
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity font-medium text-xs cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Replace &amp; Crop Photo</span>
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
                    Title (Design Name)
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
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="e.g. Wedding, Baby Shower, Corporate"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm text-gray-900"
                  />
                </div>

                {/* Starting Price & Instagram Post Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Starting Price <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="e.g. Starts at ₹50,000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Instagram Post Link <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={editInstagramUrl}
                      onChange={(e) => setEditInstagramUrl(e.target.value)}
                      placeholder="https://www.instagram.com/p/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
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

                {/* Buttons */}
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

      {/* ── 5. Edit Cropper Modal ── */}
      {isEditCropperOpen && rawEditImageSrc && (
        <ImageCropper
          imageSrc={rawEditImageSrc}
          aspect={9 / 16}
          onCropComplete={handleEditCropComplete}
          onCancel={() => setIsEditCropperOpen(false)}
        />
      )}

      {/* ── 6. Delete Confirmation Modal ── */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl text-gray-900 font-semibold mb-2">
                Delete Showcase?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{itemToDelete.title}"</span>? This record will be permanently deleted from the database.
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

      {/* ── 7. Live Mobile Screen Preview Modal (375px x 812px) ── */}
      {previewItem && (
        <MobilePreviewModal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
          category={previewItem.category}
          caption={previewItem.caption || ''}
          price={previewItem.price || ''}
          instagramUrl={previewItem.instagramUrl || ''}
          imageUrl={previewItem.imageUrl}
        />
      )}
    </div>
  );
}
