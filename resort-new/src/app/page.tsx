"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function Home() {
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const fadeRef = useRef(false);
  const [isVideoFading, setIsVideoFading] = useState(false);

  const heroCards = [
    {
      title: 'Lagoon Villas',
      detail: 'Private decks, warm textures, panoramic water views.',
      tag: 'Suites',
    },
    {
      title: 'Quiet Experiences',
      detail: 'Wellness rituals, sunset cruises, chef-led tastings.',
      tag: 'Experiences',
    },
    {
      title: 'Seamless Transfers',
      detail: 'Ferry schedules aligned with arrival windows.',
      tag: 'Arrival',
    },
  ];

  const handleVideoTimeUpdate = () => {
    const video = heroVideoRef.current;
    if (!video || fadeRef.current) return;
    if (video.duration && video.currentTime > video.duration - 0.8) {
      fadeRef.current = true;
      setIsVideoFading(true);
      setTimeout(() => {
        if (!heroVideoRef.current) return;
        heroVideoRef.current.currentTime = 0;
        heroVideoRef.current.play().catch(() => undefined);
        setIsVideoFading(false);
        fadeRef.current = false;
      }, 400);
    }
  };

  return (
    <>
      <motion.section
        className="relative overflow-hidden bg-background pt-16 md:pt-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            playsInline
            loop={false}
            preload="metadata"
            onTimeUpdate={handleVideoTimeUpdate}
            className={`h-full w-full object-cover transition-opacity duration-500 ${isVideoFading ? 'opacity-0' : 'opacity-100'}`}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_hsl(var(--background))_6%,_hsl(var(--background)/0.7)_55%,_transparent_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.4),_transparent_60%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/95 via-background/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>

        <div className="container relative z-10 mx-auto grid gap-12 px-4 pb-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <motion.p
              className="text-xs uppercase tracking-[0.35em] text-muted-foreground"
              variants={fadeIn}
            >
              Azure Lagoon Resort
            </motion.p>
            <motion.h1
              className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
              variants={fadeIn}
            >
              A serene escape curated for modern luxury.
            </motion.h1>
            <motion.p className="max-w-xl text-lg text-muted-foreground" variants={fadeIn}>
              Lagoon villas, tailored experiences, and seamless island transfers. Everything aligned for a quiet, elevated stay.
            </motion.p>
            <motion.div className="flex flex-wrap gap-3" variants={fadeIn}>
              <Button asChild size="lg">
                <Link href="/booking">Plan Your Stay</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/accommodations">Explore Suites</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="grid gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {heroCards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeIn}
                className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{card.tag}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{card.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

    </>
  );
}
