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
    <PageShell>
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm">
        <div className="absolute inset-0">
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            playsInline
            loop={false}
            onTimeUpdate={handleVideoTimeUpdate}
            className={`h-full w-full object-cover transition-opacity duration-500 ${isVideoFading ? 'opacity-0' : 'opacity-100'}`}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-background/80" />
        </div>

        <div className="relative grid gap-8 px-6 py-14 md:grid-cols-12 md:gap-10 md:px-10 md:py-20">
          <motion.div
            className="space-y-6 md:col-span-7"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-xs font-medium text-foreground/80 shadow-sm">
              <Waves className="h-4 w-4 text-primary" />
              Live inventory + instant booking
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-3xl font-semibold tracking-tight md:text-5xl">
              Plan your next island escape with real-time availability.
            </motion.h1>

            <motion.p variants={fadeIn} className="max-w-xl text-base text-muted-foreground md:text-lg">
              Browse rooms, book activities, and manage reservations with a single account. Managers can update inventory, pricing, and galleries directly from the dashboard.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-sm">
                <Link href="/booking">Start booking</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-background/70">
                <Link href="/accommodations">Explore stays</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid gap-4 md:col-span-5"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <FeatureCard
              icon={CalendarCheck}
              title="Flexible reservations"
              description="Manage bookings, upgrades, and premium perks without leaving the portal."
            />
            <FeatureCard
              icon={Umbrella}
              title="Curated experiences"
              description="Activities are linked to live capacity, pricing, and availability rules."
            />
            <FeatureCard
              icon={Users}
              title="Role-based management"
              description="Admins and managers get CRUD tools for hotels, rooms, activities, and reports."
            />
          </motion.div>
        </div>
      </section>

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
                  <AccommodationCard demoMode={demoMode}
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
                    <AccommodationCard demoMode={demoMode}
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
                  <ActivityCard demoMode={demoMode}
                    isLoading
                    name=""
                    activityType=""
                    price={0}
                  />
                </motion.div>
              ))
            : featuredActivities.map((activity) => (
                <motion.div key={activity.id} variants={fadeIn}>
                  <ActivityCard demoMode={demoMode}
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
  );
}
