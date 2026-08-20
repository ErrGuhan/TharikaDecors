'use client';

import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { createPortfolioItem, createCategory } from '@/app/actions/adminActions';
import ImageCropper from '@/components/ImageCropper';
import MobilePreviewModal from '@/components/MobilePreviewModal';

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface UploadFormProps {
  categories?: CategoryOption[];
}

export default function UploadForm({ categories = [] }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.id || 'wedding'
  );
  const [caption, setCaption] = useState('');
  const [isCover, setIsCover] = useState(false);

  // File & Crop States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Live Mobile Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // New Category inline creation
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryList, setCategoryList] = useState<CategoryOption[]>(categories);

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await createCategory(newCategoryName.trim());
      if (res.success && res.category) {
        setCategoryList((prev) => [...prev, res.category]);
        setSelectedCategory(res.category.id);
        setNewCategoryName('');
        setIsAddingCategory(false);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const selectedCategoryObj = categoryList.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );
  const displayCategoryName = selectedCategoryObj?.name || selectedCategory;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!croppedFile) {
      setFeedback({
        type: 'error',
        message: 'Please upload and crop an image to 9:16 portrait ratio before publishing.',
      });
      return;
    }

    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a title for this portfolio showcase.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('title', title.trim());
      formData.append('category', selectedCategory);
      formData.append('caption', caption.trim());
      formData.append('isCover', isCover ? 'true' : 'false');

      // Invoke Server Action
      const result = await createPortfolioItem(formData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload and save portfolio item.');
      }

      setFeedback({
        type: 'success',
        message: result.message || `Showcase "${title}" published successfully!`,
      });

      // Reset form
      setTitle('');
      setCaption('');
      setIsCover(false);
      handleClearFile();
    } catch (err: any) {
      console.error('Upload form error:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred during submission.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-tharika-blue/10 text-tharika-blue">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl text-tharika-blue font-semibold">
                Upload New Showcase
              </h2>
              <p className="text-xs text-gray-500">
                Upload 9:16 mobile-first photography directly to Supabase &amp; Prisma database.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status Alerts */}
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                )}
                <span className="leading-snug">{feedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. File Input with 9:16 Cropped Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                9:16 Portrait Image <span className="text-red-500">*</span>
              </label>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => setIsCropperOpen(true)}
                  className="text-xs text-tharika-blue hover:text-tharika-green font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Adjust Crop</span>
                </button>
              )}
            </div>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black flex items-center justify-center max-w-[240px] mx-auto aspect-[9/16] shadow-md group">
                <Image
                  src={previewUrl}
                  alt="Cropped 9:16 Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors shadow-md z-10"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-[11px] font-mono flex items-center justify-between">
                  <span>9:16 Cropped</span>
                  <span className="text-[10px] text-gray-300 truncate max-w-[120px]">
                    {croppedFile?.name}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-tharika-blue rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-tharika-blue/5 group flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-tharika-blue group-hover:scale-110 transition-all mb-2.5">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-tharika-blue">
                  Click or drag &amp; drop event photo
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You will be prompted to crop to 9:16 portrait aspect ratio
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

          {/* 2. Text input for 'Title' */}
          <div>
            <label
              htmlFor="item-title"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="item-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Royal Grand Floral Mandap"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900"
            />
          </div>

          {/* 3. Category & Cover Checkbox Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="item-category"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-[11px] text-tharika-blue hover:text-tharika-green font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingCategory ? 'Cancel' : 'New'}</span>
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-tharika-blue outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="px-3 py-2 text-xs rounded-xl bg-tharika-blue text-white font-medium hover:bg-[#072844]"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  id="item-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900 cursor-pointer"
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
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Category Cover
              </label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors text-xs text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={isCover}
                  onChange={(e) => setIsCover(e.target.checked)}
                  className="w-4 h-4 rounded text-tharika-blue focus:ring-tharika-blue border-gray-300 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isCover ? 'fill-amber-500 text-amber-500' : 'text-gray-400'
                    }`}
                  />
                  Make Category Cover Photo
                </span>
              </label>
            </div>
          </div>

          {/* 4. Caption Input */}
          <div>
            <label
              htmlFor="item-caption"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              Caption / Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="item-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Add description or styling highlights..."
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900"
            />
          </div>

          {/* 5. Buttons: Live Mobile Preview & Publish */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              disabled={!previewUrl}
              className="flex-1 py-3.5 px-4 rounded-xl border border-gray-300 hover:border-tharika-blue bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Eye className="w-4 h-4 text-tharika-blue" />
              <span>Preview on Mobile</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !croppedFile}
              className="flex-1 py-3.5 px-6 rounded-xl bg-tharika-blue hover:bg-[#072844] active:scale-[0.99] text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Showcase Item</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── 9:16 Image Cropper Modal ── */}
      {isCropperOpen && rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          originalFileName={rawFile?.name}
          mimeType={rawFile?.type}
          aspect={9 / 16}
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropperOpen(false)}
        />
      )}

      {/* ── Live Mobile Screen Preview Modal (375px x 812px) ── */}
      <MobilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={title}
        category={displayCategoryName}
        caption={caption}
        imageUrl={previewUrl || ''}
      />
    </>
  );
}
