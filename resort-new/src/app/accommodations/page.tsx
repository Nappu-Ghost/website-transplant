"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/components/providers/demo-mode-provider';
import Link from 'next/link';
import Image from 'next/image';
import { AccommodationCard, type AccommodationCardProps } from '@/components/accommodation-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalDialog, PageShell, SectionHeader } from '@/components/shared';
import { hotelService, metaService, roomService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { defaultAccommodationsConfig, type AccommodationsConfig } from '@/lib/accommodations-defaults';

type AccommodationCategory = 'Suite' | 'Villa' | 'Residence';

interface AccommodationDetail extends AccommodationCardProps {
  roomId: number;
  category: AccommodationCategory;
  size: string;
  bed: string;
  view: string;
  highlights: string[];
  imageUrl: string;
}

interface HotelSummary {
  id: number;
  name: string;
  location: string;
  imageUrl?: string | null;
}

interface RoomSummary {
  id: number;
  hotelId: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description?: string | null;
  imageUrl?: string | null;
  floorNumber?: number;
  available?: boolean;
  isPremium?: boolean;
}

const FALLBACK_BED_OPTIONS = ['King bed', 'Queen bed', 'King + daybed'];

const defaultHighlights = (isPremium?: boolean) =>
  isPremium
    ? ['Private deck', 'Concierge service', 'Twilight service']
    : ['Private patio', 'Morning tea service', 'Lagoon views'];

const resolveCategory = (roomType: string): AccommodationCategory => {
  const normalized = roomType.toLowerCase();
  if (normalized.includes('villa')) return 'Villa';
  if (normalized.includes('residence') || normalized.includes('loft')) return 'Residence';
  return 'Suite';
};

const resolveSize = (capacity: number, isPremium?: boolean) => {
  if (capacity >= 4) return '1,050 sq ft';
  if (isPremium) return '720 sq ft';
  if (capacity >= 3) return '600 sq ft';
  return '520 sq ft';
};

const resolveView = (location?: string) => {
  if (!location) return 'Lagoon view';
  if (location.toLowerCase().includes('atoll')) return 'Atoll view';
  if (location.toLowerCase().includes('harbor')) return 'Harbor view';
  return 'Ocean view';
};

export default function AccommodationsPage() {
  const { demoMode } = useDemoMode();
  const { data: rooms = [], isLoading: isRoomsLoading, isError: isRoomsError, error: roomsError } = useQuery<RoomSummary[]>({
    queryKey: ['rooms'],
    queryFn: () => roomService.list(),
  });

  const { data: hotels = [], isLoading: isHotelsLoading, isError: isHotelsError, error: hotelsError } = useQuery<HotelSummary[]>({
    queryKey: ['hotels'],
    queryFn: () => hotelService.list(),
  });

  const { data: accommodationsData } = useQuery({
    queryKey: ['accommodations', 'page'],
    queryFn: () => metaService.getAccommodations(),
  });

  const accommodationsConfig = useMemo<AccommodationsConfig>(() => {
    if (accommodationsData && typeof accommodationsData === 'object') {
      return accommodationsData as AccommodationsConfig;
    }
    return defaultAccommodationsConfig;
  }, [accommodationsData]);

  const heroGallery = useMemo(() => {
    const gallery = accommodationsConfig.gallery?.length
      ? accommodationsConfig.gallery
      : defaultAccommodationsConfig.gallery;
    return gallery;
  }, [accommodationsConfig.gallery]);

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

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

  const hotelById = useMemo(() => {
    return new Map(hotels.map((hotel) => [hotel.id, hotel]));
  }, [hotels]);

  const accommodations = useMemo<AccommodationDetail[]>(() => {
    return rooms
      .filter((room) => room.available !== false)
      .map((room) => {
        const hotel = hotelById.get(room.hotelId);
        const size = resolveSize(room.capacity, room.isPremium);
        return {
          roomId: room.id,
          name: room.name,
          location: hotel?.name ?? 'Azure Lagoon Resort',
          pricePerNight: room.price,
          capacity: room.capacity,
          description: room.description || 'Refined suite styling with open-air comfort.',
          rating: room.isPremium ? 4.9 : 4.6,
          isPremium: room.isPremium,
          tags: [room.type, `${room.capacity} guests`],
          category: resolveCategory(room.type),
          size,
          bed: FALLBACK_BED_OPTIONS[room.id % FALLBACK_BED_OPTIONS.length],
          view: resolveView(hotel?.location),
          highlights: defaultHighlights(room.isPremium),
          imageUrl: room.imageUrl || hotel?.imageUrl || '/images/gallery/hotels/hotel1.jpg',
        };
      });
  }, [rooms, hotelById]);

  const featuredAccommodations = useMemo(() => {
    return [...accommodations]
      .sort(
        (a, b) =>
          Number(Boolean(b.isPremium)) - Number(Boolean(a.isPremium)) ||
          b.pricePerNight - a.pricePerNight,
      )
      .slice(0, 3);
  }, [accommodations]);

  const featuredIds = useMemo(() => new Set(featuredAccommodations.map((item) => item.roomId)), [featuredAccommodations]);
  const restAccommodations = useMemo(
    () => accommodations.filter((item) => !featuredIds.has(item.roomId)),
    [accommodations, featuredIds],
  );

  const isLoading = isRoomsLoading || isHotelsLoading;
  const isError = isRoomsError || isHotelsError;
  const error = roomsError || hotelsError;
  
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
                <Image
                  src={imageSrc}
                  alt={item.label || 'Accommodation hero'}
                  fill
                  className="object-cover object-right"
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  priority={index === activeHeroIndex}
                />
              ) : null}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_hsl(var(--background))_0%,_hsl(var(--background)/0.88)_35%,_hsl(var(--background)/0.35)_60%,_transparent_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.22),_transparent_55%)]" />
        <div className="relative max-w-3xl space-y-6">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {accommodationsConfig.hero.kicker}
            </p>
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl lg:text-5xl font-serif">
              {accommodationsConfig.hero.title}
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {accommodationsConfig.hero.description}
            </p>
            <div className="flex flex-wrap gap-3">
              {accommodationsConfig.hero.ctaPrimary?.url && accommodationsConfig.hero.ctaPrimary.label ? (
                <Button asChild size="lg">
                  <Link href={accommodationsConfig.hero.ctaPrimary.url}>
                    {accommodationsConfig.hero.ctaPrimary.label}
                  </Link>
                </Button>
              ) : null}
              {accommodationsConfig.hero.ctaSecondary?.url && accommodationsConfig.hero.ctaSecondary.label ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={accommodationsConfig.hero.ctaSecondary.url}>
                    {accommodationsConfig.hero.ctaSecondary.label}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-6">
        <SectionHeader
          title={accommodationsConfig.featured.title || ''}
          description={accommodationsConfig.featured.description || undefined}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <AccommodationCard
                  demoMode={demoMode}
                  key={`featured-accommodation-skeleton-${index}`}
                  name=""
                  location=""
                  pricePerNight={0}
                  capacity={0}
                  isLoading
                />
              ))
            : featuredAccommodations.map((accommodation) => (
                <AccommodationCard
                  demoMode={demoMode}
                  key={`featured-accommodation-${accommodation.roomId}`}
                  {...accommodation}
                  href={`/booking?roomId=${accommodation.roomId}`}
                />
              ))}
        </div>
      </section>

      <section className="mt-12 space-y-6">
        <SectionHeader
          title={accommodationsConfig.listing.title || ''}
          description={accommodationsConfig.listing.description || undefined}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <AccommodationCard
                demoMode={demoMode}
                key={`accommodation-skeleton-${index}`}
                name="Loading"
                location=""
                pricePerNight={0}
                capacity={0}
                isLoading
              />
            ))
          ) : isError ? (
            <Card className="col-span-full border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg">Unable to load stays</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Please try again shortly.'}
              </CardContent>
            </Card>
          ) : restAccommodations.length === 0 ? (
            <Card className="col-span-full border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg">No stays found</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                There are no accommodations available right now.
              </CardContent>
            </Card>
          ) : (
            restAccommodations.map((accommodation) => (
              <AccommodationCard
                demoMode={demoMode}
                key={accommodation.roomId}
                {...accommodation}
                action={
                  <div className="flex flex-col gap-3">
                    <ModalDialog
                      title={accommodation.name}
                      description={`${accommodation.category} • ${accommodation.size} • ${accommodation.view}`}
                      trigger={
                        <Button variant="outline" className="w-full">
                          View details
                        </Button>
                      }
                      footer={
                        <Button asChild>
                          <Link href={`/booking?roomId=${accommodation.roomId}`}>
                            Book this stay
                          </Link>
                        </Button>
                      }
                    >
                      <div className="grid gap-4 text-sm text-muted-foreground">
                        <div className="grid gap-2">
                          <p className="text-xs uppercase tracking-[0.2em]">Overview</p>
                          <p>{accommodation.description}</p>
                        </div>
                        <div className="grid gap-2">
                          <p className="text-xs uppercase tracking-[0.2em]">Details</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-foreground">{accommodation.bed}</p>
                              <p className="text-xs text-muted-foreground">Sleeping</p>
                            </div>
                            <div>
                              <p className="text-foreground">{accommodation.capacity} guests</p>
                              <p className="text-xs text-muted-foreground">Capacity</p>
                            </div>
                            <div>
                              <p className="text-foreground">{accommodation.size}</p>
                              <p className="text-xs text-muted-foreground">Suite size</p>
                            </div>
                            <div>
                              <p className="text-foreground">${accommodation.pricePerNight}/night</p>
                              <p className="text-xs text-muted-foreground">Nightly rate</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <p className="text-xs uppercase tracking-[0.2em]">Highlights</p>
                          <ul className="grid gap-1">
                            {accommodation.highlights.map((highlight) => (
                              <li key={highlight}>• {highlight}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </ModalDialog>
                    <Button asChild className="w-full">
                      <Link href={`/booking?roomId=${accommodation.roomId}`}>
                        Book now
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
