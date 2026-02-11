"use client";

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog, ModalDialog, PageHeader, PageShell, SectionHeader } from '@/components/shared';
import api from '@/lib/api';

type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';

type ApiBookingStatus =
  | 'PENDING'
  | 'PAYMENT_COMPLETED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

interface ApiPayment {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiBooking {
  id: number;
  numberOfGuests: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  status: ApiBookingStatus;
  rooms?: { room?: { name?: string } }[];
  activities?: { activity?: { name?: string } }[];
  payments?: ApiPayment[];
}

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
  amountPaid?: string;
  paymentStatus?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  Upcoming: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-slate-100 text-slate-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return 'Dates pending';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Dates pending';
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  return `${startLabel} - ${endLabel}`;
};

const mapBookingStatus = (status: ApiBookingStatus): BookingStatus => {
  if (status === 'CHECKED_OUT') return 'Completed';
  if (status === 'CANCELLED') return 'Cancelled';
  return 'Upcoming';
};

const getBookingCode = (id: number) => `ALR-${String(id).padStart(6, '0')}`;

const getLatestPayment = (payments: ApiPayment[]) =>
  payments
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.paidAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.paidAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    })[0];

const calculatePaidTotal = (payments: ApiPayment[]) =>
  payments
    .filter((payment) => ['CAPTURED', 'AUTHORIZED'].includes(payment.status))
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

export default function MyBookingsPage() {
  const [filter, setFilter] = useState<'All' | BookingStatus>('All');
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadBookings = async () => {
      setIsLoading(true);
      setError(null);

      const [bookingsResult, paymentsResult] = await Promise.allSettled([
        api.getUserBookings(),
        api.getUserPayments(),
      ]);

      if (!isActive) return;

      if (bookingsResult.status === 'rejected') {
        const message = bookingsResult.reason instanceof Error
          ? bookingsResult.reason.message
          : 'Unable to load bookings right now.';
        setError(message);
        setBookings([]);
        setIsLoading(false);
        return;
      }

      const bookingData = (bookingsResult.value ?? []) as ApiBooking[];
      const paymentData = paymentsResult.status === 'fulfilled'
        ? ((paymentsResult.value ?? []) as ApiPayment[])
        : [];
      const paymentsByBookingId = new Map<number, ApiPayment[]>();

      paymentData.forEach((payment) => {
        if (!paymentsByBookingId.has(payment.bookingId)) {
          paymentsByBookingId.set(payment.bookingId, []);
        }
        paymentsByBookingId.get(payment.bookingId)?.push(payment);
      });

      const summaries = bookingData.map((booking) => {
        const roomName = booking.rooms?.[0]?.room?.name ?? 'Room pending';
        const activityName = booking.activities?.[0]?.activity?.name;
        const bookingPayments = paymentsByBookingId.get(booking.id)
          ?? booking.payments
          ?? [];
        const latestPayment = getLatestPayment(bookingPayments);
        const paidTotal = calculatePaidTotal(bookingPayments);
        const paymentCurrency = latestPayment?.currency ?? 'USD';

        return {
          id: String(booking.id),
          code: getBookingCode(booking.id),
          room: roomName,
          dates: formatDateRange(booking.startDate, booking.endDate),
          guests: booking.numberOfGuests ?? 1,
          total: formatCurrency(booking.totalPrice ?? 0, paymentCurrency),
          status: mapBookingStatus(booking.status),
          activity: activityName,
          amountPaid: bookingPayments.length > 0
            ? formatCurrency(paidTotal, paymentCurrency)
            : undefined,
          paymentStatus: latestPayment?.status,
        } as BookingSummary;
      });

      setBookings(summaries);
      setIsLoading(false);
    };

    loadBookings();

    return () => {
      isActive = false;
    };
  }, []);

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
        {isLoading ? (
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Loading bookings</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Fetching your latest reservation details.
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Unable to load bookings</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {error}
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
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
                  {booking.amountPaid ? (
                    <p>Paid: <span className="text-foreground">{booking.amountPaid}</span></p>
                  ) : null}
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
                      <p>Total paid: <span className="text-foreground">{booking.amountPaid ?? booking.total}</span></p>
                      {booking.paymentStatus ? (
                        <p>Payment status: <span className="text-foreground">{booking.paymentStatus}</span></p>
                      ) : null}
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
