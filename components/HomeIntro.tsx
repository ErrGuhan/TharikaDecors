'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function HomeIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);

    // Only show the intro once per browser session — not on every page visit.
    const alreadyPlayed = sessionStorage.getItem('tharika-intro-played');
    if (!alreadyPlayed) {
      setShowIntro(true);
    }
  }, []);

  const handleEnd = () => {
    sessionStorage.setItem('tharika-intro-played', '1');
    setShowIntro(false);
  };

  const handleSkip = () => {
    // Pause + mark done so onEnded doesn't fire a second time
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleEnd();
  };

  // Don't render anything until client-side hydration is complete
  // (avoids a server/client mismatch on `showIntro`)
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          key="home-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#FAF7F2] flex items-center justify-center overflow-hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Tharika Decors intro"
        >
          {/* Full-screen video */}
          <video
            ref={videoRef}
            src="/tharika-intro.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleEnd}
            className="w-full h-full object-cover"
          />

          {/* Subtle skip button — bottom-right corner */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-10 right-10 z-[101] flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 cursor-pointer select-none group"
            aria-label="Skip intro"
          >
            <span>Skip</span>
            {/* Animated arrow */}
            <svg
              className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
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
          <div className="absolute bottom-10 left-10 z-[101]">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 select-none">
              Tharika Decors
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
