"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageHeader, SectionHeader } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [autoDeposits, setAutoDeposits] = useState(true);
  const [arrivalReminders, setArrivalReminders] = useState(true);
  const [experienceWaitlist, setExperienceWaitlist] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getPasswordIssues = (password: string, email?: string) => {
    const issues: string[] = [];
    const pw = (password ?? '').trim();

    if (pw.length < 12) issues.push('Password must be at least 12 characters long.');
    if (pw.length > 128) issues.push('Password must be at most 128 characters long.');

    let classes = 0;
    if (/[a-z]/.test(pw)) classes += 1;
    if (/[A-Z]/.test(pw)) classes += 1;
    if (/[0-9]/.test(pw)) classes += 1;
    if (/[^a-zA-Z0-9]/.test(pw)) classes += 1;
    if (pw && classes < 3) issues.push('Password must include at least 3 of: lowercase, uppercase, digit, symbol.');

    if (email) {
      const local = email.split('@', 1)[0]?.toLowerCase() ?? '';
      if (local && pw.toLowerCase().includes(local)) {
        issues.push('Password must not contain parts of your email address.');
      }
    }

    return issues;
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;
    if (newPassword !== confirmPassword) {
      toast({ title: 'Password update failed', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    const issues = getPasswordIssues(newPassword, user.email);
    if (issues.length > 0) {
      toast({ title: 'Password requirements', description: issues.join(' '), variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await api.updateUser(String(user.id), { password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Your password has been changed.' });
      await api.logoutAll();
      await logout();
    } catch (e: any) {
      toast({ title: 'Password update failed', description: e?.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsSaving(true);
    try {
      await api.logoutAll();
      await logout();
    } catch (e: any) {
      toast({ title: 'Could not log out all sessions', description: e?.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure policies, pricing defaults, and guest communications."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Pricing defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deposit">Deposit percentage</Label>
            <Input id="deposit" defaultValue="20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Service fee</Label>
            <Input id="service" defaultValue="45" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Tax rate</Label>
            <Input id="tax" defaultValue="12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hold">Hold window (hours)</Label>
            <Input id="hold" defaultValue="48" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Guest communications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-send deposit requests</p>
              <p className="text-xs text-muted-foreground">Triggered after confirmation.</p>
            </div>
            <Switch checked={autoDeposits} onCheckedChange={setAutoDeposits} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Arrival reminders</p>
              <p className="text-xs text-muted-foreground">Sent 7 days before check-in.</p>
            </div>
            <Switch checked={arrivalReminders} onCheckedChange={setArrivalReminders} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Experience waitlist</p>
              <p className="text-xs text-muted-foreground">Enable waitlist for full sessions.</p>
            </div>
            <Switch checked={experienceWaitlist} onCheckedChange={setExperienceWaitlist} />
          </div>
        </CardContent>
      </Card>

      <SectionHeader
        title="Permissions"
        description="Create users, change roles, and manage access from the Users page."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Account security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button className="w-fit" onClick={handleChangePassword} disabled={isSaving || !newPassword || !confirmPassword}>
              Change password
            </Button>
            <Button variant="outline" className="w-fit" onClick={handleLogoutAll} disabled={isSaving}>
              Log out all sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button className="w-fit">Save settings</Button>
    </div>
  );
}
