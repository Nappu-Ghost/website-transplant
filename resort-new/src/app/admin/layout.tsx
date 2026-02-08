'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground">Resort Admin</span>
            <span className="text-xs text-muted-foreground">
              {user?.name || user?.email || 'Signed out'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Button variant="outline" asChild>
              <Link href="/">Back to Site</Link>
            </Button>
            <Button onClick={logout} disabled={!user}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
