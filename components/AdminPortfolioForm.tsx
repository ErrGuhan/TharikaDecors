'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, X, Plus } from 'lucide-react';

interface AdminPortfolioFormProps {
  userEmail?: string;
  onItemAdded?: (item: any) => void;
}

const CATEGORIES = [
  'Wedding',
  'Baby Shower',
  'Ear Piercing',
  'Birthday',
  'Reception',
  'Other',
];

export default function AdminPortfolioForm({
  userEmail,
  onItemAdded,
}: AdminPortfolioFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wedding');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setStatusMessage(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setStatusMessage({
        type: 'error',
        text: 'Please select an image file to upload.',
      });
      return;
    }

    if (!title.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a title for the portfolio item.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('category', category);
      if (userEmail) {
        formData.append('userEmail', userEmail);
      }

      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload portfolio item.');
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded "${title}" to Supabase & saved via Prisma!`,
      });

      // Reset form
      setTitle('');
      setCategory('Wedding');
      handleClearFile();

      if (onItemAdded && data.item) {
        onItemAdded(data.item);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred during submission.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 rounded-xl bg-tharika-blue/5 text-tharika-blue">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl text-tharika-blue font-semibold">
            Add New Portfolio Showcase
          </h2>
          <p className="text-xs text-gray-500">
            Upload images to Supabase Storage and persist metadata in PostgreSQL with Prisma.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              )}
              <span className="leading-snug">{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. File Upload Dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
            Event Image File <span className="text-red-500">*</span>
          </label>

          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video max-h-56 bg-gray-50 flex items-center justify-center">
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
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-md"
                aria-label="Remove selected image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 text-white text-xs font-mono">
                {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(0)} KB)
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-tharika-blue rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-tharika-blue/5 group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-tharika-blue group-hover:scale-110 transition-all mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-tharika-blue">
                Click or drag &amp; drop event photo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP up to 10MB
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

        {/* 2. Text field for Title */}
        <div>
          <label
            htmlFor="portfolio-title"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2"
          >
            Showcase Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="portfolio-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grand Floral Stage & Mandap"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all"
          />
        </div>

        {/* 3. Select Dropdown for Event Category */}
        <div>
          <label
            htmlFor="portfolio-category"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2"
          >
            Event Category <span className="text-red-500">*</span>
          </label>
          <select
            id="portfolio-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tharika-blue focus:ring-2 focus:ring-tharika-blue/20 outline-none text-sm transition-all bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-tharika-blue hover:bg-[#072844] active:scale-[0.99] text-white font-medium text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Uploading to Supabase &amp; Prisma...</span>
            </>
          ) : (
            <span>Publish Portfolio Item</span>
          )}
        </button>
      </form>
    </div>
  );
}
