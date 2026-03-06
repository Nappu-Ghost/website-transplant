import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHeader, SectionHeader } from '@/components/shared';

const adminLinks = [
  {
    href: '/admin/dashboard',
    title: 'Dashboard',
    description: 'Overview, occupancy, and at-a-glance performance.',
  },
  {
    href: '/admin/bookings',
    title: 'Bookings',
    description: 'Reservation pipeline, guest status, and arrival prep.',
  },
  {
    href: '/admin/activities',
    title: 'Activities',
    description: 'Curated experiences, capacity, and scheduling.',
  },
  {
    href: '/admin/payments',
    title: 'Payments',
    description: 'Deposits, outstanding balances, and revenue tracking.',
  },
  {
    href: '/admin/customize-pages',
    title: 'Customize Pages',
    description: 'Hero galleries and section copy for public pages.',
  },
  {
    href: '/admin/users',
    title: 'Users',
    description: 'Guest profiles, roles, and concierge assignments.',
  },
  {
    href: '/admin/reports',
    title: 'Reports',
    description: 'Performance insights, trends, and forecasts.',
  },
  {
    href: '/admin/settings',
    title: 'Settings',
    description: 'Policies, pricing defaults, and permissions.',
  },
];

const accommodationLinks = [
  {
    href: '/admin/hotels',
    title: 'Hotels',
    description: 'Property setup, locations, and floor counts.',
  },
  {
    href: '/admin/accommodations',
    title: 'Rooms',
    description: 'Suite inventory, availability, and rate tiers.',
  },
];

function AdminCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="group block">
      <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,_transparent_0%,_hsl(var(--primary)/0.15)_45%,_hsl(var(--accent)/0.18)_60%,_transparent_100%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--primary)/0.2),_transparent_55%)]" />
        <div className="relative space-y-2 p-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function AdminLandingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Resort Admin"
        description="Manage the Azure Lagoon experience from one place."
      />
      <SectionHeader
        title="Quick access"
        description="Jump to daily tasks, reporting, and inventory management."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <AdminCard key={link.href} href={link.href} title={link.title} description={link.description} />
        ))}

        {/* Accommodations group card */}
        <Card className="border-border/70 bg-card/90 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="space-y-2 p-4 pb-3">
            <h2 className="text-lg font-semibold text-foreground">Accommodations</h2>
            <p className="text-sm text-muted-foreground">Hotels, floors, and room inventory.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {accommodationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/60 px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,_transparent_0%,_hsl(var(--primary)/0.12)_45%,_hsl(var(--accent)/0.14)_60%,_transparent_100%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
                  <p className="relative text-sm font-semibold text-foreground">{link.title}</p>
                  <p className="relative mt-0.5 text-xs text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
