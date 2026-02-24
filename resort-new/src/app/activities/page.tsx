"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/components/providers/demo-mode-provider';
import Link from 'next/link';
import { ActivityCard, type ActivityCardProps } from '@/components/activity-card';
import { ImageGallery } from '@/components/image-gallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalDialog, PageHeader, PageShell, SectionHeader } from '@/components/shared';
import { activityService } from '@/lib/api-service';

type ActivityCategory = 'Adventure' | 'Wellness' | 'Dining' | 'Family';
type ActivityDuration = '60-90 min' | '2-3 hours' | 'Half day';

interface ActivityDetail extends ActivityCardProps {
  id: number;
  category: ActivityCategory;
  intensity: 'Low' | 'Moderate' | 'High';
  meetingPoint: string;
  highlights: string[];
  imageUrl: string;
  duration: ActivityDuration;
}

interface ActivitySummary {
  id: number;
  name: string;
  activityType: string;
  price: number;
  capacity?: number | null;
  imageUrl?: string | null;
  isPremium?: boolean;
}

const CATEGORY_META: Record<ActivityCategory, { meetingPoint: string; highlights: string[]; imageUrl: string }> = {
  Adventure: {
    meetingPoint: 'Lagoon Dock',
    highlights: ['Guided reef tour', 'Gear included', 'Photography stops'],
    imageUrl: '/images/gallery/activities/snorkel.svg',
  },
  Wellness: {
    meetingPoint: 'Sunrise Pavilion',
    highlights: ['Sound bath', 'Breathwork guide', 'Herbal tea service'],
    imageUrl: '/images/gallery/activities/swimming.svg',
  },
  Dining: {
    meetingPoint: 'Azure Kitchen Studio',
    highlights: ['Five-course tasting', 'Wine pairing', 'Chef storytelling'],
    imageUrl: '/images/gallery/activities/skydiving.svg',
  },
  Family: {
    meetingPoint: 'Garden Gate',
    highlights: ['Tidepool discovery', 'Kids guide', 'Nature journal'],
    imageUrl: '/images/gallery/activities/volleyball.svg',
  },
};

const resolveCategory = (activityType: string): ActivityCategory => {
  const normalized = activityType.toLowerCase();
  if (normalized.includes('well')) return 'Wellness';
  if (normalized.includes('dining') || normalized.includes('culinary')) return 'Dining';
  if (normalized.includes('family')) return 'Family';
  return 'Adventure';
};

const resolveDuration = (price: number): ActivityDuration => {
  if (price >= 170) return 'Half day';
  if (price >= 110) return '2-3 hours';
  return '60-90 min';
};

const resolveIntensity = (price: number): ActivityDetail['intensity'] => {
  if (price >= 180) return 'High';
  if (price >= 110) return 'Moderate';
  return 'Low';
};

const activitiesGallery = [
  {
    src: '/images/gallery/activities/snorkel.svg',
    alt: 'Reef snorkeling',
    label: 'Adventure',
  },
  {
    src: '/images/gallery/activities/swimming.svg',
    alt: 'Lagoon swim',
    label: 'Wellness',
  },
  {
    src: '/images/gallery/activities/submarine.svg',
    alt: 'Submarine tour',
    label: 'Explore',
  },
  {
    src: '/images/gallery/activities/volleyball.svg',
    alt: 'Beach volleyball',
    label: 'Social',
  },
  {
    src: '/images/gallery/activities/roller-coaster.svg',
    alt: 'Island thrills',
    label: 'Energy',
  },
  {
    src: '/images/gallery/activities/skydiving.svg',
    alt: 'Sky view',
    label: 'Premium',
  },
];

