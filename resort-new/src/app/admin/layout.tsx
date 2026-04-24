'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ShieldOff } from 'lucide-react';
import { roleService } from '@/lib/api-service';
import { getAdminPageSlug, canAccessPage } from '@/lib/admin-pages';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const permissionsQuery = useQuery({
    queryKey: ['admin', 'my-permissions'],
    queryFn: () => roleService.getMyPermissions(),
    // Only fetch when user is logged in
    enabled: !!user,
    // Stale for 5 minutes — role changes don't happen constantly
    staleTime: 5 * 60 * 1000,
  });

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/admin');
  };

  const showPreviousButton = pathname !== '/admin';

  const permissions = permissionsQuery.data ?? null;
  const pageSlug = getAdminPageSlug(pathname);
  // ADMIN role (allPages=true) or on index: always show content
  const isIndexPage = pathname === '/admin';
  const hasAccess =
    isIndexPage ||
    !pageSlug ||
    !permissions ||             // still loading — let it render
    canAccessPage(pageSlug, permissions);

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
      <main className="mx-auto max-w-6xl px-6 py-10">
        {showPreviousButton ? (
          <div className="mb-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              Previous page
            </Button>
          </div>
        ) : null}
            {hasAccess ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <ShieldOff className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Access denied</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Your role doesn&apos;t have permission to view this page. Contact an administrator to
                  request access.
                </p>
                <Button variant="outline" onClick={() => router.push('/admin')}>
                  Back to dashboard
                </Button>
              </div>
            )}
          </main>
    </div>
  );
}
