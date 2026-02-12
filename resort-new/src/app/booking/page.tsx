"use client";

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BookingForm, type BookingFormValues } from '@/components/booking-form';
import { PaymentSection } from '@/components/payment-section';
import { PageHeader, PageShell, SectionHeader } from '@/components/shared';
import { activityService, bookingService, roomService } from '@/lib/api-service';
import { useAuth } from '@/hooks/auth/useAuth';

interface RoomOption {
  id: number;
  name: string;
  price: number;
  isPremium?: boolean;
  available?: boolean;
}

interface ActivityOption {
  id: number;
  name: string;
  price: number;
}

const fallbackRoomRates: Record<string, number> = {
  'Lagoon Suite': 480,
  'Garden Villa': 280,
  'Harbor Residence': 620,
  'Ocean Breeze Suite': 360,
  'Palm Grove Villa': 320,
  'Harbor Loft': 520,
};

const fallbackActivityRates: Record<string, number> = {
  'Reef Snorkeling': 120,
  'Sunset Chef Table': 180,
  'Lagoon Meditation': 95,
  'Lagoon Kayak Circuit': 110,
  'Family Lagoon Walk': 80,
  'Island Discovery': 210,
};

export default function BookingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [estimate, setEstimate] = useState<Record<string, string | number>>({});

  const selectedRoom = searchParams.get('room') ?? '';
  const selectedActivity = searchParams.get('activity') ?? '';

  const roomsQuery = useQuery<RoomOption[]>({
    queryKey: ['rooms', 'booking'],
    queryFn: () => roomService.list(),
  });

  const activitiesQuery = useQuery<ActivityOption[]>({
    queryKey: ['activities', 'booking'],
    queryFn: () => activityService.list(),
  });

  const roomOptions = useMemo(() => {
    return (roomsQuery.data ?? [])
      .filter((room) => room.available !== false)
      .map((room) => ({
        id: room.id,
        name: room.name,
        price: room.price,
        isPremium: room.isPremium,
      }));
  }, [roomsQuery.data]);

  const activityOptions = useMemo(() => {
    return (activitiesQuery.data ?? []).map((activity) => ({
      id: activity.id,
      name: activity.name,
      price: activity.price,
    }));
  }, [activitiesQuery.data]);

  const roomRates = useMemo(() => {
    if (roomOptions.length > 0) {
      return roomOptions.reduce((acc, room) => {
        acc[room.name] = room.price;
        return acc;
      }, {} as Record<string, number>);
    }
    return fallbackRoomRates;
  }, [roomOptions]);

  const activityRates = useMemo(() => {
    if (activityOptions.length > 0) {
      return activityOptions.reduce((acc, activity) => {
        acc[activity.name] = activity.price;
        return acc;
      }, {} as Record<string, number>);
    }
    return fallbackActivityRates;
  }, [activityOptions]);

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

  const createBookingMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => bookingService.create(payload),
  });

  const handleCreateBooking = useCallback(async (values: BookingFormValues) => {
    if (!user?.id) {
      throw new Error('Please sign in to request a booking.');
    }

    const selectedRoomOption = roomOptions.find((room) => room.name === values.roomType);
    if (!selectedRoomOption) {
      throw new Error('Selected room is not available.');
    }

    const hasActivity = values.activitySelection && values.activitySelection !== 'none';
    const selectedActivityOption = hasActivity
      ? activityOptions.find((activity) => activity.name === values.activitySelection)
      : undefined;

    if (hasActivity && !selectedActivityOption) {
      throw new Error('Selected activity is not available.');
    }

    const checkInDate = new Date(values.checkIn);
    const checkOutDate = new Date(values.checkOut);
    const nights = checkOutDate.getTime() > checkInDate.getTime()
      ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const guests = Number(values.guests || 1);
    const roomRate = roomRates[selectedRoomOption.name] ?? selectedRoomOption.price ?? 0;
    const activityRate = selectedActivityOption
      ? activityRates[selectedActivityOption.name] ?? selectedActivityOption.price ?? 0
      : 0;
    const staySubtotal = nights > 0 ? nights * roomRate : 0;
    const activitySubtotal = activityRate > 0 ? activityRate * Math.max(1, guests) : 0;
    const totalPrice = staySubtotal + activitySubtotal;

    const payload = {
      user_id: Number(user.id),
      number_of_guests: guests,
      total_price: totalPrice,
      start_date: checkInDate.toISOString(),
      end_date: checkOutDate.toISOString(),
      is_premium: Boolean(selectedRoomOption.isPremium),
      room_ids: [selectedRoomOption.id],
      activity_ids: selectedActivityOption ? [selectedActivityOption.id] : undefined,
    };

    const response = await createBookingMutation.mutateAsync(payload);
    return { id: response?.id };
  }, [activityOptions, activityRates, createBookingMutation, roomOptions, roomRates, user?.id]);

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
        isLoading={roomsQuery.isLoading || activitiesQuery.isLoading}
        isSubmitting={createBookingMutation.isPending}
        roomOptions={roomOptions}
        activityOptions={activityOptions}
        onCreateBooking={handleCreateBooking}
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
