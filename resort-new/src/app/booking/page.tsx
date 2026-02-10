"use client";

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingForm } from '@/components/booking-form';
import { PaymentSection } from '@/components/payment-section';
import { PageHeader, PageShell, SectionHeader } from '@/components/shared';

const roomRates: Record<string, number> = {
  'Lagoon Suite': 480,
  'Garden Villa': 280,
  'Harbor Residence': 620,
  'Ocean Breeze Suite': 360,
  'Palm Grove Villa': 320,
  'Harbor Loft': 520,
};

const activityRates: Record<string, number> = {
  'Reef Snorkeling': 120,
  'Sunset Chef Table': 180,
  'Lagoon Meditation': 95,
  'Lagoon Kayak Circuit': 110,
  'Family Lagoon Walk': 80,
  'Island Discovery': 210,
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [estimate, setEstimate] = useState<Record<string, string | number>>({});

  const selectedRoom = searchParams.get('room') ?? '';
  const selectedActivity = searchParams.get('activity') ?? '';

  const nights = useMemo(() => {
    const checkIn = estimate.checkIn ? new Date(String(estimate.checkIn)) : null;
    const checkOut = estimate.checkOut ? new Date(String(estimate.checkOut)) : null;
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }, [estimate.checkIn, estimate.checkOut]);

  const guests = typeof estimate.guests === 'number' ? estimate.guests : Number(estimate.guests || 0);
  const nightlyRate = roomRates[String(estimate.roomType || selectedRoom)] ?? 0;
  const activityRate = activityRates[String(estimate.activitySelection || selectedActivity)] ?? 0;
  const staySubtotal = nights > 0 ? nights * nightlyRate : 0;
  const activitySubtotal = activityRate > 0 ? activityRate * Math.max(1, guests || 1) : 0;
  const subtotal = staySubtotal + activitySubtotal;
  const taxes = subtotal * 0.12;
  const serviceFee = subtotal > 0 ? 45 : 0;

  const handleEstimateChange = useCallback((values: Record<string, string | number>) => {
    setEstimate(values);
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Plan Your Stay"
        description="Share your preferred dates and room style. We will respond with a curated plan."
      />
      <BookingForm
        defaultValues={{
          ...(selectedRoom ? { roomType: selectedRoom } : {}),
          ...(selectedActivity ? { activitySelection: selectedActivity } : {}),
        }}
        onEstimateChange={handleEstimateChange}
      />
      <div className="mt-16 space-y-4">
        <SectionHeader
          title="Payment preview"
          description="Select your preferred payment method. Final totals will update after availability is confirmed."
        />
        <PaymentSection
          subtotal={subtotal || 0}
          taxes={taxes || 0}
          serviceFee={serviceFee}
        />
      </div>
    </PageShell>
  );
}
