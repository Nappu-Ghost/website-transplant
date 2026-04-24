export type NavbarItemKey =
  | 'about'
  | 'accommodations'
  | 'activities'
  | 'booking'
  | 'map'
  | 'contact';

export type NavbarVisibility = Record<NavbarItemKey, boolean>;

export const DEFAULT_NAVBAR_VISIBILITY: NavbarVisibility = {
  about: true,
  accommodations: true,
  activities: true,
  booking: true,
  map: true,
  contact: true,
};

export const NAVBAR_ITEMS: Array<{ key: NavbarItemKey; href: string; label: string }> = [
  { key: 'about', href: '/about', label: 'About' },
  { key: 'accommodations', href: '/accommodations', label: 'Accommodations' },
  { key: 'activities', href: '/activities', label: 'Activities' },
  { key: 'booking', href: '/booking', label: 'Booking' },
  { key: 'map', href: '/map', label: 'Map' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];
