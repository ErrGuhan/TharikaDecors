'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function HomeIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);

    // Only show the intro once per browser session
    const alreadyPlayed = sessionStorage.getItem('tharika-intro-played');
    if (!alreadyPlayed) {
      setShowIntro(true);
    }
  }, []);

  // Safety fallback: if video stalls or takes longer than 11 seconds, auto dismiss
  useEffect(() => {
    if (!showIntro) return;

    const safetyTimer = setTimeout(() => {
      handleEnd();
    }, 11000);

    return () => clearTimeout(safetyTimer);
  }, [showIntro]);

  const handleEnd = () => {
    try {
      sessionStorage.setItem('tharika-intro-played', '1');
    } catch {
      // Ignore sessionStorage exceptions (e.g. private browsing modes)
    }
    setShowIntro(false);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleEnd();
  };

  // Don't render anything until client-side hydration is complete
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          key="home-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#FAF7F2] flex items-center justify-center overflow-hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Tharika Decors intro"
        >
          {/* Full-screen compressed video with faststart streaming */}
          <video
            ref={videoRef}
            src="/tharika-intro.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/wedding-cover.jpg"
            onEnded={handleEnd}
            onError={handleEnd}
            className="w-full h-full object-cover"
          />

          {/* Skip button — bottom-right corner */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-[101] flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md text-xs font-semibold text-white/90 hover:text-white hover:bg-black/50 transition-all duration-200 cursor-pointer select-none group border border-white/10 shadow-lg"
            aria-label="Skip intro"
          >
            <span>Skip</span>
            <svg
              className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Subtle logo watermark — bottom-left */}
          <div className="absolute bottom-8 left-8 z-[101] pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 select-none drop-shadow-sm">
              Tharika Decors
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
