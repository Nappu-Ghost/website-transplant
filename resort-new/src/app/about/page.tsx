import Image from 'next/image';
import { Leaf, Sparkles, Sun, Waves, HeartHandshake, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageGallery } from '@/components/image-gallery';
import { FeatureCard, PageHeader, PageShell, SectionHeader } from '@/components/shared';

const amenities = [
  {
    icon: Waves,
    title: 'Lagoon access',
    description: 'Private decks, gentle tides, and sunrise paddling routes.',
  },
  {
    icon: Leaf,
    title: 'Wellness rituals',
    description: 'Spa suites, meditation terraces, and daily breathwork.',
  },
  {
    icon: Sparkles,
    title: 'Chef-led dining',
    description: 'Tasting menus shaped by island harvests and tide cycles.',
  },
  {
    icon: Sun,
    title: 'Golden-hour views',
    description: 'Skyline lounges and curated sunset itineraries.',
  },
];

const teamMembers = [
  {
    name: 'Elena Shore',
    role: 'General Manager',
    bio: 'Hospitality leader focused on calm, intuitive guest journeys.',
    image: '/images/gallery/hotels/hotel1.jpg',
  },
  {
    name: 'Mateo Kai',
    role: 'Experience Curator',
    bio: 'Designs wellness and adventure itineraries with local guides.',
    image: '/images/gallery/rooms/room1.jpg',
  },
  {
    name: 'Ayla Noor',
    role: 'Culinary Director',
    bio: 'Leads the kitchen with seasonal menus and shoreline sourcing.',
    image: '/images/gallery/hotels/hotel3.jpg',
  },
];

const aboutGallery = [
  {
    src: '/images/gallery/hotels/hotel2.jpg',
    alt: 'Oceanfront villas at dusk',
    label: 'Villas',
  },
  {
    src: '/images/gallery/rooms/room1.jpg',
    alt: 'Serene interiors with warm textures',
    label: 'Interiors',
  },
  {
    src: '/images/gallery/hotels/hotel1.jpg',
    alt: 'Lagoon suites and private terraces',
    label: 'Suites',
  },
  {
    src: '/images/gallery/hotels/hotel3.jpg',
    alt: 'Private dining with island views',
    label: 'Dining',
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        title="About Azure Lagoon"
        description="A tranquil retreat designed around the sea, the light, and slow living."
      />

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 text-base text-muted-foreground">
          <p>
            Azure Lagoon Resort is an intimate island sanctuary where modern luxury
            meets quiet discovery. Each stay is paced with curated itineraries, coastal
            rituals, and a concierge team that anticipates every transition.
          </p>
          <p>
            From lagoon suites to garden villas, every space is designed with light,
            natural textures, and soft transitions between indoor and outdoor living.
            We focus on effortless arrivals, gentle adventures, and restful departures.
          </p>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <HeartHandshake className="h-5 w-5 text-primary" />
            Thoughtful service, always at an unhurried pace.
          </div>
        </div>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Resort at a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Suites + Villas</span>
              <span className="text-foreground">42</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Curated experiences</span>
              <span className="text-foreground">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Dining concepts</span>
              <span className="text-foreground">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Wellness rituals</span>
              <span className="text-foreground">Daily</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Guest-to-host ratio</span>
              <span className="text-foreground">3:1</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 space-y-8">
        <SectionHeader
          title="Amenities and rituals"
          description="Every detail is curated for calm, comfort, and gentle exploration."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {amenities.map((amenity) => (
            <FeatureCard
              key={amenity.title}
              icon={amenity.icon}
              title={amenity.title}
              description={amenity.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-8">
        <SectionHeader
          title="Meet the hosts"
          description="A team of guides, chefs, and wellness specialists rooted in the island."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.name} className="border-border/70 bg-card/90 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {member.role}
                </div>
                <p className="text-lg font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <ImageGallery
          title="Moments at Azure Lagoon"
          subtitle="Sunlit suites, open skies, and a quiet rhythm by the water."
          images={aboutGallery}
        />
      </div>
    </PageShell>
  );
}
