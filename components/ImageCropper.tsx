'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Smartphone,
  Square,
  Tv,
} from 'lucide-react';
import getCroppedImg, { Area } from '@/lib/cropImage';

export interface AspectRatioOption {
  id: string;
  label: string;
  sublabel?: string;
  aspect: number | undefined;
  icon: React.ReactNode;
  recommended?: boolean;
}

interface ImageCropperProps {
  imageSrc: string;
  rawFile?: File | null;
  originalFileName?: string;
  mimeType?: string;
  aspect?: number;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  rawFile,
  originalFileName = 'showcase.jpg',
  mimeType = 'image/jpeg',
  aspect: initialAspect = 4 / 5,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [selectedAspectId, setSelectedAspectId] = useState<string>('4:5');
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const aspectOptions: AspectRatioOption[] = [
    {
      id: '4:5',
      label: '4:5 Portrait',
      sublabel: 'Recommended for feed cards',
      aspect: 4 / 5,
      icon: <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />,
      recommended: true,
    },
    {
      id: '16:9',
      label: '16:9 Landscape',
      sublabel: 'Wide stage & mandap',
      aspect: 16 / 9,
      icon: <Tv className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      id: '4:3',
      label: '4:3 Standard',
      sublabel: 'Standard landscape',
      aspect: 4 / 3,
      icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: '1:1',
      label: '1:1 Square',
      sublabel: 'Instagram square grid',
      aspect: 1 / 1,
      icon: <Square className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      id: '9:16',
      label: '9:16 Full Portrait',
      sublabel: 'Stories & Reels full vertical',
      aspect: 9 / 16,
      icon: <Smartphone className="w-3.5 h-3.5 text-pink-400" />,
    },
    {
      id: 'free',
      label: 'Original / Free',
      sublabel: 'Custom freeform aspect',
      aspect: undefined,
      icon: <Maximize2 className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  const handleSelectAspect = (option: AspectRatioOption) => {
    setSelectedAspectId(option.id);
    setAspect(option.aspect);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixelsParam: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsParam);
    },
    []
  );

  // Skip Crop / Use Original Image
  const handleUseOriginal = async () => {
    try {
      setIsProcessing(true);
      let fileToEmit: File;
      if (rawFile) {
        fileToEmit = rawFile;
      } else {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        fileToEmit = new File([blob], originalFileName, { type: mimeType });
      }
      onCropComplete(fileToEmit, imageSrc);
    } catch (err) {
      console.error('Error using original image:', err);
      onCancel();
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Dynamic Crop
  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) {
      handleUseOriginal();
      return;
    }

    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        `cropped-${Date.now()}-${originalFileName}`,
        mimeType
      );
      const croppedPreviewUrl = URL.createObjectURL(croppedFile);
      onCropComplete(croppedFile, croppedPreviewUrl);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again or use the Original image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col max-h-[94vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0F172A] border border-[#D4AF37]/30 text-[#D4AF37]">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg text-white font-bold flex items-center gap-2">
                <span>Compose Showcase Image</span>
                <span className="text-[10px] font-sans font-extrabold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  {aspectOptions.find((a) => a.id === selectedAspectId)?.label}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose an aspect ratio suitable for wide stage decors or portrait cards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseOriginal}
              disabled={isProcessing}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Skip cropping and use full untouched photo"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Use Original (Skip Crop)</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cancel crop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 1. Aspect Ratio Selector Bar ── */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex-shrink-0 pl-1">
            Ratio:
          </span>
          <div className="flex items-center gap-1.5">
            {aspectOptions.map((opt) => {
              const isSelected = selectedAspectId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectAspect(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border border-[#D4AF37] shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={opt.sublabel}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  {opt.recommended && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-[#D4AF37] text-slate-950">
                      Best
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Cropper Canvas with objectFit="contain" and Zoom 0.5x to 3x ── */}
        <div className="relative w-full h-[380px] sm:h-[430px] bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={0.5}
            maxZoom={3}
            rotation={rotation}
            aspect={aspect}
            objectFit="contain"
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            showGrid={true}
            cropShape="rect"
            style={{
              containerStyle: { background: '#020617' },
              cropAreaStyle: {
                border: '2px solid #D4AF37',
                boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.75)',
                borderRadius: '12px',
              },
            }}
          />
        </div>

        {/* ── 3. Controls & Action Toolbar ── */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Zoom Slider (0.5x to 3x) */}
            <div className="flex items-center gap-2.5 flex-1">
              <span className="text-[11px] font-bold text-slate-400 w-10">Zoom</span>
              <ZoomOut className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="range"
                value={zoom}
                min={0.5}
                max={3}
                step={0.02}
                aria-label="Zoom slider"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
              <ZoomIn className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs font-mono font-bold text-[#D4AF37] w-12 text-right">
                {zoom.toFixed(2)}x
              </span>
            </div>

            {/* Rotation and Reset Controls */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                  setRotation(0);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleUseOriginal}
              disabled={isProcessing}
              className="sm:hidden text-xs font-semibold text-slate-300 hover:text-white underline cursor-pointer"
            >
              Skip Crop (Use Original)
            </button>

            <div className="flex items-center justify-end gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2f] text-[#0F172A] font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Composition</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