export default function ActivitiesPage() {
  const { demoMode } = useDemoMode();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ActivityCategory | 'All'>('All');
  const [duration, setDuration] = useState<ActivityDuration | 'All'>('All');
  const [priceRange, setPriceRange] = useState<'All' | 'Under 100' | '100-150' | '150+'>('All');

  const { data: activityData = [], isLoading, isError, error } = useQuery<ActivitySummary[]>({
    queryKey: ['activities'],
    queryFn: () => activityService.list(),
  });

  const activities = useMemo<ActivityDetail[]>(() => {
    return activityData.map((activity) => {
      const categoryValue = resolveCategory(activity.activityType);
      const meta = CATEGORY_META[categoryValue];
      return {
        id: activity.id,
        name: activity.name,
        activityType: activity.activityType,
        price: activity.price,
        duration: resolveDuration(activity.price),
        capacity: activity.capacity ?? 10,
        isPremium: activity.isPremium,
        category: categoryValue,
        intensity: resolveIntensity(activity.price),
        meetingPoint: meta.meetingPoint,
        highlights: meta.highlights,
        imageUrl: activity.imageUrl || meta.imageUrl,
      };
    });
  }, [activityData]);

  const featuredActivities = useMemo(() => {
    return [...activities]
      .sort(
        (a, b) =>
          Number(Boolean(b.isPremium)) - Number(Boolean(a.isPremium)) ||
          b.price - a.price,
      )
      .slice(0, 3);
  }, [activities]);

  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = [
        activity.name,
        activity.activityType,
        activity.highlights.join(' '),
        activity.meetingPoint,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesCategory = category === 'All' || activity.category === category;
      const matchesDuration = duration === 'All' || activity.duration === duration;
      const matchesPrice =
        priceRange === 'All' ||
        (priceRange === 'Under 100' && activity.price < 100) ||
        (priceRange === '100-150' && activity.price >= 100 && activity.price <= 150) ||
        (priceRange === '150+' && activity.price > 150);

      return matchesSearch && matchesCategory && matchesDuration && matchesPrice;
    });
  }, [search, category, duration, priceRange]);

  return (
    <PageShell>
      <PageHeader
        title="Activities"
        description="Curated experiences designed for calm, connection, and discovery."
      />
      <section className="mt-8 space-y-6">
        <SectionHeader
          title="Featured experiences"
          description="Premium and top-rated experiences from the live roster."
          action={
            <Button asChild variant="outline">
              <Link href="/booking">Plan a stay</Link>
            </Button>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <ActivityCard
                  demoMode={demoMode}
                  key={`featured-activity-skeleton-${index}`}
                  name=""
                  activityType=""
                  price={0}
                  isLoading
                />
              ))
            : featuredActivities.map((activity) => (
                <ActivityCard
                  demoMode={demoMode}
                  key={`featured-activity-${activity.id}`}
                  {...activity}
                  href={`/booking?activityId=${activity.id}`}
                />
              ))}
        </div>
      </section>
      <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <SectionHeader
          title="Plan your experience"
          description="Filter by category, duration, or ideal pace."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search wellness, dining, adventure"
          />
          <Select value={category} onValueChange={(value) => setCategory(value as ActivityCategory | 'All')}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
              <SelectItem value="Wellness">Wellness</SelectItem>
              <SelectItem value="Dining">Dining</SelectItem>
              <SelectItem value="Family">Family</SelectItem>
            </SelectContent>
          </Select>
          <Select value={duration} onValueChange={(value) => setDuration(value as ActivityDuration | 'All')}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any duration</SelectItem>
              <SelectItem value="60-90 min">60-90 min</SelectItem>
              <SelectItem value="2-3 hours">2-3 hours</SelectItem>
              <SelectItem value="Half day">Half day</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={(value) => setPriceRange(value as 'All' | 'Under 100' | '100-150' | '150+')}>
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any price</SelectItem>
              <SelectItem value="Under 100">Under $100</SelectItem>
              <SelectItem value="100-150">$100-$150</SelectItem>
              <SelectItem value="150+">$150+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
        <p>{isLoading ? 'Loading experiences...' : `${filtered.length} experiences available`}</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/booking">Plan a stay</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ActivityCard demoMode={demoMode}
              key={`activity-skeleton-${index}`}
              name="Loading"
              activityType=""
              price={0}
              isLoading
            />
          ))
        ) : isError ? (
          <Card className="col-span-full border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Unable to load activities</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Please try again shortly.'}
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="col-span-full border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">No activities found</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Adjust your filters or explore another pace of travel.
            </CardContent>
          </Card>
        ) : (
          filtered.map((activity) => (
            <ActivityCard demoMode={demoMode}
              key={activity.name}
              {...activity}
              action={
                <div className="flex flex-col gap-3">
                  <ModalDialog
                    title={activity.name}
                    description={`${activity.category} • ${activity.duration} • ${activity.intensity} intensity`}
                    trigger={
                      <Button variant="outline" className="w-full">
                        View details
                      </Button>
                    }
                    footer={
                      <Button asChild>
                        <Link href={`/booking?activityId=${activity.id}`}>
                          Reserve this experience
                        </Link>
                      </Button>
                    }
                  >
                    <div className="grid gap-4 text-sm text-muted-foreground">
                      <div className="grid gap-2">
                        <p className="text-xs uppercase tracking-[0.2em]">Overview</p>
                        <p>{activity.activityType}</p>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-xs uppercase tracking-[0.2em]">Details</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-foreground">{activity.meetingPoint}</p>
                            <p className="text-xs text-muted-foreground">Meeting point</p>
                          </div>
                          <div>
                            <p className="text-foreground">{activity.capacity} guests</p>
                            <p className="text-xs text-muted-foreground">Capacity</p>
                          </div>
                          <div>
                            <p className="text-foreground">{activity.duration}</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                          <div>
                            <p className="text-foreground">${activity.price}/guest</p>
                            <p className="text-xs text-muted-foreground">Rate</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <p className="text-xs uppercase tracking-[0.2em]">Highlights</p>
                        <ul className="grid gap-1">
                          {activity.highlights.map((highlight) => (
                            <li key={highlight}>• {highlight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </ModalDialog>
                  <Button asChild className="w-full">
                    <Link href={`/booking?activityId=${activity.id}`}>
                      Reserve now
                    </Link>
                  </Button>
                </div>
              }
            />
          ))
        )}
      </div>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,_hsl(var(--background))_10%,_transparent_70%)]" />
          <div className="relative p-6">
            <SectionHeader
              title="Immersive previews"
              description="A glimpse into the calm, adventure, and culinary rituals awaiting you."
            />
            <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
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
            </div>
          </div>
        </Card>
        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-lg">Your pace, curated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Choose from sunrise rituals, chef-led dining, or ocean-focused exploration.
              Our hosts align every detail with your energy and schedule.
            </p>
            <p>
              Every experience includes a dedicated guide, curated refreshment, and a
              recovery ritual to close the day with ease.
            </p>
            <Button asChild variant="outline">
              <Link href="/booking">Design my itinerary</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <div className="mt-16">
        <ImageGallery
          title="Curated Experiences"
          subtitle="Designed to balance adventure, wellness, and quiet moments."
          images={activitiesGallery}
        />
      </div>
    </PageShell>
  );
}
