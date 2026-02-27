"use client";

import { useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { PageHeader, PageShell } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookingService, paymentService } from '@/lib/api-service';
import { useNotify } from '@/components/shared';

function safeNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

export default function BookingReceiptPage() {
  const searchParams = useSearchParams();
  const notify = useNotify();
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const bookingId = safeNumber(searchParams.get('bookingId'));
  const paymentId = safeNumber(searchParams.get('paymentId'));
  const currency = searchParams.get('currency') || 'USD';
  const confirmationCode = searchParams.get('code') || (bookingId ? `ALR-${String(bookingId).padStart(6, '0')}` : '');

  const subtotal = safeNumber(searchParams.get('subtotal')) ?? 0;
  const taxes = safeNumber(searchParams.get('taxes')) ?? 0;
  const serviceFee = safeNumber(searchParams.get('serviceFee')) ?? 0;
  const total = safeNumber(searchParams.get('total')) ?? Math.max(0, subtotal + taxes + serviceFee);

  const bookingQuery = useQuery({
    queryKey: ['booking', bookingId],
    enabled: Boolean(bookingId),
    queryFn: () => bookingService.getById(String(bookingId)),
  });

  const paymentQuery = useQuery({
    queryKey: ['payment', paymentId],
    enabled: Boolean(paymentId),
    queryFn: () => paymentService.getById(String(paymentId)),
  });

  const receiptDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!receiptRef.current) return;
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Receipt ${confirmationCode}</title></head><body>${receiptRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${confirmationCode || 'booking'}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify.success({ title: 'Downloaded', description: 'Receipt saved as an HTML file.' });
  };

  return (
    <PageShell>
      <PageHeader
        title="Receipt"
        description="Keep this page for your records. You can screenshot it or download it."
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={handlePrint} variant="secondary">Print / Save as PDF</Button>
        <Button onClick={handleDownloadHtml}>Download receipt</Button>
      </div>

      <div className="mt-6" ref={receiptRef}>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-foreground">Azure Lagoon Resort</CardTitle>
            <div className="text-sm text-muted-foreground">
              <div>Receipt date: <span className="text-foreground">{receiptDate}</span></div>
              {confirmationCode && (
                <div>Confirmation: <span className="text-foreground">{confirmationCode}</span></div>
              )}
              {bookingId ? (
                <div>Booking ID: <span className="text-foreground">{bookingId}</span></div>
              ) : (
                <div className="text-destructive">Missing booking id.</div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Guest</div>
                {bookingQuery.isLoading ? (
                  <div className="mt-2 text-muted-foreground">Loading…</div>
                ) : bookingQuery.data ? (
                  <div className="mt-2 space-y-1">
                    <div className="text-foreground">{bookingQuery.data.user?.name || bookingQuery.data.user?.email || 'Guest'}</div>
                    <div className="text-muted-foreground">{bookingQuery.data.user?.email}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-muted-foreground">Guest details unavailable.</div>
                )}
              </div>

              <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payment</div>
                {paymentQuery.isLoading ? (
                  <div className="mt-2 text-muted-foreground">Loading…</div>
                ) : paymentQuery.data ? (
                  <div className="mt-2 space-y-1">
                    <div>Method: <span className="text-foreground">{paymentQuery.data.method}</span></div>
                    <div>Status: <span className="text-foreground">{paymentQuery.data.status}</span></div>
                    <div>Amount: <span className="text-foreground">{formatMoney(paymentQuery.data.currency || currency, Number(paymentQuery.data.amount || total))}</span></div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1">
                    <div>Method: <span className="text-foreground">Pay on arrival</span></div>
                    <div>Status: <span className="text-foreground">PENDING</span></div>
                    <div>Amount: <span className="text-foreground">{formatMoney(currency, total)}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Charges</div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stay subtotal</span>
                  <span className="text-foreground">{formatMoney(currency, subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="text-foreground">{formatMoney(currency, taxes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="text-foreground">{formatMoney(currency, serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/70 pt-3 text-base font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatMoney(currency, total)}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Pay on arrival: no online charge was processed. Bring this receipt to check-in.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/20 p-4 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Download tip</div>
              <div className="mt-1">Use “Print / Save as PDF” to save a PDF, or “Download receipt” to save an HTML copy.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
