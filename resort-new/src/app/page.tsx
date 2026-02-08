"use client";

import type React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Users, Umbrella, Waves } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';

// Animation variants
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
  const features = [
    {
      icon: CalendarCheck,
      title: 'Easy Reservation Planning',
      description:
        'Plan your stay with flexible dates, room options, and tailored add-ons.',
    },
    {
      icon: Users,
      title: 'Guest-Centered Experiences',
      description:
        'Curated activities, dining, and wellness experiences for every traveler.',
    },
    {
      icon: Umbrella,
      title: 'Luxury Amenities',
      description:
        'Private villas, ocean views, and personalized concierge support.',
    },
    {
      icon: Waves,
      title: 'Island Transfers',
      description:
        'Seamless ferry schedules and transfers to get you to the resort with ease.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section
          className="relative bg-gradient-to-b from-teal-100 via-beige-50 to-background pt-20 pb-24 text-center overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
           <div className="absolute inset-0 opacity-10 z-0">
             {/* Subtle background pattern or image can go here */}
             {/* Example using SVG */}
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 50A50 50 0 0050 100 50 50 0 00100 50 50 50 0 0050 0 50 50 0 000 50z" fill="hsl(var(--primary)/0.05)"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>
           </div>
          <div className="container relative z-10 mx-auto px-4">
            <motion.h1
              className="mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl lg:text-6xl"
              variants={fadeIn}
            >
              Azure Lagoon Resort
            </motion.h1>
            <motion.p
              className="mx-auto mb-8 max-w-2xl text-lg text-foreground/80 md:text-xl"
              variants={fadeIn}
            >
              A modern resort experience is on the way. Explore stays, activities,
              and island transfers built for effortless planning.
            </motion.p>
            <motion.div variants={fadeIn}>
              <Button asChild size="lg">
                <Link href="/booking">Plan Your Stay</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="absolute -bottom-1 left-0 w-full h-16 bg-background"
            style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 }}}
          />
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-16 md:py-24 bg-background"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-4">
            <motion.h2
              className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl"
              variants={fadeIn}
            >
              Resort Highlights
            </motion.h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardHeader className="items-center text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                        <feature.icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl text-primary">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-foreground/80">
                      {feature.description}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          className="bg-gradient-to-t from-teal-100 to-background py-16 md:py-24 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <motion.h2
              className="mb-6 text-3xl font-bold text-primary md:text-4xl"
              variants={fadeIn}
            >
              Ready for Your Next Escape?
            </motion.h2>
            <motion.p
              className="mx-auto mb-8 max-w-xl text-lg text-foreground/80"
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
