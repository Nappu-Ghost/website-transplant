export type AccommodationsCta = {
  label?: string | null;
  url?: string | null;
};

export type AccommodationsHero = {
  kicker?: string | null;
  title?: string | null;
  description?: string | null;
  ctaPrimary?: AccommodationsCta | null;
  ctaSecondary?: AccommodationsCta | null;
};

export type AccommodationsGalleryItem = {
  id: string;
  imageUrl: string;
  label?: string | null;
  caption?: string | null;
};

export type AccommodationsSection = {
  title?: string | null;
  description?: string | null;
};

export type AccommodationsConfig = {
  hero: AccommodationsHero;
  gallery: AccommodationsGalleryItem[];
  featured: AccommodationsSection;
  listing: AccommodationsSection;
};

export const defaultAccommodationsConfig: AccommodationsConfig = {
  hero: {
    kicker: 'Resort stays',
    title: 'Suites and villas crafted for slow mornings',
    description:
      'Choose lagoon-front suites or private villas with curated in-room rituals, sunset decks, and effortless access to Azure Land.',
    ctaPrimary: { label: 'Plan a stay', url: '/booking' },
    ctaSecondary: { label: 'Explore activities', url: '/activities' },
  },
  gallery: [
    {
      id: 'gallery-hero-1',
      imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
      label: 'Lagoon suites',
      caption: 'Glass-fronted suites with private terraces.',
    },
    {
      id: 'gallery-hero-2',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      label: 'Island villas',
      caption: 'Open-air patios and twilight dining.',
    },
    {
      id: 'gallery-hero-3',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      label: 'Suite interiors',
      caption: 'Calm palettes and panoramic views.',
    },
  ],
  featured: {
    title: 'Featured stays',
    description: 'Premium suites and villas picked from live availability.',
  },
  listing: {
    title: 'All accommodations',
    description: 'Browse the full collection and compare amenities.',
  },
};
