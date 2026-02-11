"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, SectionHeader } from '@/components/shared';

const activityRoster = [
  { name: 'Reef Snorkeling', category: 'Adventure', capacity: 12, next: 'Tomorrow 9:00 AM', status: 'Open' },
  { name: 'Sunset Chef Table', category: 'Dining', capacity: 8, next: 'Today 6:30 PM', status: 'Waitlist' },
  { name: 'Lagoon Meditation', category: 'Wellness', capacity: 10, next: 'Today 7:00 AM', status: 'Open' },
  { name: 'Island Discovery', category: 'Adventure', capacity: 6, next: 'Fri 8:00 AM', status: 'Limited' },
];

export default function AdminActivitiesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Activities"
        description="Curate experiences, capacity, and schedules."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Experience roster</CardTitle>
          <Button variant="outline">Add activity</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Next session</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityRoster.map((activity) => (
                <TableRow key={activity.name}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell className="text-muted-foreground">{activity.category}</TableCell>
                  <TableCell>{activity.capacity}</TableCell>
                  <TableCell>{activity.next}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === 'Open' ? 'secondary' : 'outline'}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SectionHeader
        title="Experience notes"
        description="Chef table waitlist is trending high for sunset sessions this week."
      />
    </div>
  );
}
