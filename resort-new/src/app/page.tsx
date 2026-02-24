"use client";

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell, SectionHeader } from '@/components/shared';
import { metaService } from '@/lib/api-service';

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

  const { data: homepageData, isLoading: isAdsLoading } = useQuery({
    queryKey: ['homepage', 'ads'],
    queryFn: () => metaService.getHomepage(),
  });

  const fallbackAds = useMemo(
    () => [
      {
        id: 'lagoon-dining-week',
        title: 'Lagoon Dining Week',
        description: 'Chef collaborations, oceanfront tastings, and a closing night under lanterns.',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
        ctaText: 'Reserve a table',
        ctaUrl: '/booking',
        badge: 'Limited series',
      },
      {
        id: 'skyline-ride',
        title: 'Skyline Coaster Preview',
        description: 'Be first in line for the sunset test rides on the theme park island.',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
        ctaText: 'Join the list',
        ctaUrl: '/activities',
        badge: 'Theme park',
      },
      {
        id: 'ferry-sprint',
        title: 'Ferry Sprint Pass',
        description: 'Priority boarding between islands with lounge seating and mocktail service.',
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
        ctaText: 'Upgrade my trip',
        ctaUrl: '/booking',
        badge: 'Fast track',
      },
    ],
    [],
  );

  const ads = useMemo(() => {
    const dataAds = homepageData?.ads;
    if (Array.isArray(dataAds) && dataAds.length > 0) return dataAds;
    return fallbackAds;
  }, [homepageData?.ads, fallbackAds]);

  const heroCards = [
    {
      title: 'Resort Island',
      detail: 'White sand beaches, chef-led dining, and luxury stays.',
      tag: 'Luxury',
    },
    {
      title: 'Theme Park Island',
      detail: 'Signature rides, festivals, and immersive story zones.',
      tag: 'Adventure',
    },
    {
      title: 'Ferry Connection',
      detail: 'A 1 km ride with lounge seating and sunset views.',
      tag: 'Transfer',
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
              Azure Lagoon Resort + Theme Park
            </motion.p>
            <motion.h1
              className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl font-serif"
              variants={fadeIn}
            >
              Two islands, one extraordinary escape.
            </motion.h1>
            <motion.p className="max-w-xl text-lg text-muted-foreground" variants={fadeIn}>
              Spend mornings on a luxury resort island, then cross the lagoon to an all-day theme park experience. A scenic ferry ride connects both worlds in minutes.
            </motion.p>
            <motion.div className="flex flex-wrap gap-3" variants={fadeIn}>
              <Button asChild size="lg">
                <Link href="/booking">Plan the full journey</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/accommodations">Explore the resort</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/activities">Theme park highlights</Link>
              </Button>
            </motion.div>
            <motion.div className="grid gap-4 pt-6 sm:grid-cols-3" variants={staggerContainer}>
              {[
                { label: 'Luxury stays', value: '40+ suites' },
                { label: 'Theme park zones', value: '8 worlds' },
                { label: 'Ferry crossing', value: '1 km ride' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeIn}
                  className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm shadow-sm backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p>
                </motion.div>
              ))}
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

      <PageShell>
        <section className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <SectionHeader
              title="Your journey across two islands"
              description="Luxury on one shore, theme park energy on the other, connected by a calm lagoon ride."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
                <div className="relative h-40">
                  <img
                    src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80"
                    alt="Resort island beaches"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(0,0,0,0.2),_transparent_60%)]" />
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Resort island</p>
                  <p className="text-lg font-semibold text-foreground">Suites, dining, and coastal rituals</p>
                  <p className="text-sm text-muted-foreground">Private cabanas, chef-driven restaurants, and sunset wellness lounges.</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
                <div className="relative h-40">
                  <img
                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                    alt="Theme park island attractions"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(0,0,0,0.2),_transparent_60%)]" />
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Theme park island</p>
                  <p className="text-lg font-semibold text-foreground">Rides, festivals, and immersive zones</p>
                  <p className="text-sm text-muted-foreground">Coasters, parade nights, and family-friendly storytelling districts.</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="border-border/70 bg-secondary/60">
            <CardHeader>
              <CardTitle className="text-lg">The ferry in between</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Waves className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Every 20 minutes</p>
                  <p>Shuttles run all day, so you can move between islands whenever the mood shifts.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Pre-book your crossings</p>
                  <p>Reserve priority slots with lounge seating and sunset departures.</p>
                </div>
              </div>
              <Button asChild className="w-fit">
                <Link href="/booking">Reserve ferry seats</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 space-y-6">
          <SectionHeader
            title="Featured offers"
            description="Promotions and announcements managed from the admin panel."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(isAdsLoading ? fallbackAds : ads).map((ad: any) => {
              const imageUrl = ad.imageUrl ? metaService.toPublicUrl(ad.imageUrl) : '';
              return (
                <Card key={ad.id} className="group overflow-hidden border-border/70 bg-card/90 shadow-sm">
                  <div className="relative h-44 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={ad.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.35),_transparent_60%)]" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.0)_20%,_rgba(0,0,0,0.55)_100%)]" />
                    {ad.badge ? (
                      <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow">
                        {ad.badge}
                      </span>
                    ) : null}
                  </div>
                <CardContent className="space-y-3 p-4">
                  <h3 className="text-lg font-semibold text-foreground">{ad.title}</h3>
                  <p className="text-sm text-muted-foreground">{ad.description}</p>
                  {ad.ctaUrl ? (
                    <Button asChild size="sm">
                      {String(ad.ctaUrl).startsWith('http') ? (
                        <a href={ad.ctaUrl} target="_blank" rel="noreferrer">
                          {ad.ctaText || 'Learn more'}
                        </a>
                      ) : (
                        <Link href={ad.ctaUrl}>{ad.ctaText || 'Learn more'}</Link>
                      )}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Island day planner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Morning calm</p>
                  <p>Breakfast on the resort deck, spa rituals, and private beach time.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Afternoon thrill</p>
                  <p>Hop the ferry and explore coasters, shows, and themed dining.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Evening glow</p>
                  <p>Return for lantern-lit dinners and beachfront performances.</p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-fit">
                <Link href="/booking">Build my itinerary</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.25),_transparent_60%)]" />
            <div className="relative grid gap-6 p-6">
              <SectionHeader
                title="Built for families, couples, and groups"
                description="Split your stay across two islands or focus on one. The schedules and ferry ties it together."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  'Theme park day passes with resort guest priority',
                  'Shared itineraries for families and group bookings',
                  'Evening resort-only zones for quiet retreats',
                  'Concierge support for multi-island celebrations',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </PageShell>
    </>
  );
}
