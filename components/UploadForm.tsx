'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, PlusCircle } from 'lucide-react';
import { uploadPortfolioItem } from '@/app/actions/adminActions';

export default function UploadForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'wedding' | 'baby-shower' | 'ear-piercing'>('wedding');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFeedback(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      setFeedback({ type: 'error', message: 'Please select a high-resolution image file.' });
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
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('category', category);

      // Invoke Server Action
      const result = await uploadPortfolioItem(formData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload and save portfolio item.');
      }

      setFeedback({
        type: 'success',
        message: result.message || `Showcase "${title}" published successfully!`,
      });

      // Reset form
      setTitle('');
      setCategory('wedding');
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
    <div className="bg-white rounded-2xl shadow-xl border border-tharika-blue/10 p-6 sm:p-8">
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
        <div className="p-2.5 rounded-xl bg-tharika-blue/10 text-tharika-blue">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl text-tharika-blue font-semibold">
            Upload Showcase Item
          </h2>
          <p className="text-xs text-gray-500">
            Upload high-resolution event imagery to Supabase &amp; Prisma database.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* 1. File Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-tharika-blue mb-2">
            High-Resolution Image <span className="text-red-500">*</span>
          </label>

          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video max-h-56 bg-tharika-cream flex items-center justify-center">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={handleClearFile}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors shadow-md"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 text-white text-xs font-mono">
                {selectedFile?.name}
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-tharika-blue rounded-2xl p-8 text-center cursor-pointer transition-colors bg-tharika-cream/50 hover:bg-tharika-blue/5 group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-tharika-blue group-hover:scale-110 transition-all mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-tharika-blue">
                Click or drag &amp; drop event photo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP up to 15MB
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
            className="block text-xs font-semibold uppercase tracking-wider text-tharika-blue mb-2"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="item-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Royal Crystal Mandap & Stage"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900"
          />
        </div>

        {/* 3. Select dropdown for 'Category' */}
        <div>
          <label
            htmlFor="item-category"
            className="block text-xs font-semibold uppercase tracking-wider text-tharika-blue mb-2"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="item-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white text-gray-900 cursor-pointer"
          >
            <option value="wedding">Wedding</option>
            <option value="baby-shower">Baby Shower</option>
            <option value="ear-piercing">Ear Piercing</option>
          </select>
        </div>

        {/* 4. Submit button with a loading state */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl bg-tharika-blue hover:bg-[#072844] active:scale-[0.99] text-white font-medium text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Uploading to Supabase &amp; Saving...</span>
            </>
          ) : (
            <span>Publish Showcase Item</span>
          )}
        </button>
      </form>
    </div>
  );
}
