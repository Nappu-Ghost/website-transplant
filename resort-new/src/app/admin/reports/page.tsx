"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { adminService, bookingService, hotelService, roomService } from '@/lib/api-service';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiBookingStatus = 'PENDING' | 'PAYMENT_COMPLETED' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

interface ApiPayment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paidAt?: string;
}

interface ApiBooking {
  id: number;
  status: ApiBookingStatus;
  totalPrice?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  cancellationRequestStatus?: string;
  user?: { name?: string | null; email?: string | null };
  rooms?: Array<{ room?: { name?: string | null; type?: string | null } | null }>;
  payments?: ApiPayment[];
}

interface HotelSummary { id: number; name: string; }
interface RoomSummary { id: number; hotelId: number; available?: boolean; }
interface AdminOverview {
  totals: { users: number; bookings: number; hotels: number; rooms: number; activities: number; payments: number; };
  revenueCollected: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const formatLabel = (s: string) =>
  s.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const formatMonth = (d: string) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ACTIVE_STATUSES: ApiBookingStatus[] = ['PENDING', 'PAYMENT_COMPLETED', 'CONFIRMED', 'CHECKED_IN'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const overviewQuery = useQuery<AdminOverview>({ queryKey: ['admin', 'overview'], queryFn: () => adminService.getOverview() });
  const bookingsQuery = useQuery<ApiBooking[]>({ queryKey: ['admin', 'reports-bookings'], queryFn: () => bookingService.list() });
  const hotelsQuery = useQuery<HotelSummary[]>({ queryKey: ['admin', 'reports-hotels'], queryFn: () => hotelService.list() });
  const roomsQuery = useQuery<RoomSummary[]>({ queryKey: ['admin', 'reports-rooms'], queryFn: () => roomService.list() });

  const bookings = bookingsQuery.data ?? [];
  const hotels = hotelsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];

