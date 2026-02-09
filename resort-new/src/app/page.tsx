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
        <motion.section
          className="relative overflow-hidden bg-background pt-16 md:pt-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.35),_transparent_55%)]" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,_hsl(var(--primary)/0.18),_transparent_70%)] blur-3xl" />
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
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full border-border/70 bg-card/80 transition duration-300 hover:-translate-y-2 hover:shadow-lg">
                    <CardHeader className="items-center text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                        <feature.icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl text-foreground">
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
