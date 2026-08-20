'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X, Loader2, Smartphone } from 'lucide-react';
import getCroppedImg, { Area } from '@/lib/cropImage';

interface ImageCropperProps {
  imageSrc: string;
  originalFileName?: string;
  mimeType?: string;
  aspect?: number;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  originalFileName = 'showcase.jpg',
  mimeType = 'image/jpeg',
  aspect = 9 / 16,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        `cropped-${Date.now()}-${originalFileName}`,
        mimeType
      );
      const croppedPreviewUrl = URL.createObjectURL(croppedFile);
      onCropComplete(croppedFile, croppedPreviewUrl);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-tharika-blue/40 text-tharika-gold">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-white font-semibold flex items-center gap-2">
                <span>Crop Portfolio Image</span>
                <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-tharika-blue text-blue-200 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> 9:16 Portrait
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Drag and zoom to compose the full-screen mobile showcase.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Cancel crop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[450px] sm:h-[500px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            showGrid={true}
            cropShape="rect"
            style={{
              containerStyle: { background: '#09090b' },
              cropAreaStyle: {
                border: '2px solid rgba(179, 135, 40, 0.9)',
                boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.65)',
                borderRadius: '12px',
              },
            }}
          />
        </div>

        {/* Controls Toolbar */}
        <div className="p-5 bg-gray-900 border-t border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 flex-1">
              <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-label="Zoom slider"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tharika-gold"
              />
              <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs font-mono text-gray-400 w-9 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Quick Tools */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                  setRotation(0);
                }}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-tharika-gold-gradient text-tharika-blue font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cropping...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
