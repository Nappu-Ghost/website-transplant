export type ActivitiesCta = {
  label?: string | null;
  url?: string | null;
};

export type ActivitiesHero = {
  kicker?: string | null;
  title?: string | null;
  description?: string | null;
  ctaPrimary?: ActivitiesCta | null;
  ctaSecondary?: ActivitiesCta | null;
};

export type ActivitiesGalleryItem = {
  id: string;
  imageUrl: string;
  label?: string | null;
  caption?: string | null;
};

export type ActivitiesSection = {
  title?: string | null;
  description?: string | null;
};

export type ActivitiesConfig = {
  hero: ActivitiesHero;
  gallery: ActivitiesGalleryItem[];
  featured: ActivitiesSection;
  listing: ActivitiesSection;
  featuredIds?: number[] | null;
};

export const defaultActivitiesConfig: ActivitiesConfig = {
  hero: {
    kicker: 'Island experiences',
    title: 'Activities built for calm, thrill, and connection',
    description:
      'From lagoon rituals to skyline rides, every experience is paced for your group and guided by hosts who know the islands best.',
    ctaPrimary: { label: 'Plan an itinerary', url: '/booking' },
    ctaSecondary: { label: 'Browse stays', url: '/accommodations' },
  },
  gallery: [
    {
      id: 'activities-hero-1',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
      label: 'Lagoon rituals',
      caption: 'Morning cruises and sound baths on the water.',
    },
    {
      id: 'activities-hero-2',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
      label: 'Skyline thrills',
      caption: 'Signature coasters and sunset rides.',
    },
    {
      id: 'activities-hero-3',
      imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
      label: 'Chef-led dining',
      caption: 'Seasonal menus and guided tastings.',
    },
  ],
  featured: {
    title: 'Featured experiences',
    description: 'Premium and top-rated experiences from the live roster.',
  },
  featuredIds: [],
  listing: {
    title: 'All activities',
    description: 'Explore the full lineup and plan your day.',
  },
};
