"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Stepper, { Step } from '@/components/stepper';
import { PaymentSection } from '@/components/payment-section';
import { PageHeader, PageShell, SectionHeader, useNotify } from '@/components/shared';
import { activityService, bookingService, hotelService, roomService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { useAuth } from '@/hooks/auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface HotelOption {
  id: number;
  name: string;
  location: string;
  imageUrl?: string | null;
}

interface RoomOption {
  id: number;
  hotelId: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  available?: boolean;
  isPremium?: boolean;
  imageUrl?: string | null;
}

interface ActivityOption {
  id: number;
  name: string;
  price: number;
  isPremium?: boolean;
  imageUrl?: string | null;
}

interface BookingDraft {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  hotelId?: number;
  roomId?: number;
  activityIds: number[];
}

const HOTEL_FALLBACK_IMAGES = [
  '/images/gallery/hotels/hotel1.jpg',
  '/images/gallery/hotels/hotel2.jpg',
  '/images/gallery/hotels/hotel3.jpg',
];

const emptyDraft: BookingDraft = {
  fullName: '',
  phone: '',
  email: '',
  notes: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  hotelId: undefined,
  roomId: undefined,
  activityIds: [],
};

export default function BookingPage() {
  const { user } = useAuth();
  const notify = useNotify();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [createdBooking, setCreatedBooking] = useState<{ id?: number; confirmationCode?: string }>({});

  const selectedRoomId = searchParams.get('roomId');
  const selectedActivityId = searchParams.get('activityId');

  const hotelsQuery = useQuery<HotelOption[]>({
    queryKey: ['hotels', 'booking'],
    queryFn: () => hotelService.list(),
  });

  const roomsQuery = useQuery<RoomOption[]>({
    queryKey: ['rooms', 'booking'],
    queryFn: () => roomService.list(),
  });

  const activitiesQuery = useQuery<ActivityOption[]>({
    queryKey: ['activities', 'booking'],
    queryFn: () => activityService.list(),
  });

  const createBookingMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => bookingService.create(payload),
  });

  const rooms = useMemo(() => {
    return (roomsQuery.data ?? []).filter((room) => room.available !== false);
  }, [roomsQuery.data]);

  const hotelsById = useMemo(() => {
    return new Map((hotelsQuery.data ?? []).map((hotel) => [hotel.id, hotel]));
  }, [hotelsQuery.data]);

  const roomsByHotel = useMemo(() => {
    const grouped = new Map<number, RoomOption[]>();
    rooms.forEach((room) => {
      if (!grouped.has(room.hotelId)) grouped.set(room.hotelId, []);
      grouped.get(room.hotelId)?.push(room);
    });
    return grouped;
  }, [rooms]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === draft.roomId),
    [rooms, draft.roomId],
  );

  const selectedHotel = useMemo(() => {
    const hotelId = draft.hotelId ?? selectedRoom?.hotelId;
    return hotelId ? hotelsById.get(hotelId) : undefined;
  }, [draft.hotelId, selectedRoom?.hotelId, hotelsById]);

  const selectedActivities = useMemo(() => {
    const ids = new Set(draft.activityIds);
    return (activitiesQuery.data ?? []).filter((activity) => ids.has(activity.id));
  }, [activitiesQuery.data, draft.activityIds]);

  const nights = useMemo(() => {
    if (!draft.checkIn || !draft.checkOut) return 0;
    const start = new Date(draft.checkIn);
    const end = new Date(draft.checkOut);
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }, [draft.checkIn, draft.checkOut]);

  const staySubtotal = (selectedRoom?.price ?? 0) * nights;
  const activitySubtotal = selectedActivities.reduce((sum, activity) => sum + activity.price, 0) * Math.max(1, draft.guests || 1);
  const subtotal = staySubtotal + activitySubtotal;
  const taxes = subtotal * 0.12;
  const serviceFee = subtotal > 0 ? 45 : 0;

  const updateDraft = (patch: Partial<BookingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (createdBooking.id) {
      setCreatedBooking({});
    }
  };

  const toggleActivity = (id: number) => {
    const hasId = draft.activityIds.includes(id);
    const nextIds = hasId
      ? draft.activityIds.filter((value) => value !== id)
      : [...draft.activityIds, id];
    updateDraft({ activityIds: nextIds });
  };

  useEffect(() => {
    if (user?.name || user?.email) {
      setDraft((prev) => ({
        ...prev,
        fullName: prev.fullName || user?.name || '',
        email: prev.email || user?.email || '',
      }));
    }
  }, [user?.name, user?.email]);

  useEffect(() => {
    if (!selectedRoomId) return;
    const roomId = Number(selectedRoomId);
    if (!Number.isFinite(roomId)) return;
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;
    setDraft((prev) => ({
      ...prev,
      hotelId: prev.hotelId ?? room.hotelId,
      roomId: prev.roomId ?? room.id,
    }));
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    if (!selectedActivityId) return;
    const activityId = Number(selectedActivityId);
    if (!Number.isFinite(activityId)) return;
    if (!(activitiesQuery.data ?? []).some((item) => item.id === activityId)) return;
    setDraft((prev) => {
      if (prev.activityIds.includes(activityId)) return prev;
      return { ...prev, activityIds: [...prev.activityIds, activityId] };
    });
  }, [activitiesQuery.data, selectedActivityId]);

  useEffect(() => {
    if (!draft.roomId || !rooms.length) return;
    const exists = rooms.some((room) => room.id === draft.roomId);
    if (exists) return;
    updateDraft({ roomId: undefined });
  }, [rooms, draft.roomId]);

  const validateStep = (step: number) => {
    if (step === 1) {
      return (
        draft.fullName.trim().length >= 2 &&
        draft.phone.trim().length >= 7 &&
        /.+@.+\..+/.test(draft.email)
      );
    }

    if (step === 2) {
      return Boolean(
        draft.hotelId &&
          draft.roomId &&
          draft.checkIn &&
          draft.checkOut &&
          nights > 0 &&
          draft.guests >= 1,
      );
    }

    if (step === 3) {
      return true;
    }

    if (step === 4) {
      return Boolean(createdBooking.id);
    }

    return true;
  };

  const handleCreateBooking = async () => {
    if (!user?.id) {
      notify.error({
        title: 'Sign in required',
        description: 'Please sign in before creating a booking.',
      });
      return;
    }

    if (!selectedRoom) {
      notify.error({
        title: 'Missing room',
        description: 'Please select a room before continuing.',
      });
      return;
    }

    if (!draft.checkIn || !draft.checkOut || nights <= 0) {
      notify.error({
        title: 'Invalid dates',
        description: 'Check-out must be after check-in.',
      });
      return;
    }

    try {
      const payload = {
        userId: Number(user.id),
        numberOfGuests: Number(draft.guests || 1),
        totalPrice: subtotal,
        startDate: new Date(draft.checkIn).toISOString(),
        endDate: new Date(draft.checkOut).toISOString(),
        isPremium: Boolean(selectedRoom.isPremium),
        roomIds: [selectedRoom.id],
        activityIds: draft.activityIds,
      };

      const response = await createBookingMutation.mutateAsync(payload);
      const bookingId = response?.id;
      if (!bookingId) {
        throw new Error('Booking created without an id.');
      }

      setCreatedBooking({
        id: bookingId,
        confirmationCode: `ALR-${String(bookingId).padStart(6, '0')}`,
      });

      notify.success({
        title: 'Booking saved',
        description: 'Your booking details were saved. Continue to payment.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create booking right now.';
      notify.error({ title: 'Booking failed', description: message });
    }
  };

  const isLoading = hotelsQuery.isLoading || roomsQuery.isLoading || activitiesQuery.isLoading;

  return (
    <PageShell>
      <PageHeader
        title="Plan Your Stay"
        description="Build your trip step by step, review it, then proceed to payment."
      />

      <Stepper
        initialStep={1}
        onStepChange={setCurrentStep}
        canProceed={validateStep}
        nextButtonText="Next"
        backButtonText="Previous"
        hideNextOnLastStep
      >
        <Step>
          <SectionHeader
            title="Guest details"
            description="Tell us who this booking is for."
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={draft.fullName}
                onChange={(event) => updateDraft({ fullName: event.target.value })}
                placeholder="Avery Jordan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={draft.phone}
                onChange={(event) => updateDraft({ phone: event.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={draft.email}
                onChange={(event) => updateDraft({ email: event.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Special requests</Label>
              <Textarea
                id="notes"
                rows={4}
                value={draft.notes}
                onChange={(event) => updateDraft({ notes: event.target.value })}
                placeholder="Dietary preferences, arrival notes, or celebration details."
              />
            </div>
          </div>
        </Step>

        <Step>
          <SectionHeader
            title="Stay details"
            description="Pick your dates, hotel, and room."
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in</Label>
              <Input
                id="checkIn"
                type="date"
                value={draft.checkIn}
                onChange={(event) => updateDraft({ checkIn: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out</Label>
              <Input
                id="checkOut"
                type="date"
                value={draft.checkOut}
                onChange={(event) => updateDraft({ checkOut: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={10}
                value={draft.guests}
                onChange={(event) => updateDraft({ guests: Number(event.target.value || 1) })}
              />
            </div>
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground">
              <p>Nights: <span className="text-foreground">{nights}</span></p>
              <p>Current room subtotal: <span className="text-foreground">${staySubtotal.toFixed(2)}</span></p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-foreground">Choose a hotel</p>
            <div className="grid gap-4 md:grid-cols-2">
              {(hotelsQuery.data ?? []).map((hotel) => {
                const selected = draft.hotelId === hotel.id;
                const image =
                  resolveImageUrl(hotel.imageUrl) ||
                  HOTEL_FALLBACK_IMAGES[hotel.id % HOTEL_FALLBACK_IMAGES.length];
                return (
                  <button
                    key={`hotel-${hotel.id}`}
                    type="button"
                    onClick={() => updateDraft({ hotelId: hotel.id, roomId: undefined })}
                    className={`overflow-hidden rounded-xl border text-left transition ${
                      selected
                        ? 'border-primary shadow-md'
                        : 'border-border/70 hover:border-primary/40'
                    }`}
                  >
                    <img src={image} alt={hotel.name} className="h-36 w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="space-y-1 p-4">
                      <p className="font-semibold text-foreground">{hotel.name}</p>
                      <p className="text-sm text-muted-foreground">{hotel.location}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {draft.hotelId ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-foreground">Choose a room type</p>
              <div className="grid gap-4 md:grid-cols-2">
                {(roomsByHotel.get(draft.hotelId) ?? []).map((room) => {
                  const selected = draft.roomId === room.id;
                  const image =
                    resolveImageUrl(room.imageUrl) ||
                    resolveImageUrl(selectedHotel?.imageUrl) ||
                    HOTEL_FALLBACK_IMAGES[(draft.hotelId ?? 0) % HOTEL_FALLBACK_IMAGES.length];
                  return (
                    <button
                      key={`room-${room.id}`}
                      type="button"
                      onClick={() => updateDraft({ roomId: room.id })}
                      className={`overflow-hidden rounded-xl border text-left transition ${
                        selected
                          ? 'border-primary shadow-md'
                          : 'border-border/70 hover:border-primary/40'
                      }`}
                    >
                      <img src={image} alt={room.name} className="h-32 w-full object-cover" referrerPolicy="no-referrer" />
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{room.name}</p>
                            <p className="text-xs text-muted-foreground">{room.type}</p>
                          </div>
                          {room.isPremium ? <Badge>Premium</Badge> : null}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{room.capacity} guests</span>
                          <span>${room.price}/night</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </Step>

        <Step>
          <SectionHeader
            title="Activities"
            description="Add any experiences you want to include."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(activitiesQuery.data ?? []).map((activity) => {
              const selected = draft.activityIds.includes(activity.id);
              return (
                <label
                  key={`activity-${activity.id}`}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 transition ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/70 hover:bg-secondary/40'
                  }`}
                >
                  <Checkbox checked={selected} onCheckedChange={() => toggleActivity(activity.id)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">${activity.price} per guest</p>
                  </div>
                  {activity.isPremium ? <Badge variant="outline">Premium</Badge> : null}
                </label>
              );
            })}
          </div>
        </Step>

        <Step>
          <SectionHeader
            title="Review and create booking"
            description="Confirm your selections before payment."
          />
          <Card className="mt-4 border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Trip summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Guest:</span> {draft.fullName || '-'}</p>
              <p><span className="text-muted-foreground">Contact:</span> {draft.email || '-'} · {draft.phone || '-'}</p>
              <p><span className="text-muted-foreground">Dates:</span> {draft.checkIn || '-'} {'->'} {draft.checkOut || '-'} ({nights} nights)</p>
              <p><span className="text-muted-foreground">Guests:</span> {draft.guests}</p>
              <p><span className="text-muted-foreground">Hotel:</span> {selectedHotel?.name || '-'}</p>
              <p><span className="text-muted-foreground">Room:</span> {selectedRoom?.name || '-'}</p>
              <p><span className="text-muted-foreground">Activities:</span> {selectedActivities.length ? selectedActivities.map((a) => a.name).join(', ') : 'None'}</p>
              <div className="rounded-lg border border-border/70 bg-secondary/30 p-3">
                <p>Stay subtotal: ${staySubtotal.toFixed(2)}</p>
                <p>Activities subtotal: ${activitySubtotal.toFixed(2)}</p>
                <p className="font-semibold text-foreground">Current subtotal: ${subtotal.toFixed(2)}</p>
              </div>

              {createdBooking.id ? (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-700">
                  Booking created: {createdBooking.confirmationCode}
                </div>
              ) : null}

              <Button
                type="button"
                onClick={handleCreateBooking}
                disabled={createBookingMutation.isPending || !selectedRoom || nights <= 0 || !user?.id}
              >
                {createBookingMutation.isPending ? 'Creating booking...' : 'Create booking and continue'}
              </Button>

              {!user?.id ? (
                <p className="text-xs text-destructive">You need to sign in before creating a booking.</p>
              ) : null}
            </CardContent>
          </Card>
        </Step>

        <Step>
          <SectionHeader
            title="Payment"
            description="Finalize your transaction after booking is saved."
          />
          <div className="mt-4">
            <PaymentSection
              subtotal={subtotal || 0}
              taxes={taxes || 0}
              serviceFee={serviceFee}
              bookingId={createdBooking.id}
              confirmationCode={createdBooking.confirmationCode}
            />
          </div>
        </Step>
      </Stepper>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading booking options...</p>
      ) : null}

      {currentStep === 4 && !createdBooking.id ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Create your booking in this step to unlock payment.
        </p>
      ) : null}
    </PageShell>
  );
}
