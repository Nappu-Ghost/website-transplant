"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AccommodationCard, type AccommodationCardProps } from '@/components/accommodation-card';
import { ImageGallery } from '@/components/image-gallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalDialog, PageHeader, PageShell, SectionHeader } from '@/components/shared';

type AccommodationCategory = 'Suite' | 'Villa' | 'Residence';

interface AccommodationDetail extends AccommodationCardProps {
  category: AccommodationCategory;
  size: string;
  bed: string;
  view: string;
  highlights: string[];
  imageUrl: string;
}

const accommodations: AccommodationDetail[] = [
  {
    name: 'Lagoon Suite 201',
    location: 'Oceanfront Wing',
    pricePerNight: 480,
    capacity: 2,
    description: 'Private deck, floating breakfast service, and sunset views.',
    rating: 4.9,
    isPremium: true,
    tags: ['King bed', 'Deck access'],
    category: 'Suite',
    size: '640 sq ft',
    bed: 'King bed',
    view: 'Lagoon view',
    highlights: ['Private deck', 'Floating breakfast', 'Concierge service'],
    imageUrl: '/images/gallery/hotels/hotel1.jpg',
  },
  {
    name: 'Garden Villa 102',
    location: 'Palm Grove',
    pricePerNight: 280,
    capacity: 2,
    description: 'Quiet garden path, minimalist interior, morning light.',
    rating: 4.7,
    tags: ['Patio', 'Outdoor shower'],
    category: 'Villa',
    size: '520 sq ft',
    bed: 'Queen bed',
    view: 'Garden view',
    highlights: ['Outdoor shower', 'Private patio', 'Morning tea service'],
    imageUrl: '/images/gallery/rooms/room1.jpg',
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
    category: 'Residence',
    size: '1,050 sq ft',
    bed: 'Two king beds',
    view: 'Harbor view',
    highlights: ['Private lounge', 'In-suite dining', 'Dedicated host'],
    imageUrl: '/images/gallery/hotels/hotel3.jpg',
  },
  {
    name: 'Ocean Breeze Suite',
    location: 'Coral Terrace',
    pricePerNight: 360,
    capacity: 2,
    description: 'Light-filled suite with coastal textures and open views.',
    rating: 4.6,
    tags: ['Balcony', 'Soaking tub'],
    category: 'Suite',
    size: '560 sq ft',
    bed: 'King bed',
    view: 'Ocean view',
    highlights: ['Soaking tub', 'Balcony seating', 'Sunrise rituals'],
    imageUrl: '/images/gallery/hotels/hotel2.jpg',
  },
  {
    name: 'Palm Grove Villa',
    location: 'Garden Walk',
    pricePerNight: 320,
    capacity: 3,
    description: 'Villa with garden entry, outdoor lounge, and quiet finishes.',
    rating: 4.5,
    tags: ['Outdoor lounge', 'Daybed'],
    category: 'Villa',
    size: '600 sq ft',
    bed: 'King + daybed',
    view: 'Garden view',
    highlights: ['Outdoor lounge', 'Daybed alcove', 'Personal host'],
    imageUrl: '/images/gallery/rooms/room1.jpg',
  },
  {
    name: 'Harbor Loft',
    location: 'Marina Deck',
    pricePerNight: 520,
    capacity: 3,
    description: 'Loft-style residence with double-height windows.',
    rating: 4.7,
    tags: ['Loft', 'Workspace'],
    category: 'Residence',
    size: '780 sq ft',
    bed: 'King bed',
    view: 'Marina view',
    highlights: ['Workspace nook', 'Lounge corner', 'Twilight service'],
    imageUrl: '/images/gallery/hotels/hotel1.jpg',
  },
];

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
        <p>{filtered.length} stays available</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/booking">Plan a stay</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
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
