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
    href: '/admin/accommodations',
    title: 'Accommodations',
    description: 'Suite inventory, availability, and rate tiers.',
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
          <Card key={link.href} className="border-border/70 bg-card/90 p-4 shadow-sm">
            <Link href={link.href} className="block space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{link.title}</h2>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
