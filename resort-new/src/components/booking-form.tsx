"use client";

import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { FormCard, useNotify } from '@/components/shared';

const formSchema = z
  .object({
    fullName: z.string().min(2, 'Enter a full name.'),
    phone: z.string().min(7, 'Enter a contact number.'),
    checkIn: z.string().min(1, 'Select a check-in date.'),
    checkOut: z.string().min(1, 'Select a check-out date.'),
    guests: z.coerce.number().min(1, 'At least one guest.').max(10, 'Up to 10 guests.'),
    roomType: z.string().min(1, 'Select a room type.'),
    activitySelections: z.array(z.string()).optional(),
    email: z.string().email('Enter a valid email address.'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.checkIn).getTime();
      const end = new Date(data.checkOut).getTime();
      return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
    },
    {
      message: 'Check-out must be after check-in.',
      path: ['checkOut'],
    }
  );

export type BookingFormValues = z.infer<typeof formSchema>;

type BookingOption = {
  id: number;
  name: string;
};

export interface BookingFormProps {
  isLoading?: boolean;
  isSubmitting?: boolean;
  defaultValues?: Partial<BookingFormValues>;
  onEstimateChange?: (values: Partial<BookingFormValues>) => void;
  roomOptions?: BookingOption[];
  activityOptions?: BookingOption[];
  onCreateBooking?: (values: BookingFormValues) => Promise<{ id?: number } | null>;
  onBookingCreated?: (payload: {
    id?: number;
    confirmationCode: string;
    values: BookingFormValues;
  }) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function BookingForm({
  isLoading,
  isSubmitting: isSubmittingExternal,
  defaultValues,
  onEstimateChange,
  roomOptions,
  activityOptions,
  onCreateBooking,
  onBookingCreated,
}: BookingFormProps) {
  const [preview, setPreview] = useState<BookingFormValues | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  const lastEstimateRef = useRef<Partial<BookingFormValues> | null>(null);
  const notify = useNotify();
  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid, isSubmitted, dirtyFields },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      guests: 2,
      roomType: 'Lagoon Suite',
      activitySelections: [],
      ...defaultValues,
    },
  });

  const [
    watchedFullName,
    watchedPhone,
    watchedCheckIn,
    watchedCheckOut,
    watchedGuests,
    watchedRoomType,
    watchedActivitySelections,
    watchedEmail,
    watchedNotes,
  ] = useWatch({
    control,
    name: [
      'fullName',
      'phone',
      'checkIn',
      'checkOut',
      'guests',
      'roomType',
      'activitySelections',
      'email',
      'notes',
    ],
  });

  useEffect(() => {
    if (onEstimateChange) {
      const nextEstimate: Partial<BookingFormValues> = {
        fullName: watchedFullName,
        phone: watchedPhone,
        checkIn: watchedCheckIn,
        checkOut: watchedCheckOut,
        guests: watchedGuests,
        roomType: watchedRoomType,
        activitySelections: watchedActivitySelections,
        email: watchedEmail,
        notes: watchedNotes,
      };

      const previous = lastEstimateRef.current;
      const hasChanged =
        !previous ||
        Object.keys(nextEstimate).some(
          (key) => previous[key as keyof BookingFormValues] !== nextEstimate[key as keyof BookingFormValues]
        );

      if (hasChanged) {
        lastEstimateRef.current = nextEstimate;
        onEstimateChange(nextEstimate);
      }
    }
  }, [
    onEstimateChange,
    watchedFullName,
    watchedPhone,
    watchedCheckIn,
    watchedCheckOut,
    watchedGuests,
    watchedRoomType,
    watchedActivitySelections,
    watchedEmail,
    watchedNotes,
  ]);

  const hasErrors = isSubmitted && Object.keys(errors).length > 0;

  const onSubmit = async (data: BookingFormValues) => {
    setPreview(data);
    try {
      const result = onCreateBooking ? await onCreateBooking(data) : null;
      const bookingId = result?.id;
      const nextCode = bookingId
        ? `ALR-${String(bookingId).padStart(6, '0')}`
        : `ALR-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmationCode(nextCode);
      onBookingCreated?.({ id: bookingId, confirmationCode: nextCode, values: data });
      notify.success({
        title: 'Request received',
        description: 'Our concierge will confirm availability shortly.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create booking right now.';
      notify.error({
        title: 'Booking failed',
        description: message,
      });
    }
  };

  const resolvedRoomOptions = roomOptions?.length
    ? roomOptions
    : [
      { id: 1, name: 'Lagoon Suite' },
      { id: 2, name: 'Garden Villa' },
      { id: 3, name: 'Harbor Residence' },
    ];

  const resolvedActivityOptions = activityOptions?.length
    ? activityOptions
    : [
      { id: 1, name: 'Reef Snorkeling' },
      { id: 2, name: 'Sunset Chef Table' },
      { id: 3, name: 'Lagoon Meditation' },
      { id: 4, name: 'Lagoon Kayak Circuit' },
      { id: 5, name: 'Family Lagoon Walk' },
      { id: 6, name: 'Island Discovery' },
    ];

  useEffect(() => {
    const nextDefaultRoom = defaultValues?.roomType;
    if (nextDefaultRoom && !dirtyFields.roomType) {
      setValue('roomType', nextDefaultRoom, { shouldValidate: true });
    }
  }, [defaultValues?.roomType, dirtyFields.roomType, setValue]);

  useEffect(() => {
    const nextActivities = defaultValues?.activitySelections;
    if (Array.isArray(nextActivities) && !dirtyFields.activitySelections) {
      setValue('activitySelections', nextActivities, { shouldValidate: true });
    }
  }, [defaultValues?.activitySelections, dirtyFields.activitySelections, setValue]);

  useEffect(() => {
    if (!resolvedRoomOptions.length) return;
    const current = getValues('roomType');
    const isValidRoom = resolvedRoomOptions.some((opt) => opt.name === current);
    if (!isValidRoom && !dirtyFields.roomType) {
      setValue('roomType', resolvedRoomOptions[0].name, { shouldValidate: true });
    }
  }, [resolvedRoomOptions, dirtyFields.roomType, getValues, setValue]);

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
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
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <FormCard title="Plan your stay" className="border-border/70 bg-card/90 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {hasErrors && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please review the highlighted fields before continuing.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" placeholder="Avery Jordan" aria-invalid={!!errors.fullName} {...register('fullName')} />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" aria-invalid={!!errors.phone} {...register('phone')} />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <Input id="checkIn" type="date" aria-invalid={!!errors.checkIn} {...register('checkIn')} />
                {errors.checkIn && (
                  <p className="text-xs text-destructive">{errors.checkIn.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <Input id="checkOut" type="date" aria-invalid={!!errors.checkOut} {...register('checkOut')} />
                {errors.checkOut && (
                  <p className="text-xs text-destructive">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guests">Guests</Label>
                <Input id="guests" type="number" min={1} max={10} aria-invalid={!!errors.guests} {...register('guests')} />
                {errors.guests && (
                  <p className="text-xs text-destructive">{errors.guests.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Room type</Label>
                <Controller
                  control={control}
                  name="roomType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger aria-invalid={!!errors.roomType}>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolvedRoomOptions.map((option) => (
                          <SelectItem key={option.id} value={option.name}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.roomType && (
                  <p className="text-xs text-destructive">{errors.roomType.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Activities</Label>
                <Controller
                  control={control}
                  name="activitySelections"
                  render={({ field }) => {
                    const value = Array.isArray(field.value) ? field.value : [];
                    const toggle = (name: string) => {
                      if (value.includes(name)) {
                        field.onChange(value.filter((item) => item !== name));
                        return;
                      }
                      field.onChange([...value, name]);
                    };

                    return (
                      <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {resolvedActivityOptions.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-secondary/60"
                            >
                              <Checkbox
                                checked={value.includes(option.name)}
                                onCheckedChange={() => toggle(option.name)}
                              />
                              <span className="text-foreground">{option.name}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Selected: {value.length ? value.join(', ') : 'None'}
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact email</Label>
                <Input id="email" type="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Special requests</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Dietary needs, arrival times, or other details."
                aria-invalid={!!errors.notes}
                {...register('notes')}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!isValid || isSubmitting || isSubmittingExternal}
            >
              {isSubmitting || isSubmittingExternal ? 'Submitting...' : 'Request availability'}
            </Button>
          </form>
        </FormCard>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <FormCard
          title="Preview"
          className="border-border/70 bg-secondary/60"
          contentClassName="space-y-4 text-sm text-muted-foreground"
        >
          {preview ? (
            <div className="space-y-3">
              {confirmationCode && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Confirmation</p>
                  <p className="text-foreground">{confirmationCode}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Guest</p>
                <p className="text-foreground">{preview.fullName}</p>
                <p className="text-sm text-muted-foreground">{preview.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Dates</p>
                <p className="text-foreground">
                  {preview.checkIn} → {preview.checkOut}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Guests</p>
                <p className="text-foreground">{preview.guests}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Room</p>
                <p className="text-foreground">{preview.roomType}</p>
              </div>
              {Array.isArray(preview.activitySelections) && preview.activitySelections.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Activities</p>
                  <p className="text-foreground">{preview.activitySelections.join(', ')}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Contact</p>
                <p className="text-foreground">{preview.email}</p>
              </div>
              {preview.notes && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Notes</p>
                  <p className="text-foreground">{preview.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p>
              Complete the form to preview your request details. We will follow
              up with availability and tailored suggestions.
            </p>
          )}
        </FormCard>
      </motion.div>
    </div>
  );
}
