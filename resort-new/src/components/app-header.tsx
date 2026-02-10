"use client";

import type React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeToggleButton } from './theme-toggle-button';
import { useAuth } from '@/hooks/auth/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { NavLink } from '@/components/shared';

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/accommodations', label: 'Accommodations' },
    { href: '/activities', label: 'Activities' },
    { href: '/booking', label: 'Booking' },
    { href: '/contact', label: 'Contact' },
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
          <span className="text-xl font-bold text-primary">Azure Lagoon Resort</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive(item.href)}
            />
          ))}
          
          {/* Show different links based on authentication status */}
          {user ? (
            <>
              {/* Admin link for admin and manager roles */}
              {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
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
                  <span className="text-lg font-bold text-primary">Azure Lagoon Resort</span>
                </Link>
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    isActive={isActive(item.href)}
                    size="lg"
                  />
                ))}
                
                {/* Show different links based on authentication status for mobile */}
                {user ? (
                  <>
                    {/* Admin link for admin and manager roles */}
                    {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                      <Button variant="secondary" className="mt-4" asChild>
                        <Link href="/admin">Admin</Link>
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
