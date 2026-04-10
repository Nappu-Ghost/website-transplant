"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, SectionHeader } from '@/components/shared';
import { adminService, bookingService, hotelService, roomService } from '@/lib/api-service';

interface AdminOverview {
  totals: {
    users: number;
    bookings: number;
    hotels: number;
    rooms: number;
    activities: number;
    payments: number;
  };
  revenueCollected: number;
}

type ApiBookingStatus =
  | 'PENDING'
  | 'PAYMENT_COMPLETED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

interface AdminBooking {
  id: number;
  createdAt?: string;
  endDate?: string;
  status: ApiBookingStatus;
  user?: {
    name?: string | null;
    email?: string | null;
  };
  rooms?: Array<{
    room?: {
      id?: number;
      name?: string | null;
      type?: string | null;
    } | null;
  }>;
}

interface HotelSummary {
  id: number;
  name: string;
}

interface RoomSummary {
  id: number;
  hotelId: number;
  name: string;
  type: string;
  available?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const getBookingCode = (id: number) => `ALR-${String(id).padStart(6, '0')}`;

const formatBookingStatus = (status: ApiBookingStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function AdminDashboardPage() {
  const overviewQuery = useQuery<AdminOverview>({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminService.getOverview(),
  });

  const bookingsQuery = useQuery<AdminBooking[]>({
    queryKey: ['admin', 'dashboard-bookings'],
    queryFn: () => bookingService.list(),
  });

  const hotelsQuery = useQuery<HotelSummary[]>({
    queryKey: ['admin', 'dashboard-hotels'],
    queryFn: () => hotelService.list(),
  });

  const roomsQuery = useQuery<RoomSummary[]>({
    queryKey: ['admin', 'dashboard-rooms'],
    queryFn: () => roomService.list(),
  });

  const activeRoomIds = useMemo(() => {
    const now = Date.now();
    const activeStatuses: ApiBookingStatus[] = ['PENDING', 'PAYMENT_COMPLETED', 'CONFIRMED', 'CHECKED_IN'];

    return new Set(
      (bookingsQuery.data ?? []).flatMap((booking) => {
        if (!activeStatuses.includes(booking.status)) return [];

        const endTime = booking.endDate ? new Date(booking.endDate).getTime() : Number.NaN;
        if (Number.isFinite(endTime) && endTime < now) return [];

        return (booking.rooms ?? [])
          .map((entry) => entry.room?.id)
          .filter((roomId): roomId is number => typeof roomId === 'number');
      }),
    );
  }, [bookingsQuery.data]);

  const availableRoomsCount = useMemo(
    () =>
      (roomsQuery.data ?? []).filter(
        (room) => room.available !== false && !activeRoomIds.has(room.id),
      ).length,
    [activeRoomIds, roomsQuery.data],
  );

  const recentBookings = useMemo(
    () =>
      [...(bookingsQuery.data ?? [])]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .slice(0, 5)
        .map((booking) => ({
          code: getBookingCode(booking.id),
          guest: booking.user?.name || booking.user?.email || 'Guest pending',
          room: booking.rooms?.[0]?.room?.name || 'Room pending',
          status: booking.status,
        })),
    [bookingsQuery.data],
  );

  const hotelNamesById = useMemo(
    () => new Map((hotelsQuery.data ?? []).map((hotel) => [hotel.id, hotel.name])),
    [hotelsQuery.data],
  );

  const occupancySegments = useMemo(() => {
    const grouped = new Map<string, { total: number; occupied: number }>();

    (roomsQuery.data ?? []).forEach((room) => {
      const label = hotelNamesById.get(room.hotelId) ?? `Hotel ${room.hotelId}`;
      const current = grouped.get(label) ?? { total: 0, occupied: 0 };
      current.total += 1;
      if (activeRoomIds.has(room.id)) {
        current.occupied += 1;
      }
      grouped.set(label, current);
    });

    return [...grouped.entries()]
      .map(([label, value]) => ({
        label,
        value: value.total > 0 ? Math.round((value.occupied / value.total) * 100) : 0,
        occupied: value.occupied,
        total: value.total,
      }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  }, [activeRoomIds, hotelNamesById, roomsQuery.data]);

  const occupancyNote = useMemo(() => {
    const topSegment = occupancySegments[0];

    if (!topSegment) {
      return 'Add hotels, rooms, and bookings to begin tracking hotel occupancy here.';
    }

    if (topSegment.value === 0) {
      return 'No current or upcoming stays are affecting hotel occupancy right now.';
    }

    return `${topSegment.label} is currently at ${topSegment.value}% occupancy (${topSegment.occupied}/${topSegment.total} rooms).`;
  }, [occupancySegments]);

  const metrics = useMemo(() => {
    const totals = overviewQuery.data?.totals;
    const totalRooms = roomsQuery.data?.length ?? totals?.rooms ?? 0;

    return [
      {
        label: 'Total bookings',
        value: totals ? String(totals.bookings) : '—',
        delta: 'All time',
      },
      {
        label: 'Available rooms',
        value: roomsQuery.data ? String(availableRoomsCount) : totals ? String(totals.rooms) : '—',
        delta: `${totalRooms} total room${totalRooms === 1 ? '' : 's'}`,
      },
      {
        label: 'Active experiences',
        value: totals ? String(totals.activities) : '—',
        delta: 'Current catalog',
      },
      {
        label: 'Revenue collected',
        value: overviewQuery.data ? formatCurrency(overviewQuery.data.revenueCollected) : '—',
        delta: 'Captured payments',
      },
    ];
  }, [availableRoomsCount, overviewQuery.data, roomsQuery.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Operational snapshot, arrivals, and performance indicators."
      />

      {overviewQuery.isError || bookingsQuery.isError || hotelsQuery.isError || roomsQuery.isError ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Unable to load dashboard data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {(overviewQuery.error instanceof Error && overviewQuery.error.message)
              || (bookingsQuery.error instanceof Error && bookingsQuery.error.message)
              || (hotelsQuery.error instanceof Error && hotelsQuery.error.message)
              || (roomsQuery.error instanceof Error && roomsQuery.error.message)
              || 'Please try again shortly.'}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Recent bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground">
                      Loading recent bookings...
                    </TableCell>
                  </TableRow>
                ) : recentBookings.length ? (
                  recentBookings.map((booking) => (
                    <TableRow key={booking.code}>
                      <TableCell className="text-xs text-muted-foreground">{booking.code}</TableCell>
                      <TableCell>{booking.guest}</TableCell>
                      <TableCell>{booking.room}</TableCell>
                      <TableCell>
                        <Badge
                          variant={booking.status === 'PENDING' ? 'outline' : booking.status === 'CANCELLED' ? 'destructive' : 'secondary'}
                        >
                          {formatBookingStatus(booking.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground">
                      No bookings have been created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy by hotel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {roomsQuery.isLoading || hotelsQuery.isLoading ? (
              <p>Loading occupancy data...</p>
            ) : occupancySegments.length ? (
              occupancySegments.map((segment) => (
                <div key={segment.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span>{segment.label}</span>
                    <span className="text-foreground">
                      {segment.value}% ({segment.occupied}/{segment.total})
                    </span>
                  </div>
                  <Progress value={segment.value} />
                </div>
              ))
            ) : (
              <p>No room inventory data is available yet.</p>
            )}
            <SectionHeader
              title="Notes"
              description={occupancyNote}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
