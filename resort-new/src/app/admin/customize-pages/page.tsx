import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHeader, SectionHeader } from '@/components/shared';

const pageLinks = [
  {
    href: '/admin/customize-home',
    title: 'Customize Home Page',
    description: 'Hero promos, ads, and featured highlights for the homepage.',
  },
  {
    href: '/admin/customize-accommodations',
    title: 'Customize Accommodations Page',
    description: 'Hero gallery and section headers for accommodations.',
  },
  {
    href: '/admin/customize-activities',
    title: 'Customize Activities Page',
    description: 'Hero gallery and section headers for activities.',
  },
  {
    href: '/admin/customize-about',
    title: 'Customize About Page',
    description: 'Hero gallery, story copy, and team details for about.',
  },
  {
    href: '/admin/map-editor',
    title: 'Map Editor',
    description: 'Background image, default zoom, pins, and public map visibility.',
  },
];

export default function AdminCustomizePagesLanding() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Customize Pages"
        description="Adjust hero copy, galleries, and headers for public-facing pages."
      />
      <SectionHeader
        title="Page settings"
        description="Select a page to edit its configuration."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {pageLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group block">
            <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,_transparent_0%,_hsl(var(--primary)/0.15)_45%,_hsl(var(--accent)/0.18)_60%,_transparent_100%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--primary)/0.2),_transparent_55%)]" />
              <div className="relative space-y-2 p-4">
                <h2 className="text-lg font-semibold text-foreground">{link.title}</h2>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
