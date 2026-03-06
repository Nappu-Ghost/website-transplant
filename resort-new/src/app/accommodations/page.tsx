"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/components/providers/demo-mode-provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageShell, SectionHeader } from '@/components/shared';
import { hotelService, metaService, roomService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { demoImageUrl } from '@/lib/demo-images';
import { defaultAccommodationsConfig, type AccommodationsConfig } from '@/lib/accommodations-defaults';

interface HotelSummary {
  id: number;
  name: string;
  location: string;
  description?: string | null;
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

const HOTEL_FALLBACK_IMAGES = [
  '/images/gallery/hotels/hotel1.jpg',
  '/images/gallery/hotels/hotel2.jpg',
  '/images/gallery/hotels/hotel3.jpg',
];

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

  const roomsByHotel = useMemo(() => {
    const grouped = new Map<number, RoomSummary[]>();
    rooms.forEach((room) => {
      if (!grouped.has(room.hotelId)) {
        grouped.set(room.hotelId, []);
      }
      grouped.get(room.hotelId)?.push(room);
    });
    return grouped;
  }, [rooms]);

  const [expandedHotelIds, setExpandedHotelIds] = useState<number[]>([]);

  useEffect(() => {
    if (hotels.length === 0) {
      setExpandedHotelIds([]);
      return;
    }
    setExpandedHotelIds((prev) => {
      const valid = prev.filter((id) => hotels.some((hotel) => hotel.id === id));
      if (valid.length > 0) return valid;
      return [hotels[0].id];
    });
  }, [hotels]);

  const toggleHotel = (hotelId: number) => {
    setExpandedHotelIds((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId],
    );
  };

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
                <img
                  src={imageSrc}
                  alt={item.label || 'Accommodation hero'}
                  className="absolute inset-0 h-full w-full object-cover object-right"
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
          title={accommodationsConfig.listing.title || ''}
          description={
            accommodationsConfig.listing.description ||
            'Browse each hotel and expand to view available room types.'
          }
        />
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`hotel-skeleton-${index}`} className="overflow-hidden border-border/70 bg-card/90">
                <div className="h-40 w-full animate-pulse bg-muted/50" />
                <div className="p-5">
                  <div className="h-6 w-40 animate-pulse rounded bg-muted/50" />
                </div>
              </Card>
            ))
          ) : isError ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg">Unable to load accommodations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Please try again shortly.'}
              </CardContent>
            </Card>
          ) : hotels.length === 0 ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle className="text-lg">No hotels found</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Add hotels from the admin panel to show accommodations here.
              </CardContent>
            </Card>
          ) : (
            hotels.map((hotel) => {
              const isExpanded = expandedHotelIds.includes(hotel.id);
              const hotelImage =
                resolveImageUrl(hotel.imageUrl) ||
                HOTEL_FALLBACK_IMAGES[hotel.id % HOTEL_FALLBACK_IMAGES.length];
              const hotelRooms = roomsByHotel.get(hotel.id) ?? [];

              return (
                <Card key={`hotel-${hotel.id}-${hotel.imageUrl ?? 'none'}`} className="overflow-hidden border-border/70 bg-card/90">
                  <button
                    type="button"
                    onClick={() => toggleHotel(hotel.id)}
                    className="w-full text-left"
                  >
                    <div className="relative h-44 w-full">
                      <img
                        src={hotelImage}
                        alt={hotel.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-semibold">{hotel.name}</h3>
                            <p className="text-sm text-white/85">{hotel.location}</p>
                          </div>
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            {hotelRooms.length} room{hotelRooms.length === 1 ? '' : 's'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-sm text-muted-foreground">
                      <span>{isExpanded ? 'Hide room types' : 'Show room types'}</span>
                      <span className="text-base text-foreground">{isExpanded ? '−' : '+'}</span>
                    </div>
                  </button>

                  {isExpanded ? (
                    <CardContent className="space-y-4 p-5">
                      {hotel.description ? (
                        <p className="text-sm text-muted-foreground">{hotel.description}</p>
                      ) : null}

                      {hotelRooms.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No rooms configured for this hotel yet.</p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {hotelRooms.map((room) => {
                            const roomImage =
                              resolveImageUrl(room.imageUrl) ||
                              hotelImage ||
                              (demoMode ? demoImageUrl('room', room.name) : undefined);

                            return (
                              <div key={`room-${room.id}`} className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
                                {roomImage ? (
                                  <img
                                    src={roomImage}
                                    alt={room.name}
                                    className="h-40 w-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="h-40 w-full bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.2),_hsl(var(--background))_70%)]" />
                                )}
                                <div className="space-y-2 p-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-foreground">{room.name}</p>
                                      <p className="text-xs text-muted-foreground">{room.type}</p>
                                    </div>
                                    {room.isPremium ? <Badge>Premium</Badge> : null}
                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {room.description || 'Comfort-forward room with curated resort amenities.'}
                                  </p>
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span>${room.price}/night</span>
                                    <span>{room.capacity} guests</span>
                                    <span>{room.available === false ? 'Unavailable' : 'Available'}</span>
                                  </div>
                                  <Button asChild size="sm" className="w-full">
                                    <Link href={`/booking?roomId=${room.id}`}>Book this room</Link>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>
      </section>
    </PageShell>
  );
}
