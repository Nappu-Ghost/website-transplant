import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, SectionHeader } from '@/components/shared';

const metrics = [
  { label: 'Occupancy', value: '82%', delta: '+6% week' },
  { label: 'Upcoming arrivals', value: '18', delta: 'Next 7 days' },
  { label: 'Active experiences', value: '12', delta: 'Today' },
  { label: 'Deposit collected', value: '$18.4k', delta: 'This week' },
];

const recentBookings = [
  { code: 'ALR-512483', guest: 'Avery Jordan', room: 'Lagoon Suite 201', status: 'Confirmed' },
  { code: 'ALR-439112', guest: 'Noah Lee', room: 'Ocean Breeze Suite', status: 'Pending' },
  { code: 'ALR-398210', guest: 'Maya Ortiz', room: 'Garden Villa 102', status: 'Arriving' },
  { code: 'ALR-512900', guest: 'Eli Parker', room: 'Harbor Residence', status: 'Confirmed' },
];

const occupancySegments = [
  { label: 'Suites', value: 78 },
  { label: 'Villas', value: 85 },
  { label: 'Residences', value: 69 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Operational snapshot, arrivals, and performance indicators."
      />

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
                {recentBookings.map((booking) => (
                  <TableRow key={booking.code}>
                    <TableCell className="text-xs text-muted-foreground">{booking.code}</TableCell>
                    <TableCell>{booking.guest}</TableCell>
                    <TableCell>{booking.room}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'Pending' ? 'outline' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {occupancySegments.map((segment) => (
              <div key={segment.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{segment.label}</span>
                  <span className="text-foreground">{segment.value}%</span>
                </div>
                <Progress value={segment.value} />
              </div>
            ))}
            <SectionHeader
              title="Notes"
              description="Villa demand is trending higher for the next two weeks."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
