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
  Eye,
  LayoutGrid,
  List,
  Tag,
  DollarSign,
  Instagram,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  updatePortfolioItem,
  deletePortfolioItem,
  setCoverPhoto,
} from '@/app/actions/adminActions';
import MobilePreviewModal from '@/components/MobilePreviewModal';
import ImageCropper from '@/components/ImageCropper';

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

export default function AdminRecordsList({ initialItems }: AdminRecordsListProps) {
  const [items, setItems] = useState<PortfolioItemRecord[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

  // Sync items when initialItems prop changes
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter Chips dynamically computed
  const filterChips = useMemo(() => {
    const chips: { id: string; label: string; count: number }[] = [
      { id: 'all', label: 'All', count: items.length },
      {
        id: 'wedding',
        label: 'Wedding',
        count: items.filter((i) => i.category.toLowerCase().includes('wedding')).length,
      },
      {
        id: 'baby-shower',
        label: 'Baby Shower',
        count: items.filter((i) => i.category.toLowerCase().includes('baby') || i.category.toLowerCase().includes('valaikappu') || i.category.toLowerCase().includes('seemantham')).length,
      },
      {
        id: 'custom',
        label: 'Custom',
        count: items.filter(
          (i) =>
            !i.category.toLowerCase().includes('wedding') &&
            !i.category.toLowerCase().includes('baby') &&
            !i.category.toLowerCase().includes('valaikappu') &&
            !i.category.toLowerCase().includes('seemantham')
        ).length,
      },
    ];
    return chips;
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const catLower = item.category.toLowerCase();
      if (activeFilter === 'wedding' && !catLower.includes('wedding')) return false;
      if (
        activeFilter === 'baby-shower' &&
        !catLower.includes('baby') &&
        !catLower.includes('valaikappu') &&
        !catLower.includes('seemantham')
      ) {
        return false;
      }
      if (
        activeFilter === 'custom' &&
        (catLower.includes('wedding') ||
          catLower.includes('baby') ||
          catLower.includes('valaikappu') ||
          catLower.includes('seemantham'))
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesCaption = item.caption?.toLowerCase().includes(q);
        const matchesPrice = item.price?.toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesCaption || matchesPrice;
      }

      return true;
    });
  }, [items, activeFilter, searchQuery]);

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
                category: res.item.category?.name || res.item.category || editCategory,
                price: res.item.price !== undefined ? res.item.price : editPrice.trim() || null,
                instagramUrl:
                  res.item.instagramUrl !== undefined
                    ? res.item.instagramUrl
                    : editInstagramUrl.trim() || null,
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 p-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold text-white ${
              toastMessage.type === 'success' ? 'bg-[#0F172A]' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Sub-Header with Stats & View Toggle ── */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0F172A]/5 text-[#0F172A] border border-[#0F172A]/10">
            <Database className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
              Published Showcases
            </h2>
            <p className="text-xs text-slate-500">
              Manage live portfolio items, covers, pricing &amp; Instagram links.
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-slate-500 hover:text-[#0F172A]'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-slate-500 hover:text-[#0F172A]'
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filter Chips & Real-Time Search Bar ── */}
      <div className="p-4 sm:px-6 bg-[#FAF7F2]/40 border-b border-slate-100 flex flex-col gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:text-[#0F172A]'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, price, or caption..."
            className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs transition-all bg-white text-slate-900 placeholder:text-slate-400"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 px-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Content Area: Compact Card Grid or Table View ── */}
      <div className="p-4 sm:p-6 flex-1 min-h-[300px]">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center">
            <Layers className="w-10 h-10 mb-2.5 text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-700">No showcases found</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              {searchQuery
                ? `No items match "${searchQuery}".`
                : 'Upload your first showcase item using the form.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Compact 9:16 Card Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200/90 overflow-hidden bg-white flex flex-col shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* 9:16 Portrait Thumbnail with Cover Badge */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative aspect-[9/16] max-h-60 w-full overflow-hidden bg-slate-950 cursor-pointer"
                  title="Click to view live mobile screen preview"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#0F172A]/85 text-white uppercase tracking-wider backdrop-blur-xs">
                    {item.category}
                  </span>

                  {/* Active Cover Badge */}
                  {item.isCover && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#D4AF37] text-[#0F172A] flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-[#0F172A] text-[#0F172A]" />
                      <span>Cover</span>
                    </span>
                  )}

                  {/* Quick Mobile Preview Eye Hover Button */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 rounded-full bg-white/90 text-[#0F172A] text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </span>
                  </div>
                </div>

                {/* Content & Metadata */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#0F172A] line-clamp-1">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.caption}
                      </p>
                    )}

                    {/* Price & Instagram Indicators */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.price && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF7F2] text-[#0F172A] border border-[#D4AF37]/40">
                          {item.price}
                        </span>
                      )}
                      {item.instagramUrl && (
                        <a
                          href={item.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 text-[10px] flex items-center gap-1 font-semibold"
                          title="Open Instagram Post"
                        >
                          <Instagram className="w-3 h-3" />
                          <span>Post</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleSetCover(item)}
                      disabled={loadingActionId === item.id || item.isCover}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        item.isCover
                          ? 'bg-[#D4AF37]/20 text-[#0F172A] font-bold cursor-default'
                          : 'bg-slate-100 hover:bg-[#D4AF37]/20 text-slate-700 hover:text-[#0F172A]'
                      }`}
                    >
                      {loadingActionId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#0F172A]" />
                      ) : (
                        <Star
                          className={`w-3 h-3 ${
                            item.isCover ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-400'
                          }`}
                        />
                      )}
                      <span>{item.isCover ? 'Primary Cover' : 'Set Cover'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Item"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        title="Delete Item"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Table View ── */
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-[#FAF7F2] text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Thumbnail
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Title &amp; Details
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Cover
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div
                        onClick={() => setPreviewItem(item)}
                        className="relative w-10 h-16 rounded-lg overflow-hidden bg-slate-900 cursor-pointer border border-slate-200"
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
                    <td className="px-4 py-2.5">
                      <div className="max-w-xs">
                        <p className="font-bold text-[#0F172A]">{item.title}</p>
                        {item.caption && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.caption}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.price && (
                            <span className="text-[10px] font-bold text-[#0F172A] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                              {item.price}
                            </span>
                          )}
                          {item.instagramUrl && (
                            <a
                              href={item.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-pink-600 font-semibold flex items-center gap-0.5"
                            >
                              <Instagram className="w-2.5 h-2.5" />
                              <span>Instagram</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0F172A]/5 text-[#0F172A] uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSetCover(item)}
                        disabled={loadingActionId === item.id || item.isCover}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          item.isCover
                            ? 'bg-[#D4AF37]/20 text-[#0F172A] font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            item.isCover ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.isCover ? 'Cover' : 'Set'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Edit Modal with 9:16 Cropper Support ── */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#0F172A]" />
                  <h3 className="font-heading text-lg font-bold text-[#0F172A]">
                    Edit Showcase Item
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Photo Preview / Replace */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Showcase Photo (9:16)
                  </label>
                  <div className="relative aspect-[9/16] max-h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
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
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity font-semibold text-xs cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>Replace Photo</span>
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Title (Design Name)
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs text-slate-900 font-medium"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category Name or ID
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="e.g. Wedding, Baby Shower, Custom"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs text-slate-900 font-medium"
                  />
                </div>

                {/* Price & Instagram URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Starting Price
                    </label>
                    <input
                      type="text"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="e.g. ₹50,000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Instagram Post Link
                    </label>
                    <input
                      type="url"
                      value={editInstagramUrl}
                      onChange={(e) => setEditInstagramUrl(e.target.value)}
                      placeholder="https://www.instagram.com/p/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Caption / Description
                  </label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs text-slate-900 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    )}
                    <span>Save Changes</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-3 text-red-600">
                <div className="p-2 rounded-xl bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Delete Showcase
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{itemToDelete.title}"</span>? This will permanently remove it from the live portfolio.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 9:16 Edit Cropper Modal ── */}
      {isEditCropperOpen && rawEditImageSrc && (
        <ImageCropper
          imageSrc={rawEditImageSrc}
          originalFileName={editFile?.name}
          mimeType={editFile?.type}
          aspect={9 / 16}
          onCropComplete={handleEditCropComplete}
          onCancel={() => setIsEditCropperOpen(false)}
        />
      )}

      {/* ── Live Mobile Screen Preview Modal (375px x 812px) ── */}
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
