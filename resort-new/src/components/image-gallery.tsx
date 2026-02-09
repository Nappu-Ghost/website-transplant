"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface GalleryImage {
  src: string;
  alt: string;
  label?: string;
}

export interface ImageGalleryProps {
  title: string;
  subtitle?: string;
  images: GalleryImage[];
  isLoading?: boolean;
}

const fade = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export function ImageGallery({ title, subtitle, images, isLoading }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`thumb-${index}`} className="aspect-[4/3] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p>Gallery content is being curated.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/70 bg-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.src}
              className="absolute inset-0"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              {active.label && (
                <div className="absolute left-6 bottom-6 rounded-full bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.2em] text-foreground">
                  {active.label}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/70 bg-card/80 text-left transition hover:-translate-y-0.5 hover:shadow-sm',
                index === activeIndex && 'ring-2 ring-primary/50'
              )}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 20vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">{image.alt}</p>
                {image.label && (
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {image.label}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
