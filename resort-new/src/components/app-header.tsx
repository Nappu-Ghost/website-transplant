"use client";

import type React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from './theme-toggle-button';
import { useAuth } from '@/hooks/auth/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// Inline SVG for a Tooth icon
const ToothIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.57034 14.2814 5.6209 14.6221 5.6614 15M19.1656 12.1093C18.9256 12.6877 18.6803 13.2788 18.5 14C18.351 14.596 18.2908 15.4584 18.2268 16.3755C18.076 18.536 17.904 21 16.5 21C15.601 21 15.2072 19.5857 14.7735 18.0285C14.2424 16.1214 13.6516 14 12 14C10.3485 14 9.75768 16.1214 9.22655 18.0285C8.79288 19.5857 8.39901 21 7.50003 21C6.67282 21 6.27328 20.1446 6.05377 19" />
    </svg>
);

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/book-appointment', label: 'Book Appointment' },
    { href: '/services', label: 'Services' },
    { href: '/clinics', label: 'Clinics' },
  ];

  // Helper to check if a link is active
  const isActive = (href: string) => pathname === href;

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <ToothIcon className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary"> Island Dental Connect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex"> 
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
               className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive(item.href) ? 'text-primary font-semibold' : 'text-foreground/70'
               )}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Show different links based on authentication status */}
          {user ? (
            <>
              {/* Admin link for admin and manager roles */}
              {(user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'ADMINISTRATIVE_OFFICER') && (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/admin/dashboard">Dashboard</Link>
                </Button>
              )}
              
              {/* User dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserCircle className="h-4 w-4" />
                    {user.name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login?tab=register">Sign Up</Link>
              </Button>
            </>
          )}
          
          <ThemeToggleButton />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggleButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <ToothIcon className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold text-primary">
                    Island Dental
                  </span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                       isActive(item.href) ? 'text-primary font-semibold' : 'text-foreground/80'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Show different links based on authentication status for mobile */}
                {user ? (
                  <>
                    {/* Admin link for admin and manager roles */}
                    {(user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'ADMINISTRATIVE_OFFICER') && (
                      <Button variant="secondary" className="mt-4" asChild>
                        <Link href="/admin/dashboard">Dashboard</Link>
                      </Button>
                    )}
                    
                    <div className="mt-4 text-lg font-medium">
                      Signed in as: {user.name || user.email}
                    </div>
                    
                    <Button variant="outline" className="mt-2" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="mt-2" asChild>
                      <Link href="/login?tab=register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
