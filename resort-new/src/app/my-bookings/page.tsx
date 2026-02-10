"use client";

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog, ModalDialog, PageHeader, PageShell, SectionHeader } from '@/components/shared';

type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';

interface BookingSummary {
  id: string;
  code: string;
  room: string;
  dates: string;
  guests: number;
  total: string;
  status: BookingStatus;
  activity?: string;
  notes?: string;
}

const initialBookings: BookingSummary[] = [
  {
    id: 'booking-1',
    code: 'ALR-512483',
    room: 'Lagoon Suite 201',
    dates: 'Apr 12-15, 2026',
    guests: 2,
    total: '$1,640',
    status: 'Upcoming',
    activity: 'Sunset Chef Table',
    notes: 'Anniversary dinner on arrival night.',
  },
  {
    id: 'booking-2',
    code: 'ALR-398210',
    room: 'Garden Villa 102',
    dates: 'Jan 21-24, 2026',
    guests: 2,
    total: '$980',
    status: 'Completed',
    activity: 'Lagoon Meditation',
  },
  {
    id: 'booking-3',
    code: 'ALR-126540',
    room: 'Harbor Residence',
    dates: 'Dec 03-07, 2025',
    guests: 4,
    total: '$3,120',
    status: 'Cancelled',
    activity: 'Island Discovery',
  },
];

const statusStyles: Record<BookingStatus, string> = {
  Upcoming: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-slate-100 text-slate-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

export default function MyBookingsPage() {
  const [filter, setFilter] = useState<'All' | BookingStatus>('All');
  const [bookings, setBookings] = useState<BookingSummary[]>(initialBookings);

  const filtered = useMemo(() => {
    if (filter === 'All') return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const upcomingCount = bookings.filter((booking) => booking.status === 'Upcoming').length;
  const completedCount = bookings.filter((booking) => booking.status === 'Completed').length;

  const handleCancel = (id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: 'Cancelled' } : booking
      )
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="My bookings"
        description="Review upcoming stays, past visits, and reservation details."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Upcoming stays
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {upcomingCount}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Completed stays
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {completedCount}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Next reminder
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Confirm arrival details 7 days before check-in.
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <SectionHeader
          title="Reservation history"
          description="Filter by status or review full details per stay."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {filtered.length === 0 ? (
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">No bookings found</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Try another filter or plan a new stay with our concierge team.
            </CardContent>
          </Card>
        ) : (
          filtered.map((booking) => (
            <Card key={booking.id} className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">{booking.room}</CardTitle>
                  <p className="text-sm text-muted-foreground">{booking.dates}</p>
                </div>
                <Badge className={statusStyles[booking.status]}>{booking.status}</Badge>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Confirmation: <span className="text-foreground">{booking.code}</span></p>
                  <p>Guests: <span className="text-foreground">{booking.guests}</span></p>
                  <p>Total: <span className="text-foreground">{booking.total}</span></p>
                  {booking.activity && (
                    <p>Activity: <span className="text-foreground">{booking.activity}</span></p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <ModalDialog
                    title="Booking details"
                    description={`${booking.room} | ${booking.dates}`}
                    trigger={
                      <Button variant="outline">View details</Button>
                    }
                  >
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Confirmation code: <span className="text-foreground">{booking.code}</span></p>
                      <p>Guests: <span className="text-foreground">{booking.guests}</span></p>
                      <p>Activity: <span className="text-foreground">{booking.activity ?? 'None selected'}</span></p>
                      <p>Notes: <span className="text-foreground">{booking.notes ?? 'No additional notes'}</span></p>
                      <p>Total paid: <span className="text-foreground">{booking.total}</span></p>
                    </div>
                  </ModalDialog>
                  {booking.status === 'Upcoming' ? (
                    <ConfirmDialog
                      title="Request cancellation"
                      description="A concierge will confirm any cancellation fees before processing."
                      confirmLabel="Submit request"
                      trigger={<Button variant="outline">Request cancellation</Button>}
                      onConfirm={() => handleCancel(booking.id)}
                    />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageShell>
  );
}
