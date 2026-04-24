export interface AdminPage {
  slug: string;
  label: string;
  href: string;
  description: string;
}

export const ADMIN_PAGES: AdminPage[] = [
  { slug: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', description: 'Overview, occupancy, and at-a-glance performance.' },
  { slug: 'bookings', label: 'Bookings', href: '/admin/bookings', description: 'Reservation pipeline, guest status, and arrival prep.' },
  { slug: 'activities', label: 'Activities', href: '/admin/activities', description: 'Curated experiences, capacity, and scheduling.' },
  { slug: 'payments', label: 'Payments', href: '/admin/payments', description: 'Deposits, outstanding balances, and revenue tracking.' },
  { slug: 'map-editor', label: 'Map Editor', href: '/admin/map-editor', description: 'Custom map image, pin placement, and Map tab visibility.' },
  { slug: 'users', label: 'Users', href: '/admin/users', description: 'Guest profiles, roles, and concierge assignments.' },
  { slug: 'reports', label: 'Reports', href: '/admin/reports', description: 'Performance insights, trends, and forecasts.' },
  { slug: 'settings', label: 'Settings', href: '/admin/settings', description: 'Policies, pricing defaults, and permissions.' },
  { slug: 'hotels', label: 'Hotels', href: '/admin/hotels', description: 'Property setup, locations, and floor counts.' },
  { slug: 'accommodations', label: 'Rooms', href: '/admin/accommodations', description: 'Suite inventory, availability, and rate tiers.' },
  { slug: 'customize-pages', label: 'Customize Pages', href: '/admin/customize-pages', description: 'Hero galleries and section copy for public pages.' },
  { slug: 'roles', label: 'Role Management', href: '/admin/roles', description: 'Roles, admin access, and per-page permissions.' },
];

/** Extract the first path segment after /admin from a pathname. */
export function getAdminPageSlug(pathname: string): string | null {
  const match = pathname.match(/^\/admin\/([^/]+)/);
  return match ? match[1] : null;
}

/** Check if a slug is accessible given permissions. */
export function canAccessPage(
  slug: string,
  permissions: { adminAccess: boolean; allPages: boolean; pages: string[] } | null,
): boolean {
  if (!permissions || !permissions.adminAccess) return false;
  if (permissions.allPages) return true;
  return permissions.pages.includes(slug);
}
