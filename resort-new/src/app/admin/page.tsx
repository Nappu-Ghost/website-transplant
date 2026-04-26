"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import {
  BedDouble,
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  Gauge,
  Landmark,
  Map,
  Palette,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { roleService } from '@/lib/api-service';
import { ADMIN_PAGES, canAccessPage } from '@/lib/admin-pages';

// Pages shown as standalone cards (not in the Accommodations group)
const STANDALONE_SLUGS = [
  'dashboard',
  'bookings',
  'activities',
  'payments',
  'customize-pages',
  'map-editor',
  'users',
  'reports',
  'settings',
  'roles',
];

const ACCOMMODATION_SLUGS = ['hotels', 'accommodations'];

const SETTINGS_SLUG = 'settings';

const ADMIN_CARD_ICONS: Record<string, LucideIcon> = {
  dashboard: Gauge,
  bookings: CalendarCheck2,
  activities: Sparkles,
  payments: CreditCard,
  'customize-pages': Palette,
  'map-editor': Map,
  users: Users,
  reports: ClipboardList,
  roles: ShieldCheck,
  settings: Settings,
};

function AdminCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="relative min-h-[198px] overflow-hidden border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,_transparent_0%,_hsl(var(--primary)/0.15)_45%,_hsl(var(--accent)/0.18)_60%,_transparent_100%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--primary)/0.2),_transparent_55%)]" />
        <Icon className="pointer-events-none absolute -bottom-3 -right-2 h-20 w-20 rotate-[-14deg] text-foreground/10 transition-colors duration-300 group-hover:text-primary/25" strokeWidth={1.4} />
        <div className="relative space-y-2 p-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Card>
    </Link>
  );
}

function AccommodationsCard({
  links,
}: {
  links: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-sm sm:col-span-2 lg:col-span-1">
      <Landmark className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 rotate-[-14deg] text-foreground/10" strokeWidth={1.4} />
      <div className="space-y-2 p-4 pb-3">
          <h2 className="text-lg font-semibold text-foreground">Accommodations</h2>
          <p className="text-sm text-muted-foreground">Hotels, floors, and room inventory.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group block">
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/60 px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,_transparent_0%,_hsl(var(--primary)/0.12)_45%,_hsl(var(--accent)/0.14)_60%,_transparent_100%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
              <p className="relative text-sm font-semibold text-foreground">{link.label}</p>
              <p className="relative mt-0.5 text-xs text-muted-foreground">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default function AdminLandingPage() {
  const permissionsQuery = useQuery({
    queryKey: ['admin', 'my-permissions'],
    queryFn: () => roleService.getMyPermissions(),
    staleTime: 5 * 60 * 1000,
  });

  const permissions = permissionsQuery.data ?? null;

  const standaloneLinks = ADMIN_PAGES.filter(
    (p) => STANDALONE_SLUGS.includes(p.slug) && canAccessPage(p.slug, permissions),
  );

  const orderedStandaloneLinks = [...standaloneLinks].sort((a, b) => {
    if (a.slug === SETTINGS_SLUG) return 1;
    if (b.slug === SETTINGS_SLUG) return -1;
    return 0;
  });

  const accommodationLinks = ADMIN_PAGES.filter(
    (p) => ACCOMMODATION_SLUGS.includes(p.slug) && canAccessPage(p.slug, permissions),
  );

  const settingsLink = orderedStandaloneLinks.find((link) => link.slug === SETTINGS_SLUG);
  const nonSettingsStandaloneLinks = orderedStandaloneLinks.filter((link) => link.slug !== SETTINGS_SLUG);
  const firstStandaloneLink = nonSettingsStandaloneLinks[0] ?? null;
  const remainingStandaloneLinks = nonSettingsStandaloneLinks.slice(1);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {firstStandaloneLink ? (
          <AdminCard
            key={firstStandaloneLink.href}
            href={firstStandaloneLink.href}
            title={firstStandaloneLink.label}
            description={firstStandaloneLink.description}
            icon={ADMIN_CARD_ICONS[firstStandaloneLink.slug] ?? BedDouble}
          />
        ) : null}

        {accommodationLinks.length > 0 ? <AccommodationsCard links={accommodationLinks} /> : null}

        {remainingStandaloneLinks.map((link) => (
          <AdminCard
            key={link.href}
            href={link.href}
            title={link.label}
            description={link.description}
            icon={ADMIN_CARD_ICONS[link.slug] ?? BedDouble}
          />
        ))}

        {settingsLink ? (
          <AdminCard
            key={settingsLink.href}
            href={settingsLink.href}
            title={settingsLink.label}
            description={settingsLink.description}
            icon={ADMIN_CARD_ICONS[settingsLink.slug] ?? BedDouble}
          />
        ) : null}
      </div>
    </div>
  );
}
