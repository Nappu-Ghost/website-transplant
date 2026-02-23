"use client";

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/components/providers/demo-mode-provider';
import { motion } from 'framer-motion';
import { CalendarCheck, Users, Umbrella, Waves } from 'lucide-react';
import { AccommodationCard } from '@/components/accommodation-card';
import { ActivityCard } from '@/components/activity-card';
import { Button } from '@/components/ui/button';
import { PageShell, SectionHeader, FeatureCard } from '@/components/shared';
import { activityService, hotelService, roomService } from '@/lib/api-service';

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

type HotelSummary = {
  id: number;
  name: string;
  location: string;
  imageUrl?: string | null;
};

type RoomSummary = {
  id: number;
  hotelId: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description?: string | null;
  imageUrl?: string | null;
  isPremium?: boolean;
  available?: boolean;
};

type ActivitySummary = {
  id: number;
  name: string;
  activityType: string;
  price: number;
  capacity?: number | null;
  imageUrl?: string | null;
  isPremium?: boolean;
};

export default function Home() {
  const { demoMode } = useDemoMode();
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

  const hotelsQuery = useQuery<HotelSummary[]>({
    queryKey: ['hotels', 'public'],
    queryFn: () => hotelService.list(),
  });

  const roomsQuery = useQuery<RoomSummary[]>({
    queryKey: ['rooms', 'public'],
    queryFn: () => roomService.list(),
  });

  const activitiesQuery = useQuery<ActivitySummary[]>({
    queryKey: ['activities', 'public'],
    queryFn: () => activityService.list(),
  });

  const hotelIndex = useMemo(() => {
    const map = new Map<number, HotelSummary>();
    (hotelsQuery.data || []).forEach((hotel) => map.set(hotel.id, hotel));
    return map;
  }, [hotelsQuery.data]);

  const featuredRooms = useMemo(() => {
    const all = (roomsQuery.data || [])
      .filter((room) => room.available !== false)
      .sort((a, b) => Number(Boolean(b.isPremium)) - Number(Boolean(a.isPremium)) || b.price - a.price);
    return all.slice(0, 4);
  }, [roomsQuery.data]);

  const featuredActivities = useMemo(() => {
    const all = (activitiesQuery.data || [])
      .sort((a, b) => Number(Boolean(b.isPremium)) - Number(Boolean(a.isPremium)) || b.price - a.price);
    return all.slice(0, 4);
  }, [activitiesQuery.data]);

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

      <PageShell>
        <section className="space-y-6">
          <SectionHeader
            title="Featured accommodations"
            subtitle="Rooms pulled directly from the backend inventory."
            action={
              <Button asChild variant="outline">
                <Link href="/accommodations">See all stays</Link>
              </Button>
            }
          />

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {roomsQuery.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <motion.div key={`room-skeleton-${index}`} variants={fadeIn}>
                    <AccommodationCard
                      demoMode={demoMode}
                      isLoading
                      name=""
                      location=""
                      pricePerNight={0}
                      capacity={0}
                    />
                  </motion.div>
                ))
              : featuredRooms.map((room) => {
                  const hotel = hotelIndex.get(room.hotelId);
                  return (
                    <motion.div key={room.id} variants={fadeIn}>
                      <AccommodationCard
                        demoMode={demoMode}
                        name={room.name}
                        location={hotel?.location || 'Island resort'}
                        pricePerNight={room.price}
                        capacity={room.capacity}
                        description={room.description ?? undefined}
                        imageUrl={room.imageUrl ?? hotel?.imageUrl ?? undefined}
                        isPremium={room.isPremium}
                        tags={[room.type]}
                        href={`/booking?hotelId=${room.hotelId}&roomId=${room.id}`}
                      />
                    </motion.div>
                  );
                })}
          </motion.div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            title="Top activities"
            subtitle="Premium and standard experiences with capacity tracking."
            action={
              <Button asChild variant="outline">
                <Link href="/activities">Browse activities</Link>
              </Button>
            }
          />

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {activitiesQuery.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <motion.div key={`activity-skeleton-${index}`} variants={fadeIn}>
                    <ActivityCard
                      demoMode={demoMode}
                      isLoading
                      name=""
                      activityType=""
                      price={0}
                    />
                  </motion.div>
                ))
              : featuredActivities.map((activity) => (
                  <motion.div key={activity.id} variants={fadeIn}>
                    <ActivityCard
                      demoMode={demoMode}
                      name={activity.name}
                      activityType={activity.activityType}
                      price={activity.price}
                      capacity={activity.capacity ?? undefined}
                      imageUrl={activity.imageUrl ?? undefined}
                      isPremium={activity.isPremium}
                      href={`/booking?activityId=${activity.id}`}
                    />
                  </motion.div>
                ))}
          </motion.div>
        </section>
      </PageShell>
    </>
  );
}
