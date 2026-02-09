import { ActivityCard } from '@/components/activity-card';

const activities = [
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
    </div>
  );
}
