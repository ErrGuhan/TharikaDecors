'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

type SwipeGalleryProps = {
  images: string[];
  alt?: string;
};

export default function SwipeGallery({ images, alt = 'Gallery' }: SwipeGalleryProps) {
  return (
    <motion.div
      className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-scroll px-4 py-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative h-[60vh] w-[85vw] flex-shrink-0 snap-center overflow-hidden rounded-2xl md:w-[40vw]"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 85vw, 40vw"
            priority={i === 0}
          />
        </div>
      ))}
    </motion.div>
  );
}
