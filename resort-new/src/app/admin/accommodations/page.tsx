"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, SectionHeader } from '@/components/shared';

const inventory = [
  { name: 'Lagoon Suite', available: 6, occupancy: '82%', status: 'High demand' },
  { name: 'Garden Villa', available: 4, occupancy: '76%', status: 'Limited' },
  { name: 'Harbor Residence', available: 2, occupancy: '68%', status: 'Limited' },
  { name: 'Ocean Breeze Suite', available: 5, occupancy: '71%', status: 'Open' },
];

export default function AdminAccommodationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Accommodations"
        description="Manage suite inventory, availability, and rate tiers."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Inventory overview</CardTitle>
          <Button variant="outline">Add accommodation</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.available}</TableCell>
                  <TableCell>{item.occupancy}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Open' ? 'secondary' : 'outline'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SectionHeader
        title="Availability notes"
        description="Harbor residences have fewer than 3 rooms remaining for the next two weeks."
      />
    </div>
  );
}
