"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AccommodationCard, type AccommodationCardProps } from '@/components/accommodation-card';
import { ImageGallery } from '@/components/image-gallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalDialog, PageHeader, PageShell, SectionHeader } from '@/components/shared';
import { hotelService, roomService } from '@/lib/api-service';

type AccommodationCategory = 'Suite' | 'Villa' | 'Residence';

interface AccommodationDetail extends AccommodationCardProps {
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

const accommodationGallery = [
  {
    src: '/images/gallery/hotels/hotel1.jpg',
    alt: 'Lagoon-facing suites',
    label: 'Suites',
  },
  {
    src: '/images/gallery/hotels/hotel2.jpg',
    alt: 'Oceanfront villas',
    label: 'Villas',
  },
  {
    src: '/images/gallery/hotels/hotel3.jpg',
    alt: 'Private terrace dining',
    label: 'Dining',
  },
  {
    src: '/images/gallery/rooms/room1.jpg',
    alt: 'Serene interiors',
    label: 'Rooms',
  },
];

export default function AccommodationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AccommodationCategory | 'All'>('All');
  const [capacity, setCapacity] = useState<'All' | '2' | '3' | '4+'>('All');
  const [priceRange, setPriceRange] = useState<'All' | 'Under 350' | '350-500' | '500+'>('All');

  const { data: rooms = [], isLoading, isError, error } = useQuery<RoomSummary[]>({
    queryKey: ['rooms'],
    queryFn: () => roomService.list(),
  });

  const { data: hotels = [] } = useQuery<HotelSummary[]>({
    queryKey: ['hotels'],
    queryFn: () => hotelService.list(),
  });

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

  const filtered = useMemo(() => {
    return accommodations.filter((accommodation) => {
      const matchesSearch = [
        accommodation.name,
        accommodation.location,
        accommodation.description,
        accommodation.tags?.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesCategory = category === 'All' || accommodation.category === category;

      const matchesCapacity =
        capacity === 'All' ||
        (capacity === '2' && accommodation.capacity <= 2) ||
        (capacity === '3' && accommodation.capacity === 3) ||
        (capacity === '4+' && accommodation.capacity >= 4);

      const matchesPrice =
        priceRange === 'All' ||
        (priceRange === 'Under 350' && accommodation.pricePerNight < 350) ||
        (priceRange === '350-500' && accommodation.pricePerNight >= 350 && accommodation.pricePerNight <= 500) ||
        (priceRange === '500+' && accommodation.pricePerNight > 500);

      return matchesSearch && matchesCategory && matchesCapacity && matchesPrice;
    });
  }, [search, category, capacity, priceRange]);

  return (
    <PageShell>
      <PageHeader
        title="Accommodations"
        description="A calm selection of suites and villas designed for effortless stays."
      />
      <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <SectionHeader
          title="Find your stay"
          description="Filter by category, capacity, or nightly rate."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search suites, villas, views"
          />
          <Select value={category} onValueChange={(value) => setCategory(value as AccommodationCategory | 'All')}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              <SelectItem value="Suite">Suite</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Residence">Residence</SelectItem>
            </SelectContent>
          </Select>
          <Select value={capacity} onValueChange={(value) => setCapacity(value as 'All' | '2' | '3' | '4+')}>
            <SelectTrigger>
              <SelectValue placeholder="Guests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any size</SelectItem>
              <SelectItem value="2">Up to 2 guests</SelectItem>
              <SelectItem value="3">3 guests</SelectItem>
              <SelectItem value="4+">4+ guests</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={(value) => setPriceRange(value as 'All' | 'Under 350' | '350-500' | '500+')}>
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Any price</SelectItem>
              <SelectItem value="Under 350">Under $350</SelectItem>
              <SelectItem value="350-500">$350-$500</SelectItem>
              <SelectItem value="500+">$500+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
        <p>{isLoading ? 'Loading stays...' : `${filtered.length} stays available`}</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/booking">Plan a stay</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <AccommodationCard
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
        ) : filtered.length === 0 ? (
          <Card className="col-span-full border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">No stays found</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Adjust your filters or explore the full resort offering.
            </CardContent>
          </Card>
        ) : (
          filtered.map((accommodation) => (
            <AccommodationCard
              key={accommodation.name}
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
                        <Link href={`/booking?room=${encodeURIComponent(accommodation.name)}`}>
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
                    <Link href={`/booking?room=${encodeURIComponent(accommodation.name)}`}>
                      Book now
                    </Link>
                  </Button>
                </div>
              }
            />
          ))
        )}
      </div>
      <div className="mt-16">
        <ImageGallery
          title="Inside Azure Lagoon"
          subtitle="A quiet palette of light, texture, and open space."
          images={accommodationGallery}
        />
      </div>
    </PageShell>
  );
}
