"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentSectionProps {
  subtotal?: number;
  taxes?: number;
  serviceFee?: number;
  currency?: string;
  depositNote?: string;
  isLoading?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function PaymentSection({
  subtotal = 960,
  taxes = 110,
  serviceFee = 45,
  currency = 'USD',
  depositNote = 'We only capture a 20% deposit today. Balance due on arrival.',
  isLoading,
}: PaymentSectionProps) {
  const [method, setMethod] = useState<'card' | 'bank' | 'arrival'>('card');

  const total = useMemo(() => subtotal + taxes + serviceFee, [subtotal, taxes, serviceFee]);

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Payment method</Label>
              <RadioGroup value={method} onValueChange={(value) => setMethod(value as typeof method)}>
                <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-4 py-3">
                  <RadioGroupItem value="card" id="payment-card" />
                  <Label htmlFor="payment-card" className="text-sm">Credit or debit card</Label>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-4 py-3">
                  <RadioGroupItem value="bank" id="payment-bank" />
                  <Label htmlFor="payment-bank" className="text-sm">Bank transfer</Label>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-4 py-3">
                  <RadioGroupItem value="arrival" id="payment-arrival" />
                  <Label htmlFor="payment-arrival" className="text-sm">Pay on arrival</Label>
                </div>
              </RadioGroup>
            </div>

            {method === 'card' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="card-name">Cardholder name</Label>
                  <Input id="card-name" placeholder="Alex Morgan" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-exp">Expiry</Label>
                  <Input id="card-exp" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input id="card-cvc" placeholder="123" />
                </div>
              </div>
            )}

            {method === 'bank' && (
              <div className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                We will send transfer instructions after confirming availability.
              </div>
            )}

            {method === 'arrival' && (
              <div className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                Reserve now and pay during check-in at the resort.
              </div>
            )}

            <Button size="lg" className="w-full">Confirm payment method</Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Stay subtotal</span>
                <span className="text-foreground">{currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taxes</span>
                <span className="text-foreground">{currency} {taxes.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span className="text-foreground">{currency} {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 pt-3 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{currency} {total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Deposit</p>
            <p className="text-sm text-foreground">{depositNote}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
