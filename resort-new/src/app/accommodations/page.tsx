import { AccommodationCard, type AccommodationCardProps } from '@/components/accommodation-card';
import { ImageGallery } from '@/components/image-gallery';

const accommodations: AccommodationCardProps[] = [
  {
    name: 'Lagoon Suite 201',
    location: 'Oceanfront Wing',
    pricePerNight: 480,
    capacity: 2,
    description: 'Private deck, floating breakfast service, and sunset views.',
    rating: 4.9,
    isPremium: true,
    tags: ['King bed', 'Deck access'],
  },
  {
    name: 'Garden Villa 102',
    location: 'Palm Grove',
    pricePerNight: 280,
    capacity: 2,
    description: 'Quiet garden path, minimalist interior, morning light.',
    rating: 4.7,
    tags: ['Patio', 'Outdoor shower'],
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
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-foreground">Accommodations</h1>
        <p className="text-base text-muted-foreground">
          A calm selection of suites and villas designed for effortless stays.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accommodations.map((accommodation) => (
          <AccommodationCard key={accommodation.name} {...accommodation} />
        ))}
      </div>
      <div className="mt-16">
        <ImageGallery
          title="Inside Azure Lagoon"
          subtitle="A quiet palette of light, texture, and open space."
          images={accommodationGallery}
        />
      </div>
    </div>
  );
}
