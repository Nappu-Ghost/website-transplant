import { ActivityCard, type ActivityCardProps } from '@/components/activity-card';
import { ImageGallery } from '@/components/image-gallery';

const activities: ActivityCardProps[] = [
  {
    name: 'Reef Snorkeling',
    activityType: 'Adventure',
    price: 120,
    duration: '2 hours',
    capacity: 12,
  },
  {
    name: 'Sunset Chef Table',
    activityType: 'Dining',
    price: 180,
    duration: '3 hours',
    capacity: 8,
    isPremium: true,
  },
  {
    name: 'Lagoon Meditation',
    activityType: 'Wellness',
    price: 95,
    duration: '90 minutes',
    capacity: 10,
  },
];

const activitiesGallery = [
  {
    src: '/images/gallery/activities/snorkel.svg',
    alt: 'Reef snorkeling',
    label: 'Adventure',
  },
  {
    src: '/images/gallery/activities/swimming.svg',
    alt: 'Lagoon swim',
    label: 'Wellness',
  },
  {
    src: '/images/gallery/activities/submarine.svg',
    alt: 'Submarine tour',
    label: 'Explore',
  },
  {
    src: '/images/gallery/activities/volleyball.svg',
    alt: 'Beach volleyball',
    label: 'Social',
  },
  {
    src: '/images/gallery/activities/roller-coaster.svg',
    alt: 'Island thrills',
    label: 'Energy',
  },
  {
    src: '/images/gallery/activities/skydiving.svg',
    alt: 'Sky view',
    label: 'Premium',
  },
];

export default function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-foreground">Activities</h1>
        <p className="text-base text-muted-foreground">
          Curated experiences designed for calm, connection, and discovery.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <ActivityCard key={activity.name} {...activity} />
        ))}
      </div>
      <div className="mt-16">
        <ImageGallery
          title="Curated Experiences"
          subtitle="Designed to balance adventure, wellness, and quiet moments."
          images={activitiesGallery}
        />
      </div>
    </div>
  );
}
