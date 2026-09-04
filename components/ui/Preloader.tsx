"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PreloaderProps {
  onComplete?: () => void;
  skipIfSeen?: boolean;
}

export default function Preloader({ onComplete, skipIfSeen = false }: PreloaderProps) {
  const pathname = usePathname();
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const welcomeScreenRef = useRef<HTMLDivElement>(null);
  const brandScreenRef = useRef<HTMLDivElement>(null);
  const upperCurtainsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lowerCurtainsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isRunning = useRef(false);

  // Bypass preloader completely on admin or login routes
  const isAdminOrLogin = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAdminOrLogin) {
      setIsDone(true);
      return;
    }

    if (skipIfSeen && sessionStorage.getItem("tharika_preloader_seen")) {
      setIsDone(true);
      onComplete?.();
      return;
    }

    if (isRunning.current) return;
    isRunning.current = true;

    // Start from the top on page reload
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const welcomeLetters = welcomeScreenRef.current?.querySelectorAll(".welcome-letter");
    const brandLetters = brandScreenRef.current?.querySelectorAll(".brand-letter");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setIsDone(true);
        sessionStorage.setItem("tharika_preloader_seen", "true");
        onComplete?.();
        ScrollTrigger.refresh();
      }, 0);
      return () => clearTimeout(timer);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsDone(true);
        sessionStorage.setItem("tharika_preloader_seen", "true");
        onComplete?.();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("resize"));
          ScrollTrigger.refresh();
        }
      },
    });

    // =========================================================================
    // PHASE 1: "Tharika Decors & Events" - Regal Handwriting Animation
    // Letters write sequentially from left to right
    // =========================================================================
    if (welcomeLetters && welcomeLetters.length) {
      tl.to(
        welcomeLetters,
        {
          clipPath: "polygon(-40% -60%, 200% -60%, 180% 160%, -60% 160%)",
          opacity: 1,
          duration: 0.15,
          stagger: 0.045,
          ease: "power1.inOut",
        },
        "+=0.1"
      );
      // Remove clipPath once revealed to prevent any glyph clipping
      tl.set(welcomeLetters, { clipPath: "none" });
    }

    // Brief hold to appreciate "Tharika Decors & Events"
    tl.to({}, { duration: 0.45 });

    // Clean dissolve out of Phase 1
    tl.to(welcomeScreenRef.current, {
      opacity: 0,
      scale: 0.98,
      duration: 0.22,
      ease: "power2.inOut",
    });

    // =========================================================================
    // PHASE 2: "Crafting Royal Moments & Grand Celebrations"
    // Letters reveal sequentially with warm radiant gold glow
    // =========================================================================
    tl.set(brandScreenRef.current, {
      opacity: 1,
      scale: 0.99,
    });

    if (brandLetters && brandLetters.length) {
      tl.to(
        brandLetters,
        {
          clipPath: "polygon(-40% -60%, 200% -60%, 180% 160%, -60% 160%)",
          opacity: 1,
          duration: 0.14,
          stagger: 0.035,
          ease: "power1.inOut",
        },
        "+=0.08"
      );
      tl.set(brandLetters, { clipPath: "none" });
    }

    // Brief hold to admire brand signature
    tl.to({}, { duration: 0.6 });

    // Quick text dissolve immediately before the curtain opens
    tl.to(brandScreenRef.current, {
      opacity: 0,
      scale: 1.02,
      duration: 0.2,
      ease: "power2.in",
    });

    // =========================================================================
    // PHASE 3: 12-Piece Split Curtain Lifting Sequence
    // Upper 6 panels lift UP, Lower 6 panels drop DOWN in a center-out wave
    // =========================================================================
    const columnOrder = [2, 3, 1, 4, 0, 5];
    const columnDelays: Record<number, number> = {
      2: 0,
      3: 0,
      1: 0.08,
      4: 0.08,
      0: 0.16,
      5: 0.16,
    };

    columnOrder.forEach((colIdx) => {
      const upper = upperCurtainsRef.current[colIdx];
      const lower = lowerCurtainsRef.current[colIdx];
      const delay = columnDelays[colIdx];

      if (upper) {
        tl.to(
          upper,
          {
            yPercent: -100,
            duration: 0.85,
            ease: "power3.inOut",
          },
          `<+=${delay}`
        );
      }

      if (lower) {
        tl.to(
          lower,
          {
            yPercent: 100,
            duration: 0.85,
            ease: "power3.inOut",
          },
          `<`
        );
      }
    });

    return () => {
      tl.kill();
    };
  }, [onComplete, isAdminOrLogin, skipIfSeen]);

  if (isDone || isAdminOrLogin) return null;

  return (
    <div
      ref={containerRef}
      id="preloader-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* =======================================================================
          12-Piece Split Curtain System (Upper 6 Panels & Lower 6 Panels)
         ======================================================================= */}
      <div className="fixed inset-0 z-[99990] pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`curtain-col-${i}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i * 100) / 6}%`,
              width: `calc(100% / 6 + 1px)`,
            }}
          >
            {/* Upper Half Panel (Lifts UP) */}
            <div
              ref={(el) => {
                upperCurtainsRef.current[i] = el;
              }}
              className="absolute top-0 left-0 w-full h-[50.5vh] bg-[#070B10] border-b border-[#E5B842]/30 origin-top will-change-transform shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            />
            {/* Bottom Half Panel (Drops DOWN) */}
            <div
              ref={(el) => {
                lowerCurtainsRef.current[i] = el;
              }}
              className="absolute bottom-0 left-0 w-full h-[50.5vh] bg-[#070B10] border-t border-[#E5B842]/30 origin-bottom will-change-transform shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
            />
          </div>
        ))}
      </div>

      {/* =======================================================================
          Centered Typography Content (Regal Gold Script)
         ======================================================================= */}
      <div className="relative z-[99995] flex flex-col items-center justify-center w-full max-w-5xl px-6 pointer-events-none">
        {/* PHASE 1: "Tharika Decors & Events" */}
        <div
          ref={welcomeScreenRef}
          className="flex flex-col items-center justify-center w-full"
        >
          <h1
            className="font-script font-bold text-[clamp(2.2rem,6.5vw,5.5rem)] text-[#E5B842] leading-tight tracking-normal text-center px-4 py-2 select-none flex flex-wrap items-center justify-center drop-shadow-[0_2px_18px_rgba(229,184,66,0.45)]"
          >
            {"Tharika Decors & Events".split(" ").map((word, wIdx, arr) => (
              <span key={`welcome-word-${wIdx}`} className="inline-flex items-center whitespace-nowrap">
                {word.split("").map((char, cIdx) => (
                  <span
                    key={`welcome-letter-${wIdx}-${cIdx}`}
                    className="welcome-letter inline-block will-change-[clip-path,opacity]"
                    style={{
                      clipPath: "polygon(-40% -60%, -40% -60%, -60% 160%, -60% 160%)",
                      opacity: 0,
                    }}
                  >
                    {char}
                  </span>
                ))}
                {wIdx < arr.length - 1 && <span className="inline-block w-[0.28em]">&nbsp;</span>}
              </span>
            ))}
          </h1>
        </div>

        {/* PHASE 2: "Crafting Royal Moments & Grand Celebrations" */}
        <div
          ref={brandScreenRef}
          className="absolute inset-0 flex flex-col items-center justify-center w-full opacity-0 pointer-events-none px-4"
        >
          <h2
            className="font-script font-bold text-[clamp(1.6rem,4.5vw,3.8rem)] text-[#E5B842] leading-snug tracking-normal text-center px-4 py-2 select-none flex flex-wrap items-center justify-center drop-shadow-[0_2px_18px_rgba(229,184,66,0.45)] max-w-4xl mx-auto"
          >
            {"Crafting Royal Moments & Grand Celebrations".split(" ").map((word, wIdx, arr) => (
              <span key={`brand-word-${wIdx}`} className="inline-flex items-center whitespace-nowrap">
                {word.split("").map((char, cIdx) => (
                  <span
                    key={`brand-letter-${wIdx}-${cIdx}`}
                    className="brand-letter inline-block will-change-[clip-path,opacity]"
                    style={{
                      clipPath: "polygon(-40% -60%, -40% -60%, -60% 160%, -60% 160%)",
                      opacity: 0,
                    }}
                  >
                    {char}
                  </span>
                ))}
                {wIdx < arr.length - 1 && <span className="inline-block w-[0.28em]">&nbsp;</span>}
              </span>
            ))}
          </h2>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#E5B842]/85 mt-3 font-medium text-center">
            Luxury Event Styling &amp; Decors
          </p>
        </div>
      </div>
    </div>
  );
}
