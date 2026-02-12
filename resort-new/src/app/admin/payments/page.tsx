"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModalDialog, PageHeader, SectionHeader } from '@/components/shared';
import { paymentService } from '@/lib/api-service';

type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH';

interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: string | null;
  createdAt?: string;
}

interface PaymentDraft {
  bookingId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
}

const paymentTone: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  AUTHORIZED: 'bg-sky-100 text-sky-700',
  CAPTURED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
};

const emptyDraft: PaymentDraft = {
  bookingId: '',
  amount: '',
  currency: 'USD',
  status: 'CAPTURED',
  method: 'CARD',
};

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PaymentDraft>(emptyDraft);

  const paymentsQuery = useQuery<Payment[]>({
    queryKey: ['payments', 'admin'],
    queryFn: () => paymentService.list(),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => paymentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'admin'] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      paymentService.update(String(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'admin'] });
    },
  });

  const metrics = useMemo(() => {
    const payments = paymentsQuery.data ?? [];
    const depositsToday = payments
      .filter((payment) => payment.status === 'CAPTURED')
      .slice(0, 5)
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingBalance = payments
      .filter((payment) => payment.status === 'PENDING')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const refunds = payments
      .filter((payment) => payment.status === 'REFUNDED')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return [
      { label: 'Deposits today', value: formatCurrency(depositsToday) },
      { label: 'Pending balance', value: formatCurrency(pendingBalance) },
      { label: 'Refunds', value: formatCurrency(refunds) },
    ];
  }, [paymentsQuery.data]);

  const handleSave = () => {
    if (!draft.bookingId || !draft.amount) return;
    const payload = {
      bookingId: Number(draft.bookingId),
      amount: Number(draft.amount),
      currency: draft.currency,
      status: draft.status,
      method: draft.method,
      provider: 'simulated',
      providerReference: `SIM-${Date.now()}`,
      paidAt: draft.status === 'CAPTURED' ? new Date().toISOString() : undefined,
    };
    createPaymentMutation.mutate(payload);
  };

  const handleUpdateStatus = (paymentId: number, status: PaymentStatus) => {
    updatePaymentMutation.mutate({
      id: paymentId,
      payload: {
        status,
        paidAt: status === 'CAPTURED' ? new Date().toISOString() : undefined,
      },
    });
  };

  const isSaving = createPaymentMutation.isPending || updatePaymentMutation.isPending;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Track deposits, balance due, and simulated reconciliations."
      />

      {paymentsQuery.isError ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Unable to load payments</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {paymentsQuery.error instanceof Error
              ? paymentsQuery.error.message
              : 'Please try again shortly.'}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
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
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Recent transactions</CardTitle>
          <ModalDialog
            title="Record a payment"
            description="Simulate a payment for a booking."
            trigger={<Button variant="outline">Add payment</Button>}
            footer={
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Record payment'}
              </Button>
            }
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment-booking">Booking ID</Label>
                  <Input
                    id="payment-booking"
                    type="number"
                    min={1}
                    value={draft.bookingId}
                    onChange={(event) => setDraft((current) => ({ ...current, bookingId: event.target.value }))}
                    placeholder="1001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min={0}
                    value={draft.amount}
                    onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="450"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={draft.currency}
                    onValueChange={(value) => setDraft((current) => ({ ...current, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value) => setDraft((current) => ({ ...current, status: value as PaymentStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                      <SelectItem value="CAPTURED">Captured</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select
                    value={draft.method}
                    onValueChange={(value) => setDraft((current) => ({ ...current, method: value as PaymentMethod }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ModalDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : (paymentsQuery.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                (paymentsQuery.data ?? []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-xs text-muted-foreground">PM-{payment.id}</TableCell>
                    <TableCell>Booking #{payment.bookingId}</TableCell>
                    <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell>
                      <Badge className={paymentTone[payment.status]}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(payment.paidAt ?? payment.createdAt)}</TableCell>
                    <TableCell>
                      <Select
                        value={payment.status}
                        onValueChange={(value) => handleUpdateStatus(payment.id, value as PaymentStatus)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Update" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                          <SelectItem value="CAPTURED">Captured</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                          <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
