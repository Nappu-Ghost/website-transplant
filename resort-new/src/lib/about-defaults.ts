export type AboutCta = {
  label?: string | null;
  url?: string | null;
};

export type AboutHero = {
  kicker?: string | null;
  title?: string | null;
  description?: string | null;
  ctaPrimary?: AboutCta | null;
  ctaSecondary?: AboutCta | null;
};

export type AboutGalleryItem = {
  id: string;
  imageUrl: string;
  label?: string | null;
  caption?: string | null;
};

export type AboutIntro = {
  title?: string | null;
  description?: string | null;
  paragraphs: string[];
  highlight?: string | null;
};

export type AboutStatItem = {
  label: string;
  value: string;
};

export type AboutStats = {
  title?: string | null;
  items: AboutStatItem[];
};

export type AboutSection = {
  title?: string | null;
  description?: string | null;
};

export type AboutAmenity = {
  title: string;
  description: string;
};

export type AboutTeamMember = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export type AboutConfig = {
  hero: AboutHero;
  gallery: AboutGalleryItem[];
  intro: AboutIntro;
  stats: AboutStats;
  amenitiesSection: AboutSection;
  amenities: AboutAmenity[];
  teamSection: AboutSection;
  team: AboutTeamMember[];
};

export const defaultAboutConfig: AboutConfig = {
  hero: {
    kicker: 'About Azure Lagoon',
    title: 'A tranquil retreat shaped by sea and light',
    description:
      'Azure Lagoon is an intimate island sanctuary where modern luxury meets quiet discovery. Every stay is paced with curated rituals, warm hospitality, and effortless transitions.',
    ctaPrimary: { label: 'Plan a stay', url: '/booking' },
    ctaSecondary: { label: 'Explore stays', url: '/accommodations' },
  },
  gallery: [
    {
      id: 'about-hero-1',
      imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
      label: 'Lagoon views',
      caption: 'Soft light and open horizons.',
    },
    {
      id: 'about-hero-2',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
      label: 'Island calm',
      caption: 'Private decks and slow mornings.',
    },
    {
      id: 'about-hero-3',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
      label: 'Evening glow',
      caption: 'Golden-hour rituals by the sea.',
    },
  ],
  intro: {
    title: 'Resort story',
    description: 'Designed around calm, comfort, and quiet exploration.',
    paragraphs: [
      'Azure Lagoon Resort is an intimate island sanctuary where modern luxury meets quiet discovery. Each stay is paced with curated itineraries, coastal rituals, and a concierge team that anticipates every transition.',
      'From lagoon suites to garden villas, every space is designed with light, natural textures, and soft transitions between indoor and outdoor living. We focus on effortless arrivals, gentle adventures, and restful departures.',
    ],
    highlight: 'Thoughtful service, always at an unhurried pace.',
  },
  stats: {
    title: 'Resort at a glance',
    items: [
      { label: 'Suites + Villas', value: '42' },
      { label: 'Curated experiences', value: '18' },
      { label: 'Dining concepts', value: '3' },
      { label: 'Wellness rituals', value: 'Daily' },
      { label: 'Guest-to-host ratio', value: '3:1' },
    ],
  },
  amenitiesSection: {
    title: 'Amenities and rituals',
    description: 'Every detail is curated for calm, comfort, and gentle exploration.',
  },
  amenities: [
    {
      title: 'Lagoon access',
      description: 'Private decks, gentle tides, and sunrise paddling routes.',
    },
    {
      title: 'Wellness rituals',
      description: 'Spa suites, meditation terraces, and daily breathwork.',
    },
    {
      title: 'Chef-led dining',
      description: 'Tasting menus shaped by island harvests and tide cycles.',
    },
    {
      title: 'Golden-hour views',
      description: 'Skyline lounges and curated sunset itineraries.',
    },
  ],
  teamSection: {
    title: 'Meet the hosts',
    description: 'A team of guides, chefs, and wellness specialists rooted in the island.',
  },
  team: [
    {
      name: 'Elena Shore',
      role: 'General Manager',
      bio: 'Hospitality leader focused on calm, intuitive guest journeys.',
      imageUrl: '/images/gallery/hotels/hotel1.jpg',
    },
    {
      name: 'Mateo Kai',
      role: 'Experience Curator',
      bio: 'Designs wellness and adventure itineraries with local guides.',
      imageUrl: '/images/gallery/rooms/room1.jpg',
    },
    {
      name: 'Ayla Noor',
      role: 'Culinary Director',
      bio: 'Leads the kitchen with seasonal menus and shoreline sourcing.',
      imageUrl: '/images/gallery/hotels/hotel3.jpg',
    },
  ],
};
