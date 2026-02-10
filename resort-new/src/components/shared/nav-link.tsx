import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  label: string;
  isActive?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

export function NavLink({ href, label, isActive, size = 'sm', className }: NavLinkProps) {
  const inactiveTone = size === 'lg' ? 'text-foreground/80' : 'text-foreground/70';

  return (
    <Link
      href={href}
      className={cn(
        'font-medium transition-colors hover:text-primary',
        size === 'lg' ? 'text-lg' : 'text-sm',
        isActive ? 'text-primary font-semibold' : inactiveTone,
        className
      )}
    >
      {label}
    </Link>
  );
}
