"use client";

import type React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Users, Umbrella, Waves } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { AccommodationCard } from '@/components/accommodation-card';
import { ActivityCard } from '@/components/activity-card';
import { FeatureCard, PageShell, SectionHeader } from '@/components/shared';

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
      staggerChildren: 0.2,
    },
  },
};

export default function Home() {
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

  const features = [
    {
      icon: CalendarCheck,
      title: 'Easy Reservation Planning',
      description: 'Plan your stay in minutes with tailored dates and room picks.',
    },
    {
      icon: Users,
      title: 'Curated Experiences',
      description: 'Wellness, adventure, and dining itineraries built around you.',
    },
    {
      icon: Umbrella,
      title: 'Elevated Comfort',
      description: 'Quiet suites, private decks, and attentive hosts throughout.',
    },
    {
      icon: Waves,
      title: 'Island Transfers',
      description: 'Seamless ferry scheduling aligned with arrival windows.',
    },
  ];

  const featuredAccommodations = [
    {
      name: 'Lagoon Suite 201',
      location: 'Oceanfront Wing',
      pricePerNight: 480,
      capacity: 2,
      description: 'Private deck, floating breakfast service, and sunset views.',
      rating: 4.9,
      isPremium: true,
      tags: ['King bed', 'Deck access'],
    },
    {
      name: 'Garden Villa 102',
      location: 'Palm Grove',
      pricePerNight: 280,
      capacity: 2,
      description: 'Quiet garden path, minimalist interior, morning light.',
      rating: 4.7,
      tags: ['Patio', 'Outdoor shower'],
    },
    {
      name: 'Harbor Residence',
      location: 'Lighthouse Point',
      pricePerNight: 620,
      capacity: 4,
      description: 'Two-bedroom residence with lounge and private dining.',
      rating: 4.8,
      isPremium: true,
      tags: ['Two bedrooms', 'Concierge'],
    },
  ];

  const featuredActivities = [
    {
      name: 'Reef Snorkeling',
      activityType: 'Adventure',
      price: 120,
      duration: '2 hours',
      capacity: 12,
    },
    {
      name: 'Sunset Chef Table',
      activityType: 'Dining',
      price: 180,
      duration: '3 hours',
      capacity: 8,
      isPremium: true,
    },
    {
      name: 'Lagoon Meditation',
      activityType: 'Wellness',
      price: 95,
      duration: '90 minutes',
      capacity: 10,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main>
        <motion.section
          className="relative overflow-hidden bg-background pt-16 md:pt-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="absolute inset-0">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[linear-gradient(120deg,_hsl(var(--background))_8%,_hsl(var(--background)/0.75)_55%,_transparent_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.35),_transparent_60%)]" />
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
              <motion.p
                className="max-w-xl text-lg text-muted-foreground"
                variants={fadeIn}
              >
                Lagoon villas, tailored experiences, and seamless island transfers.
                Everything aligned for a quiet, elevated stay.
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
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {card.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{card.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <PageShell>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                title="Featured stays"
                description="A trio of suites designed for water views, quiet mornings, and effortless arrival."
              />
              <Button asChild variant="outline">
                <Link href="/accommodations">View all accommodations</Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredAccommodations.map((accommodation) => (
                <AccommodationCard key={accommodation.name} {...accommodation} />
              ))}
            </div>
          </div>
        </PageShell>

        <motion.section
          className="bg-background py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-4">
            <motion.h2
              className="mb-12 text-center text-3xl font-semibold text-foreground md:text-4xl"
              variants={fadeIn}
            >
              Resort Highlights
            </motion.h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <motion.div key={feature.title} variants={fadeIn}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <PageShell>
          <motion.div
            className="flex flex-col gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div
              className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
              variants={fadeIn}
            >
              <SectionHeader
                title="Featured experiences"
                description="Wellness, culinary, and ocean adventures curated to match your pace."
              />
              <Button asChild variant="outline">
                <Link href="/activities">View all activities</Link>
              </Button>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredActivities.map((activity) => (
                <motion.div key={activity.name} variants={fadeIn}>
                  <ActivityCard {...activity} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </PageShell>

        <motion.section
          className="bg-[linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--secondary))_100%)] py-16 text-center md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <motion.h2
              className="mb-6 text-3xl font-semibold text-foreground md:text-4xl"
              variants={fadeIn}
            >
              Ready for Your Next Escape?
            </motion.h2>
            <motion.p
              className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
              variants={fadeIn}
            >
              Sign in to preview upcoming stays, activities, and curated offers
              as the resort experience comes online.
            </motion.p>
            <motion.div className="space-x-4" variants={fadeIn}>
              <Button size="lg" variant="default" asChild>
                <Link href="/booking">Start Booking</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <AppFooter />
    </div>
  );
}
