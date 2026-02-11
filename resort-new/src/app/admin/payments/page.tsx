import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, SectionHeader } from '@/components/shared';

const paymentMetrics = [
  { label: 'Deposits today', value: '$4,980' },
  { label: 'Pending balance', value: '$12,240' },
  { label: 'Refunds', value: '$640' },
];

const payments = [
  { id: 'PM-2019', guest: 'Avery Jordan', amount: '$960', status: 'Paid', date: 'Today' },
  { id: 'PM-2020', guest: 'Noah Lee', amount: '$420', status: 'Pending', date: 'Today' },
  { id: 'PM-2021', guest: 'Maya Ortiz', amount: '$1,240', status: 'Paid', date: 'Yesterday' },
  { id: 'PM-2022', guest: 'Zoey Carter', amount: '$320', status: 'Refunded', date: 'Feb 08' },
];

const paymentTone: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Refunded: 'bg-rose-100 text-rose-700',
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Track deposits, balance due, and reconciliations."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {paymentMetrics.map((metric) => (
          <Card key={metric.label} className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-foreground">
              {metric.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-xs text-muted-foreground">{payment.id}</TableCell>
                  <TableCell>{payment.guest}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>
                    <Badge className={paymentTone[payment.status]}>{payment.status}</Badge>
                  </TableCell>
                  <TableCell>{payment.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SectionHeader
        title="Revenue notes"
        description="Deposits cover 68% of projected revenue for the next 30 days."
      />
    </div>
  );
}
