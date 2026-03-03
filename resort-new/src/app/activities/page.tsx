"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/components/providers/demo-mode-provider';
import Link from 'next/link';
import { ActivityCard, type ActivityCardProps } from '@/components/activity-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalDialog, PageShell, SectionHeader } from '@/components/shared';
import { activityService, metaService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { defaultActivitiesConfig, type ActivitiesConfig } from '@/lib/activities-defaults';

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

export default function ActivitiesPage() {
  const { demoMode } = useDemoMode();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const { data: activityData = [], isLoading, isError, error } = useQuery<ActivitySummary[]>({
    queryKey: ['activities'],
    queryFn: () => activityService.list(),
  });

  const { data: activitiesPageData } = useQuery({
    queryKey: ['activities', 'page'],
    queryFn: () => metaService.getActivities(),
  });

  const activitiesConfig = useMemo<ActivitiesConfig>(() => {
    if (activitiesPageData && typeof activitiesPageData === 'object') {
      return activitiesPageData as ActivitiesConfig;
    }
    return defaultActivitiesConfig;
  }, [activitiesPageData]);

  const heroGallery = useMemo(() => {
    const gallery = activitiesConfig.gallery?.length
      ? activitiesConfig.gallery
      : defaultActivitiesConfig.gallery;
    return gallery;
  }, [activitiesConfig.gallery]);

  useEffect(() => {
    if (heroGallery.length <= 1) {
      setActiveHeroIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroGallery.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [heroGallery.length]);

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

  const featuredIds = useMemo(() => new Set(featuredActivities.map((item) => item.id)), [featuredActivities]);
  const restActivities = useMemo(
    () => activities.filter((item) => !featuredIds.has(item.id)),
    [activities, featuredIds],
  );

  return (
    <PageShell>
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm md:p-10">
        {heroGallery.map((item, index) => {
          const imageSrc = resolveImageUrl(item.imageUrl);
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                index === activeHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={item.label || 'Activities hero'}
                  className="absolute inset-0 h-full w-full object-cover object-right"
                />
              ) : null}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_hsl(var(--background))_0%,_hsl(var(--background)/0.88)_35%,_hsl(var(--background)/0.35)_60%,_transparent_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.22),_transparent_55%)]" />
        <div className="relative max-w-3xl space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {activitiesConfig.hero.kicker}
          </p>
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl lg:text-5xl font-serif">
            {activitiesConfig.hero.title}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            {activitiesConfig.hero.description}
          </p>
          <div className="flex flex-wrap gap-3">
            {activitiesConfig.hero.ctaPrimary?.url && activitiesConfig.hero.ctaPrimary.label ? (
              <Button asChild size="lg">
                <Link href={activitiesConfig.hero.ctaPrimary.url}>
                  {activitiesConfig.hero.ctaPrimary.label}
                </Link>
              </Button>
            ) : null}
            {activitiesConfig.hero.ctaSecondary?.url && activitiesConfig.hero.ctaSecondary.label ? (
              <Button asChild size="lg" variant="outline">
                <Link href={activitiesConfig.hero.ctaSecondary.url}>
                  {activitiesConfig.hero.ctaSecondary.label}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-6">
        <SectionHeader
          title={activitiesConfig.featured.title || ''}
          description={activitiesConfig.featured.description || undefined}
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

      <section className="mt-12 space-y-6">
        <SectionHeader
          title={activitiesConfig.listing.title || ''}
          description={activitiesConfig.listing.description || undefined}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        ) : restActivities.length === 0 ? (
          <Card className="col-span-full border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">No activities found</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              There are no activities available right now.
            </CardContent>
          </Card>
        ) : (
          restActivities.map((activity) => (
            <ActivityCard demoMode={demoMode}
              key={activity.id}
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
      </section>
    </PageShell>
  );
}
