'use client';

import React, { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  PlusCircle,
  Star,
  Eye,
  Crop,
  Plus,
  Tag,
  Instagram,
  Sparkles,
  DollarSign,
  Type,
  FolderPlus,
} from 'lucide-react';
import { createPortfolioItem, createCategory } from '@/app/actions/adminActions';
import ImageCropper from '@/components/ImageCropper';
import MobilePreviewModal from '@/components/MobilePreviewModal';

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface UploadFormProps {
  categories?: CategoryOption[];
  onItemCreated?: (newItem: any) => void;
}

export default function UploadForm({
  categories = [],
  onItemCreated,
}: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.id || 'wedding'
  );
  const [caption, setCaption] = useState('');
  const [price, setPrice] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isCover, setIsCover] = useState(false);

  // File & Crop States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Live Mobile Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Inline Category Creator Modal State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryList, setCategoryList] = useState<CategoryOption[]>(categories);

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // useTransition: disables the Publish button the instant it's tapped,
  // before the multipart upload even begins — eliminates perceived lag on mobile.
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync categoryList if prop changes
  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryList(categories);
      if (!categories.some((c) => c.id === selectedCategory)) {
        setSelectedCategory(categories[0].id);
      }
    }
  }, [categories]);

  // When user selects a raw image file, launch the 9:16 Cropper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const url = URL.createObjectURL(file);
      setRawImageSrc(url);
      setIsCropperOpen(true);
      setFeedback(null);
    }
  };

  const handleCropComplete = (cropped: File, croppedUrl: string) => {
    setCroppedFile(cropped);
    setPreviewUrl(croppedUrl);
    setIsCropperOpen(false);
  };

  const handleClearFile = () => {
    setRawFile(null);
    setCroppedFile(null);
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRawImageSrc(null);
    setPreviewUrl(null);
    setIsCropperOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Inline Category Creator
  const handleCreateNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const res = await createCategory(newCategoryName.trim());
      if (res.success && res.category) {
        const addedCat = {
          id: res.category.id,
          name: res.category.name,
          slug: res.category.slug,
        };
        setCategoryList((prev) => [...prev, addedCat]);
        setSelectedCategory(addedCat.id);
        setNewCategoryName('');
        setIsAddingCategory(false);
      } else {
        alert(res.error || 'Failed to create category.');
      }
    } catch (err: any) {
      console.error('Error creating category:', err);
      alert(err.message || 'Failed to create category.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const selectedCategoryObj = categoryList.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );
  const displayCategoryName = selectedCategoryObj?.name || 'Showcase';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!croppedFile) {
      setFeedback({
        type: 'error',
        message: 'Please upload and crop an image to 9:16 portrait ratio before publishing.',
      });
      return;
    }

    if (!title.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a title (design name) for this portfolio showcase.',
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('file', croppedFile);
        formData.append('title', title.trim());
        formData.append('category', selectedCategory);
        formData.append('caption', caption.trim());
        formData.append('price', price.trim());
        formData.append('instagramUrl', instagramUrl.trim());
        formData.append('isCover', isCover ? 'true' : 'false');

        let result: any = null;

        // 1. Primary: Use dedicated Next.js API route handler for standard multipart upload
        try {
          const res = await fetch('/api/admin/portfolio', {
            method: 'POST',
            body: formData,
          });
          const resData = await res.json().catch(() => null);
          if (res.ok && resData?.success) {
            result = resData;
          } else if (resData?.error) {
            throw new Error(resData.error);
          }
        } catch (fetchErr: any) {
          console.warn('API route note, trying server action fallback:', fetchErr?.message);
          // 2. Fallback to Server Action if needed
          result = await createPortfolioItem(formData);
        }

        if (!result || !result.success) {
          throw new Error(result?.error || 'Failed to upload and save showcase item.');
        }

        setFeedback({
          type: 'success',
          message: result.message || `Showcase "${title}" published to live site!`,
        });

        if (onItemCreated && result.item) {
          onItemCreated(result.item);
        }

        // Reset form
        setTitle('');
        setCaption('');
        setPrice('');
        setInstagramUrl('');
        setIsCover(false);
        handleClearFile();
      } catch (err: any) {
        console.error('Upload form error:', err);
        setFeedback({
          type: 'error',
          message: err.message || 'An unexpected error occurred while saving the showcase.',
        });
      } finally {
        setIsLoading(false);
      }
    });
  };


  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0F172A]/5 text-[#0F172A] border border-[#0F172A]/10">
                <PlusCircle className="w-5 h-5 text-[#0F172A]" />
              </div>
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
                  Upload Showcase
                </h2>
                <p className="text-xs text-slate-500">
                  Mobile-first 9:16 portrait photography &amp; design details.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#D4AF37]/10 text-[#0F172A] border border-[#D4AF37]/30">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>9:16 Portrait</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Alert Notification */}
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-medium ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{feedback.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. Image Cropper Trigger with Collapsible Multi-Ratio Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Showcase Photo <span className="text-red-500">*</span>
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => setIsCropperOpen(true)}
                    className="text-xs text-[#0F172A] hover:text-[#D4AF37] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Adjust Crop &amp; Ratio</span>
                  </button>
                )}
              </div>

              {previewUrl ? (
                /* Collapsed Neat Dynamic Ratio Preview Card */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-w-[240px] max-h-56 min-h-[140px] mx-auto shadow-md group"
                >
                  <img
                    src={previewUrl}
                    alt="Cropped Preview"
                    className="w-full h-full max-h-56 object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-md z-10 cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 text-white text-[10px] flex items-center justify-between">
                    <span className="font-semibold text-[#D4AF37]">Ready</span>
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      className="underline text-slate-200 hover:text-white cursor-pointer"
                    >
                      Change Ratio
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] group flex flex-col items-center justify-center"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#0F172A] group-hover:scale-110 transition-all mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-[#0F172A]">
                    Click or drag image here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cropped automatically to 9:16 mobile portrait
                  </p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* 2. Floating / Border-Bottom Input: Title (Design Name) */}
            <div className="relative z-0 w-full group pt-1">
              <input
                type="text"
                id="item-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder=" "
                className="peer block w-full appearance-none border-0 border-b border-slate-300 bg-transparent py-2.5 px-0 text-sm text-slate-900 font-medium focus:border-[#0F172A] focus:outline-none focus:ring-0 transition-colors"
              />
              <label
                htmlFor="item-title"
                className={`absolute top-3 -z-10 origin-[0] text-xs duration-300 transform cursor-text flex items-center gap-1.5 ${
                  title
                    ? '-translate-y-5 scale-90 text-[#0F172A] font-bold'
                    : 'translate-y-0 scale-100 text-slate-400 font-normal'
                } peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-[#0F172A] peer-focus:font-bold`}
              >
                <Type className="w-3.5 h-3.5 text-slate-400 peer-focus:text-[#0F172A]" />
                <span>Title (Design Name)</span>
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 3. Category Dropdown with Inline Category Modal Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="item-category"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-[#D4AF37]" />
                  <span>Category</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="text-[11px] text-[#0F172A] hover:text-[#D4AF37] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3 text-[#D4AF37]" />
                  <span>+ Add New Category</span>
                </button>
              </div>

              <select
                id="item-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs font-medium transition-all bg-white text-slate-900 cursor-pointer"
              >
                {categoryList.length > 0 ? (
                  categoryList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="wedding">Wedding</option>
                    <option value="baby-shower">Baby Shower</option>
                    <option value="ear-piercing">Ear Piercing</option>
                  </>
                )}
              </select>
            </div>

            {/* 4. Starting Price & Instagram URL Grid (Border-bottom inputs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Starting Price */}
              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  id="item-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder=" "
                  className="peer block w-full appearance-none border-0 border-b border-slate-300 bg-transparent py-2 px-0 text-xs text-slate-900 font-medium focus:border-[#0F172A] focus:outline-none focus:ring-0 transition-colors"
                />
                <label
                  htmlFor="item-price"
                  className={`absolute top-2.5 -z-10 origin-[0] text-xs duration-300 transform cursor-text flex items-center gap-1 ${
                    price
                      ? '-translate-y-4 scale-90 text-[#0F172A] font-bold'
                      : 'translate-y-0 scale-100 text-slate-400 font-normal'
                  } peer-focus:-translate-y-4 peer-focus:scale-90 peer-focus:text-[#0F172A] peer-focus:font-bold`}
                >
                  <DollarSign className="w-3 h-3 text-slate-400" />
                  <span>Starting Price (e.g. ₹45,000)</span>
                </label>
              </div>

              {/* Instagram URL */}
              <div className="relative z-0 w-full group">
                <input
                  type="url"
                  id="item-instagram"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder=" "
                  className="peer block w-full appearance-none border-0 border-b border-slate-300 bg-transparent py-2 px-0 text-xs text-slate-900 font-medium focus:border-[#0F172A] focus:outline-none focus:ring-0 transition-colors"
                />
                <label
                  htmlFor="item-instagram"
                  className={`absolute top-2.5 -z-10 origin-[0] text-xs duration-300 transform cursor-text flex items-center gap-1 ${
                    instagramUrl
                      ? '-translate-y-4 scale-90 text-[#0F172A] font-bold'
                      : 'translate-y-0 scale-100 text-slate-400 font-normal'
                  } peer-focus:-translate-y-4 peer-focus:scale-90 peer-focus:text-[#0F172A] peer-focus:font-bold`}
                >
                  <Instagram className="w-3 h-3 text-pink-500" />
                  <span>Instagram Post Link</span>
                </label>
              </div>
            </div>

            {/* 5. Description / Caption (textarea with 2-line max initial height) */}
            <div>
              <label
                htmlFor="item-caption"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
              >
                Description / Caption <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="item-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                placeholder="Highlight design elements, floral details, or themes..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs transition-all bg-white text-slate-900 resize-none max-h-20 placeholder:text-slate-400"
              />
            </div>

            {/* 6. Category Cover Checkbox */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] cursor-pointer transition-colors text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={isCover}
                  onChange={(e) => setIsCover(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F172A] focus:ring-[#0F172A] border-slate-300 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isCover ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-400'
                    }`}
                  />
                  <span>Feature as Primary Category Cover Photo</span>
                </span>
              </label>
            </div>

            {/* 7. Action Bar: Side-by-side Preview Showcase & Publish */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                disabled={!previewUrl}
                className="flex-1 py-3 px-3.5 rounded-xl border border-slate-300 hover:border-[#0F172A] bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-[#0F172A]" />
                <span>Preview Showcase</span>
              </button>

              <button
                type="submit"
                disabled={isPending || isLoading || !croppedFile}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-[#0F172A]"
              >
                {isPending || isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                    <span>{isPending && !isLoading ? 'Processing…' : 'Publishing…'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Publish to Live Site</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Quick Inline Add Category Modal ── */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#0F172A]" />
                  <h3 className="font-heading text-base font-bold text-[#0F172A]">
                    Add New Category
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Corporate Galas, Haldi Decor"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingCategory ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    )}
                    <span>Save Category</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Flexible Image Cropper Modal ── */}
      {isCropperOpen && rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          rawFile={rawFile}
          originalFileName={rawFile?.name}
          mimeType={rawFile?.type}
          aspect={4 / 5}
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropperOpen(false)}
        />
      )}

      {/* ── Live Mobile Screen Preview Modal (375px x 812px) ── */}
      <MobilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={title || 'Showcase Design Name'}
        category={displayCategoryName}
        caption={caption}
        price={price}
        instagramUrl={instagramUrl}
        imageUrl={previewUrl || ''}
      />
    </>
  );
}
