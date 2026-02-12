"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { userService } from '@/lib/api-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, PageShell, SectionHeader, useNotify } from '@/components/shared';

export default function ProfilePage() {
  const { user } = useAuth();
  const notify = useNotify();
  const userQuery = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userService.getCurrent(),
    enabled: Boolean(user?.id),
  });
  const resolvedUser = useMemo(() => userQuery.data ?? user, [userQuery.data, user]);
  const [name, setName] = useState(resolvedUser?.name || '');
  const [phone, setPhone] = useState('');
  const [preference, setPreference] = useState('');

  useEffect(() => {
    setName(resolvedUser?.name || '');
  }, [resolvedUser?.name]);

  const handleSave = () => {
    notify.success({
      title: 'Profile updated',
      description: 'Your preferences have been saved.',
    });
  };

  if (!user) {
    return (
      <PageShell className="max-w-3xl">
        <PageHeader
          title="Profile"
          description="Sign in to manage your reservation preferences and details."
        />
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Access your profile, saved stays, and concierge preferences after signing in.</p>
            <Button asChild>
              <Link href="/login?redirect=/profile">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Profile"
        description="Manage your personal details and stay preferences."
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Guest details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading profile details...</p>
            ) : null}
            {userQuery.isError ? (
              <p className="text-sm text-destructive">Unable to refresh profile details.</p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={resolvedUser?.email ?? user.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <Button onClick={handleSave}>Save changes</Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <SectionHeader
              title="Stay preferences"
              description="Share room and experience preferences with our concierge."
            />
            <div className="space-y-2">
              <Label htmlFor="preference">Notes</Label>
              <Input
                id="preference"
                value={preference}
                onChange={(event) => setPreference(event.target.value)}
                placeholder="Lagoon view, late check-out, wellness focus"
              />
            </div>
            <Button variant="outline" onClick={handleSave}>Update preferences</Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
