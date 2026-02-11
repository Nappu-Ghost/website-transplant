"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageHeader, SectionHeader } from '@/components/shared';

export default function AdminSettingsPage() {
  const [autoDeposits, setAutoDeposits] = useState(true);
  const [arrivalReminders, setArrivalReminders] = useState(true);
  const [experienceWaitlist, setExperienceWaitlist] = useState(false);

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
        description="Invite new admins or update concierge permissions from the Users page."
      />

      <Button className="w-fit">Save settings</Button>
    </div>
  );
}
