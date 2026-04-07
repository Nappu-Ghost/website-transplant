export type MapPinImage = {
  id: string;
  url: string;
  alt?: string | null;
  caption?: string | null;
};

export type MapPin = {
  id: string;
  name: string;
  description?: string | null;
  x: number;
  y: number;
  images: MapPinImage[];
};

export type ResortMapConfig = {
  enabled: boolean;
  title?: string | null;
  description?: string | null;
  backgroundImageUrl?: string | null;
  defaultZoom: number;
  pins: MapPin[];
};

export const defaultMapConfig: ResortMapConfig = {
  enabled: true,
  title: 'Explore the resort map',
  description:
    'Preview key locations across Azure Lagoon Resort. Hover over a pin for the name, then click to view more details.',
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  defaultZoom: 1,
  pins: [
    {
      id: 'arrival-jetty',
      name: 'Arrival Jetty',
      description: 'Main arrival point with concierge welcome and quick ferry access.',
      x: 18,
      y: 72,
      images: [
        {
          id: 'arrival-jetty-1',
          url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
          alt: 'Arrival jetty',
          caption: 'Guests are welcomed here before check-in.',
        },
      ],
    },
    {
      id: 'lagoon-spa',
      name: 'Lagoon Spa',
      description: 'Wellness pavilion for sunrise treatments and evening rituals.',
      x: 56,
      y: 34,
      images: [
        {
          id: 'lagoon-spa-1',
          url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
          alt: 'Lagoon spa',
          caption: 'Ocean-facing wellness rooms and quiet lounges.',
        },
      ],
    },
  ],
};
