'use client';

import React, { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
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
  UploadCloud,
  X,
  Edit2,
  Image as ImageIcon,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/adminActions';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
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

  // Creation state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Edit state
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open Edit Modal
  const handleStartEdit = (cat: CategoryData) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditPreviewUrl(cat.imageUrl || null);
    setEditSelectedFile(null);
    setEditRemoveImage(false);
  };

  const handleCloseEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditSlug('');
    setEditSelectedFile(null);
    if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditPreviewUrl(null);
    setEditRemoveImage(false);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
      setEditRemoveImage(false);
    }
  };

  const handleEditClearFile = () => {
    setEditSelectedFile(null);
    if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditPreviewUrl(null);
    setEditRemoveImage(true);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Handle Create Category Form Submit
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    try {
      let res: any = null;

      // 1. Try multipart POST API endpoint
      try {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('slug', slug.trim());
        if (selectedFile) {
          formData.append('file', selectedFile);
        }

        const apiRes = await fetch('/api/admin/categories', {
          method: 'POST',
          body: formData,
        });

        const resData = await apiRes.json().catch(() => null);
        if (apiRes.ok && resData?.success) {
          res = resData;
        } else if (resData?.error) {
          throw new Error(resData.error);
        }
      } catch (fetchErr: any) {
        console.warn('API category create note, fallback to server action:', fetchErr?.message);
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('slug', slug.trim());
        if (selectedFile) {
          formData.append('file', selectedFile);
        }
        res = await createCategory(formData);
      }

      if (!res || !res.success) {
        throw new Error(res?.error || 'Failed to create category.');
      }

      if (res.category) {
        setCategories((prev) => {
          if (prev.some((c) => c.id === res.category.id)) {
            return prev.map((c) => (c.id === res.category.id ? { ...c, ...res.category } : c));
          }
          return [...prev, res.category];
        });
        showToast('success', `Category "${res.category.name}" created successfully!`);
        setName('');
        setSlug('');
        handleClearFile();
      }
    } catch (err: any) {
      console.error('Create category error:', err);
      showToast('error', err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setIsUpdating(true);

    try {
      let res: any = null;

      try {
        const formData = new FormData();
        formData.append('id', editingCategory.id);
        formData.append('name', editName.trim());
        formData.append('slug', editSlug.trim());
        if (editSelectedFile) {
          formData.append('file', editSelectedFile);
        }
        if (editRemoveImage) {
          formData.append('removeImage', 'true');
        }

        const apiRes = await fetch('/api/admin/categories', {
          method: 'PUT',
          body: formData,
        });

        const resData = await apiRes.json().catch(() => null);
        if (apiRes.ok && resData?.success) {
          res = resData;
        } else if (resData?.error) {
          throw new Error(resData.error);
        }
      } catch (fetchErr: any) {
        console.warn('API category update note, fallback to server action:', fetchErr?.message);
        const formData = new FormData();
        formData.append('id', editingCategory.id);
        formData.append('name', editName.trim());
        formData.append('slug', editSlug.trim());
        if (editSelectedFile) {
          formData.append('file', editSelectedFile);
        }
        if (editRemoveImage) {
          formData.append('removeImage', 'true');
        }
        res = await updateCategory(formData);
      }

      if (!res || !res.success) {
        throw new Error(res?.error || 'Failed to update category.');
      }

      if (res.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === res.category.id ? { ...c, ...res.category } : c))
        );
        showToast('success', `Category "${res.category.name}" updated!`);
        handleCloseEdit();
      }
    } catch (err: any) {
      console.error('Update category error:', err);
      showToast('error', err.message || 'Failed to update category.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Category
  const handleDelete = async (id: string, catName: string) => {
    if (
      !confirm(`Are you sure you want to delete "${catName}"? Any linked items will also be removed.`)
    ) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-8">
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

      {/* Header */}
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
              Create, inspect, and organize bespoke event decor categories with custom cover imagery.
            </p>
          </div>
        </div>
      </div>

      {/* Create New Category Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 rounded-2xl bg-[#FAF7F2]/80 border border-slate-200 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add New Category</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Cover Image is optional</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name & Slug */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Corporate Galas, Haldi Decor, Mehndi"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs bg-white text-slate-900 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. corporate-galas"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs bg-white text-slate-900 font-mono shadow-2xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Auto-generated for portfolio URLs and filters.
              </p>
            </div>
          </div>

          {/* Category Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Cover Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="category-image-input"
            />

            {previewUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs">
                <Image
                  src={previewUrl}
                  alt="Category Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0F172A] bg-white hover:bg-slate-50/80 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer p-4 text-center group"
              >
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-[#0F172A]/10 text-slate-500 group-hover:text-[#0F172A] transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Click to upload category cover
                </p>
                <p className="text-[10px] text-slate-400">
                  PNG, JPG, WEBP recommended (e.g. 16:9 or 1:1)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200/60">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                <span>Saving Category...</span>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Existing Categories ({categories.length})
          </h3>
          <span className="text-xs text-slate-400">
            Displayed across website hero, filters, and portfolio
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-200/60">
            <FolderOpen className="w-10 h-10 mx-auto mb-2.5 opacity-40 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">No categories created yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Add your first event category above to start organizing works.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Category Cover Thumbnail */}
                <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-slate-400 p-4">
                      <Sparkles className="w-8 h-8 text-[#D4AF37] opacity-60 mb-1" />
                      <span className="text-[11px] font-medium text-slate-300">
                        Default System Theme
                      </span>
                    </div>
                  )}

                  {/* Dark gradient overlay for badge contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10 flex items-center gap-1 shadow-xs">
                      <Layers className="w-3 h-3 text-[#D4AF37]" />
                      <span>{cat._count?.items ?? 0} works</span>
                    </span>
                  </div>

                  {/* Category Title on image banner */}
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <h4 className="font-heading text-base font-bold text-white drop-shadow-md truncate">
                      {cat.name}
                    </h4>
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="p-3.5 flex items-center justify-between bg-white">
                  <div>
                    <p className="text-[11px] font-mono text-slate-500">
                      /{cat.slug}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cat.imageUrl ? 'Custom Cover Image' : 'No Cover Uploaded'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 rounded-xl text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={deletingId === cat.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEdit}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FAF7F2]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#0F172A] text-white">
                    <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#0F172A]">
                      Edit Category
                    </h3>
                    <p className="text-[11px] text-slate-500">Update name, slug, or cover image</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (!editSlug) {
                        setEditSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\-]+/g, '')
                        );
                      }
                    }}
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
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category Cover Image
                  </label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="hidden"
                    id="edit-category-image-input"
                  />

                  {editPreviewUrl && !editRemoveImage ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs">
                      <Image
                        src={editPreviewUrl}
                        alt="Category Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleEditClearFile}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditClearFile}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0F172A] bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer p-4 text-center group"
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click to upload new cover image
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Replaces the current category image
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={isUpdating}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || !editName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
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
    </div>
  );
}