  // Revenue by payment method (CAPTURED payments only)
  const revenueByMethod = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach(b => {
      (b.payments ?? []).forEach(p => {
        if (p.status === 'CAPTURED') {
          map.set(p.method, (map.get(p.method) ?? 0) + p.amount);
        }
      });
    });
    const total = [...map.values()].reduce((a, b) => a + b, 0);
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([method, amount]) => ({ method, amount, pct: total > 0 ? Math.round((amount / total) * 100) : 0 }));
  }, [bookings]);

  // Bookings by status
  const bookingsByStatus = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach(b => map.set(b.status, (map.get(b.status) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([status, count]) => ({ status, count }));
  }, [bookings]);

  // Monthly revenue (from booking createdAt + captured payments)
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach(b => {
      const month = b.createdAt ? formatMonth(b.createdAt) : null;
      if (!month) return;
      (b.payments ?? []).forEach(p => {
        if (p.status === 'CAPTURED') {
          map.set(month, (map.get(month) ?? 0) + p.amount);
        }
      });
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, revenue]) => ({ month, revenue }));
  }, [bookings]);

  const maxMonthlyRevenue = useMemo(() => Math.max(...monthlyRevenue.map(m => m.revenue), 1), [monthlyRevenue]);

  // Occupancy by hotel
  const activeRoomIds = useMemo(() => {
    const now = Date.now();
    return new Set(
      bookings.flatMap(b => {
        if (!ACTIVE_STATUSES.includes(b.status)) return [];
        const end = b.endDate ? new Date(b.endDate).getTime() : NaN;
        if (Number.isFinite(end) && end < now) return [];
        return (b.rooms ?? []).map(r => r.room?.name).filter(Boolean);
      })
    );
  }, [bookings]);

  const hotelNamesById = useMemo(() => new Map(hotels.map(h => [h.id, h.name])), [hotels]);

  const occupancyByHotel = useMemo(() => {
    const map = new Map<string, { total: number; occupied: number }>();
    rooms.forEach(r => {
      const label = hotelNamesById.get(r.hotelId) ?? `Hotel ${r.hotelId}`;
      const cur = map.get(label) ?? { total: 0, occupied: 0 };
      cur.total += 1;
      if (activeRoomIds.has(r.id as any)) cur.occupied += 1;
      map.set(label, cur);
    });
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v, pct: v.total > 0 ? Math.round((v.occupied / v.total) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct);
  }, [rooms, activeRoomIds, hotelNamesById]);

  // Pending cancellations
  const pendingCancellations = useMemo(
    () => bookings.filter(b => b.cancellationRequestStatus === 'PENDING').length,
    [bookings]
  );

  const totals = overviewQuery.data?.totals;
  const revenueCollected = overviewQuery.data?.revenueCollected ?? 0;

  // ─── Export helpers ──────────────────────────────────────────────────────────

  const handlePrint = () => window.print();

  const exportBookingsCSV = () => {
    exportCSV(
      ['ID', 'Guest', 'Email', 'Room', 'Status', 'Check-in', 'Check-out', 'Total Price', 'Payment Method', 'Payment Status', 'Paid'],
      bookings.map(b => {
        const payment = b.payments?.[0];
        return [
          b.id,
          b.user?.name ?? '',
          b.user?.email ?? '',
          b.rooms?.[0]?.room?.name ?? '',
          formatLabel(b.status),
          formatDate(b.startDate),
          formatDate(b.endDate),
          b.totalPrice ?? 0,
          payment ? formatLabel(payment.method) : '',
          payment ? formatLabel(payment.status) : '',
          payment?.amount ?? 0,
        ];
      }),
      'bookings-report.csv'
    );
  };

  const exportRevenueByMethodCSV = () => {
    exportCSV(
      ['Payment Method', 'Revenue', '% of Total'],
      revenueByMethod.map(r => [formatLabel(r.method), r.amount.toFixed(2), `${r.pct}%`]),
      'revenue-by-method.csv'
    );
  };

  const exportMonthlyRevenueCSV = () => {
    exportCSV(
      ['Month', 'Revenue'],
      monthlyRevenue.map(m => [m.month, m.revenue.toFixed(2)]),
      'monthly-revenue.csv'
    );
  };

  const exportOccupancyCSV = () => {
    exportCSV(
      ['Hotel', 'Total Rooms', 'Occupied', 'Occupancy %'],
      occupancyByHotel.map(o => [o.name, o.total, o.occupied, `${o.pct}%`]),
      'occupancy-report.csv'
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Print-only title */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Resort Reports</h1>
        <p className="text-sm text-muted-foreground">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="space-y-8 print:space-y-6">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Reports</h1>
            <p className="mt-1 text-base text-muted-foreground">Live data — bookings, revenue, occupancy, and payment breakdowns.</p>
          </div>
          <div className="flex gap-2 print:hidden shrink-0">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={exportBookingsCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export bookings
            </Button>
          </div>
        </div>

        {/* KPI summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total bookings', value: totals ? String(totals.bookings) : '—' },
            { label: 'Revenue collected', value: overviewQuery.data ? formatCurrency(revenueCollected) : '—' },
            { label: 'Pending cancellations', value: bookingsQuery.isSuccess ? String(pendingCancellations) : '—' },
            { label: 'Total guests', value: totals ? String(totals.users) : '—' },
          ].map(kpi => (
            <Card key={kpi.label} className="border-border/70 bg-card/90">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue & Monthly */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue by payment method */}
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Revenue by payment method</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs print:hidden" onClick={exportRevenueByMethodCSV}>
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {revenueByMethod.length === 0 ? (
                <p className="text-sm text-muted-foreground">No captured payments yet.</p>
              ) : (
                revenueByMethod.map(r => (
                  <div key={r.method} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{formatLabel(r.method)}</span>
                      <span className="font-medium">{formatCurrency(r.amount)} <span className="text-muted-foreground text-xs">({r.pct}%)</span></span>
                    </div>
                    <Progress value={r.pct} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Monthly revenue */}
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Monthly revenue</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs print:hidden" onClick={exportMonthlyRevenueCSV}>
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthlyRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground">No revenue data available yet.</p>
              ) : (
                monthlyRevenue.map(m => (
                  <div key={m.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{m.month}</span>
                      <span className="font-medium">{formatCurrency(m.revenue)}</span>
                    </div>
                    <Progress value={Math.round((m.revenue / maxMonthlyRevenue) * 100)} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bookings by status & Occupancy */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bookings by status */}
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-base">Bookings by status</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsByStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsByStatus.map(s => (
                      <TableRow key={s.status}>
                        <TableCell>{formatLabel(s.status)}</TableCell>
                        <TableCell className="text-right font-medium">{s.count}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{bookings.length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Occupancy by hotel */}
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Occupancy by hotel</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs print:hidden" onClick={exportOccupancyCSV}>
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {occupancyByHotel.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hotel data available.</p>
              ) : (
                occupancyByHotel.map(o => (
                  <div key={o.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{o.name}</span>
                      <span className="font-medium">{o.pct}% <span className="text-muted-foreground text-xs">({o.occupied}/{o.total})</span></span>
                    </div>
                    <Progress value={o.pct} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full bookings table */}
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All bookings</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs print:hidden" onClick={exportBookingsCSV}>
              <Download className="mr-1 h-3 w-3" />
              CSV
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {bookingsQuery.isLoading ? 'Loading…' : 'No bookings found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  [...bookings]
                    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
                    .map(b => {
                      const payment = b.payments?.[0];
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs">ALR-{String(b.id).padStart(6, '0')}</TableCell>
                          <TableCell>{b.user?.name || b.user?.email || '—'}</TableCell>
                          <TableCell>{b.rooms?.[0]?.room?.name ?? '—'}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(b.startDate)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(b.endDate)}</TableCell>
                          <TableCell>{formatLabel(b.status)}</TableCell>
                          <TableCell>
                            {payment ? `${formatLabel(payment.method)} / ${formatLabel(payment.status)}` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {b.totalPrice != null ? formatCurrency(b.totalPrice) : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
