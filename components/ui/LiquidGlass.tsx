'use client';

import React, { useRef, useState } from 'react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  shape?: 'pill' | 'rounded' | 'circle' | 'square';
  tint?: 'navy' | 'gold' | 'ivory' | 'glass';
  blurRadius?: number;
  specular?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function LiquidGlass({
  children,
  className = '',
  shape = 'rounded',
  tint = 'glass',
  blurRadius = 16,
  specular = true,
  interactive = true,
  onClick,
  style,
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const [isHovered, setIsHovered] = useState(false);

  // Shape classes
  const shapeClass =
    shape === 'pill'
      ? 'rounded-full'
      : shape === 'circle'
      ? 'rounded-full aspect-square'
      : shape === 'square'
      ? 'rounded-none'
      : 'rounded-2xl sm:rounded-3xl';

  // Tint styling aligned to Tharika Decors luxury royal palette
  const tintStyles = {
    navy: {
      bg: 'bg-[#0A3659]/80',
      border: 'border-[#D4AF37]/30',
      glow: 'rgba(212, 175, 55, 0.25)',
      chroma: 'rgba(252, 246, 186, 0.2)',
    },
    gold: {
      bg: 'bg-gradient-to-br from-[#BF953F]/20 via-[#FCF6BA]/10 to-[#AA771C]/20',
      border: 'border-[#D4AF37]/45',
      glow: 'rgba(212, 175, 55, 0.35)',
      chroma: 'rgba(255, 235, 160, 0.3)',
    },
    ivory: {
      bg: 'bg-[#FAF7F2]/85',
      border: 'border-white/80',
      glow: 'rgba(10, 54, 89, 0.08)',
      chroma: 'rgba(212, 175, 55, 0.15)',
    },
    glass: {
      bg: 'bg-white/70',
      border: 'border-white/40',
      glow: 'rgba(255, 255, 255, 0.3)',
      chroma: 'rgba(212, 175, 55, 0.18)',
    },
  }[tint];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 });
      }}
      className={`relative group backdrop-blur-xl ${tintStyles.bg} ${tintStyles.border} border shadow-[0_8px_32px_0_rgba(10,54,89,0.08)] overflow-hidden transition-all duration-500 ${shapeClass} ${className}`}
      style={{
        ...style,
        backdropFilter: `blur(${blurRadius}px) saturate(140%)`,
        WebkitBackdropFilter: `blur(${blurRadius}px) saturate(140%)`,
      }}
    >
      {/* Liquid Refraction & Chromatic Aberration Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${tintStyles.chroma} 0%, transparent 65%)`,
        }}
      />

      {/* Dynamic Specular Sheen (Apple Liquid Glass Optical Highlight) */}
      {specular && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.7 : 0.25,
            background: `radial-gradient(circle 160px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)`,
          }}
        />
      )}

      {/* Beveled Edge Highlight (Prismatic Top Rim Highlight) */}
      <div
        className={`absolute inset-0 pointer-events-none border-t border-white/60 ${shapeClass}`}
        style={{
          maskImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent 60%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent 60%)',
        }}
      />

      {/* Inner Optical Highlight & Depth Shadow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),inset_0_-1px_1px_0_rgba(0,0,0,0.08)]" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
