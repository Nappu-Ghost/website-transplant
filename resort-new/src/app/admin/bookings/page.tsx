"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModalDialog, PageHeader, SectionHeader } from '@/components/shared';
import { bookingService } from '@/lib/api-service';

type BookingStatus = 'Confirmed' | 'Pending' | 'Arriving' | 'Checked-in' | 'Checked-out' | 'Cancelled';

type ApiBookingStatus =
  | 'PENDING'
  | 'PAYMENT_COMPLETED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

interface ApiBooking {
  id: number;
  status: ApiBookingStatus;
  startDate?: string;
  endDate?: string;
  numberOfGuests?: number;
  user?: { name?: string | null; email?: string | null } | null;
  rooms?: { room?: { name?: string } }[];
}
interface BookingSummary {
  id: number;
  code: string;
  guest: string;
  dates: string;
  room: string;
  guests: number;
  status: BookingStatus;
  apiStatus: ApiBookingStatus;
}

const statusTone: Record<BookingStatus, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Arriving: 'bg-sky-100 text-sky-700',
  'Checked-in': 'bg-indigo-100 text-indigo-700',
  'Checked-out': 'bg-slate-100 text-slate-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const getBookingCode = (id: number) => `ALR-${String(id).padStart(6, '0')}`;

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return 'Dates pending';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Dates pending';
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  return `${startLabel}-${endLabel}`;
};

const mapStatusToLabel = (status: ApiBookingStatus): BookingStatus => {
  switch (status) {
    case 'PAYMENT_COMPLETED':
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CHECKED_IN':
      return 'Checked-in';
    case 'CHECKED_OUT':
      return 'Checked-out';
    case 'CANCELLED':
      return 'Cancelled';
    case 'PENDING':
    default:
      return 'Pending';
  }
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | BookingStatus>('All');
  const [statusEdits, setStatusEdits] = useState<Record<number, ApiBookingStatus>>({});
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery<ApiBooking[]>({
    queryKey: ['bookings', 'admin'],
    queryFn: () => bookingService.list(),
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: ApiBookingStatus }) =>
      bookingService.update(String(id), { status: nextStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'admin'] });
    },
  });

  const bookings = useMemo<BookingSummary[]>(() => {
    return (bookingsQuery.data ?? []).map((booking) => {
      const roomName = booking.rooms?.[0]?.room?.name ?? 'Room pending';
      const guestName = booking.user?.name || booking.user?.email || 'Guest';
      const labelStatus = mapStatusToLabel(booking.status);
      return {
        id: booking.id,
        code: getBookingCode(booking.id),
        guest: guestName,
        dates: formatDateRange(booking.startDate, booking.endDate),
        room: roomName,
        guests: booking.numberOfGuests ?? 1,
        status: labelStatus,
        apiStatus: booking.status,
      };
    });
  }, [bookingsQuery.data]);

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = [booking.code, booking.guest, booking.room]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesStatus = status === 'All' || booking.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, status]);

  const updateStatus = (bookingId: number, nextStatus: ApiBookingStatus) => {
    updateBookingMutation.mutate({ id: bookingId, nextStatus });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description="Track reservations, arrivals, and guest status."
      />

      {bookingsQuery.isError ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Unable to load bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {bookingsQuery.error instanceof Error
              ? bookingsQuery.error.message
              : 'Please try again shortly.'}
          </CardContent>
        </Card>
      ) : null}

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
              <SelectItem value="Checked-out">Checked-out</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export manifest</Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Reservation list</CardTitle>
          <p className="text-sm text-muted-foreground">
            {bookingsQuery.isLoading ? 'Loading bookings...' : `${filtered.length} bookings`}
          </p>
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
              {bookingsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filtered.map((booking) => (
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
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.2em]">Update status</p>
                          <Select
                            value={statusEdits[booking.id] ?? booking.apiStatus}
                            onValueChange={(value) =>
                              setStatusEdits((current) => ({
                                ...current,
                                [booking.id]: value as ApiBookingStatus,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PAYMENT_COMPLETED">Payment completed</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                              <SelectItem value="CHECKED_IN">Checked-in</SelectItem>
                              <SelectItem value="CHECKED_OUT">Checked-out</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateBookingMutation.isPending}
                          onClick={() =>
                            updateStatus(
                              booking.id,
                              statusEdits[booking.id] ?? booking.apiStatus
                            )
                          }
                        >
                          {updateBookingMutation.isPending ? 'Updating...' : 'Save status'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateBookingMutation.isPending || booking.apiStatus === 'CANCELLED'}
                          onClick={() => updateStatus(booking.id, 'CANCELLED')}
                        >
                          {booking.apiStatus === 'CANCELLED' ? 'Cancelled' : 'Cancel booking'}
                        </Button>
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
