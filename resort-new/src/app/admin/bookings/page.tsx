"use client";

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModalDialog, PageHeader, SectionHeader } from '@/components/shared';

type BookingStatus = 'Confirmed' | 'Pending' | 'Arriving' | 'Checked-in' | 'Cancelled';

const bookings = [
  {
    code: 'ALR-512483',
    guest: 'Avery Jordan',
    dates: 'Apr 12-15',
    room: 'Lagoon Suite 201',
    guests: 2,
    status: 'Arriving' as BookingStatus,
  },
  {
    code: 'ALR-439112',
    guest: 'Noah Lee',
    dates: 'Apr 20-22',
    room: 'Ocean Breeze Suite',
    guests: 2,
    status: 'Pending' as BookingStatus,
  },
  {
    code: 'ALR-398210',
    guest: 'Maya Ortiz',
    dates: 'May 02-06',
    room: 'Garden Villa 102',
    guests: 3,
    status: 'Confirmed' as BookingStatus,
  },
  {
    code: 'ALR-512900',
    guest: 'Eli Parker',
    dates: 'May 10-14',
    room: 'Harbor Residence',
    guests: 4,
    status: 'Checked-in' as BookingStatus,
  },
  {
    code: 'ALR-387772',
    guest: 'Zoey Carter',
    dates: 'May 18-20',
    room: 'Palm Grove Villa',
    guests: 2,
    status: 'Cancelled' as BookingStatus,
  },
];

const statusTone: Record<BookingStatus, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Arriving: 'bg-sky-100 text-sky-700',
  'Checked-in': 'bg-indigo-100 text-indigo-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | BookingStatus>('All');

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = [booking.code, booking.guest, booking.room]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesStatus = status === 'All' || booking.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description="Track reservations, arrivals, and guest status."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search guest, code, room"
          />
          <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | 'All')}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Arriving">Arriving</SelectItem>
              <SelectItem value="Checked-in">Checked-in</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export manifest</Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Reservation list</CardTitle>
          <p className="text-sm text-muted-foreground">{filtered.length} bookings</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking) => (
                <TableRow key={booking.code}>
                  <TableCell className="text-xs text-muted-foreground">{booking.code}</TableCell>
                  <TableCell>{booking.guest}</TableCell>
                  <TableCell>{booking.dates}</TableCell>
                  <TableCell>{booking.room}</TableCell>
                  <TableCell>
                    <Badge className={statusTone[booking.status]}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <ModalDialog
                      title="Reservation details"
                      description={`${booking.room} | ${booking.dates}`}
                      trigger={<Button variant="outline" size="sm">View</Button>}
                    >
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>Guests: <span className="text-foreground">{booking.guests}</span></p>
                        <p>Special requests: <span className="text-foreground">Welcome amenity</span></p>
                        <p>Status: <span className="text-foreground">{booking.status}</span></p>
                      </div>
                    </ModalDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SectionHeader
        title="Arrival notes"
        description="Today's arrivals include 4 dietary requests and 2 celebration packages."
      />
    </div>
  );
}
