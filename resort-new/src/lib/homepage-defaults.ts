export type HomepageCta = {
  label?: string | null;
  url?: string | null;
};

export type HomepageHero = {
  kicker?: string | null;
  title?: string | null;
  description?: string | null;
  ctaPrimary?: HomepageCta | null;
  ctaSecondary?: HomepageCta | null;
  ctaTertiary?: HomepageCta | null;
};

export type HomepageHeroCard = {
  id: string;
  title: string;
  detail: string;
  tag?: string | null;
};

export type HomepageSectionCard = {
  title: string;
  description: string;
  imageUrl?: string | null;
};

export type HomepageTwoIsland = {
  title?: string | null;
  description?: string | null;
  resort: HomepageSectionCard;
  park: HomepageSectionCard;
};

export type HomepageListItem = {
  id: string;
  title: string;
  description: string;
};

export type HomepageFerry = {
  title?: string | null;
  items: HomepageListItem[];
  cta?: HomepageCta | null;
};

export type HomepageAd = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  badge?: string | null;
};

export type HomepageDayPlanner = {
  title?: string | null;
  items: HomepageListItem[];
  cta?: HomepageCta | null;
};

export type HomepageConfig = {
  hero: HomepageHero;
  heroCards: HomepageHeroCard[];
  twoIsland: HomepageTwoIsland;
  ferry: HomepageFerry;
  ads: HomepageAd[];
  dayPlanner: HomepageDayPlanner;
};

export const defaultHomepageConfig: HomepageConfig = {
  hero: {
    kicker: 'Welcome adventurers',
    title: 'Azure Lagoon Resort',
    description:
      'A dual-island destination with a luxury resort on one shore and Azure Land on the other. Seamless transfers let you shape each day around relaxation, adventure, or both.',
    ctaPrimary: { label: 'Plan the full journey', url: '/booking' },
    ctaSecondary: { label: 'Explore the resort', url: '/accommodations' },
    ctaTertiary: { label: 'Azure Land highlights', url: '/activities' },
  },
  heroCards: [
    {
      id: 'resort-island',
      title: 'Resort Island',
      detail: 'White sand beaches, chef-led dining, and waterfront suites.',
      tag: 'Luxury',
    },
    {
      id: 'azure-land',
      title: 'Azure Land',
      detail: 'Signature rides, festivals, and immersive story zones.',
      tag: 'Theme park',
    },
    {
      id: 'island-connection',
      title: 'Island Connection',
      detail: 'Seamless transfers between resort calm and park energy.',
      tag: 'Travel',
    },
  ],
  twoIsland: {
    title: 'Your journey across two islands',
    description: 'Luxury on one shore, Azure Land on the other, connected by a calm lagoon ride.',
    resort: {
      title: 'Suites, dining, and coastal rituals',
      description: 'Private cabanas, chef-driven restaurants, and sunset wellness lounges.',
      imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    },
    park: {
      title: 'Rides, festivals, and immersive zones',
      description: 'Coasters, parade nights, and family-friendly storytelling districts.',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    },
  },
  ferry: {
    title: 'The ferry in between',
    items: [
      {
        id: 'ferry-frequency',
        title: 'Every 20 minutes',
        description: 'Shuttles run all day, so you can move between islands whenever the mood shifts.',
      },
      {
        id: 'ferry-booking',
        title: 'Pre-book your crossings',
        description: 'Reserve priority slots with lounge seating and sunset departures.',
      },
    ],
    cta: { label: 'Reserve ferry seats', url: '/booking' },
  },
  ads: [
    {
      id: 'lagoon-dining-week',
      title: 'Lagoon Dining Week',
      description: 'Chef collaborations, oceanfront tastings, and a closing night under lanterns.',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
      ctaText: 'Reserve a table',
      ctaUrl: '/booking',
      badge: 'Limited series',
    },
    {
      id: 'skyline-ride',
      title: 'Skyline Coaster Preview',
      description: 'Be first in line for the sunset test rides at Azure Land.',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
      ctaText: 'Join the list',
      ctaUrl: '/activities',
      badge: 'Azure Land',
    },
    {
      id: 'ferry-sprint',
      title: 'Ferry Sprint Pass',
      description: 'Priority boarding between islands with lounge seating and mocktail service.',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
      ctaText: 'Upgrade my trip',
      ctaUrl: '/booking',
      badge: 'Fast track',
    },
  ],
  dayPlanner: {
    title: 'Island day planner',
    items: [
      {
        id: 'planner-morning',
        title: 'Morning calm',
        description: 'Breakfast on the resort deck, spa rituals, and private beach time.',
      },
      {
        id: 'planner-afternoon',
        title: 'Afternoon thrill',
        description: 'Hop the ferry and explore coasters, shows, and themed dining.',
      },
      {
        id: 'planner-evening',
        title: 'Evening glow',
        description: 'Return for lantern-lit dinners and beachfront performances.',
      },
    ],
    cta: { label: 'Build my itinerary', url: '/booking' },
  },
};
