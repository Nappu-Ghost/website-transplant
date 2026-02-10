"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { FormCard, useNotify } from '@/components/shared';

const formSchema = z
  .object({
    checkIn: z.string().min(1, 'Select a check-in date.'),
    checkOut: z.string().min(1, 'Select a check-out date.'),
    guests: z.coerce.number().min(1, 'At least one guest.').max(10, 'Up to 10 guests.'),
    roomType: z.string().min(1, 'Select a room type.'),
    activityFocus: z.string().optional(),
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

type BookingFormValues = z.infer<typeof formSchema>;

export interface BookingFormProps {
  isLoading?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function BookingForm({ isLoading }: BookingFormProps) {
  const [preview, setPreview] = useState<BookingFormValues | null>(null);
  const notify = useNotify();
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      guests: 2,
      roomType: 'Lagoon Suite',
      activityFocus: 'Wellness',
    },
  });

  const hasErrors = isSubmitted && Object.keys(errors).length > 0;

  const onSubmit = async (data: BookingFormValues) => {
    setPreview(data);
    notify.success({
      title: 'Request received',
      description: 'Our concierge will confirm availability shortly.',
    });
  };

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
                        <SelectItem value="Lagoon Suite">Lagoon Suite</SelectItem>
                        <SelectItem value="Garden Villa">Garden Villa</SelectItem>
                        <SelectItem value="Harbor Residence">Harbor Residence</SelectItem>
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
                <Label>Activity focus</Label>
                <Controller
                  control={control}
                  name="activityFocus"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger aria-invalid={!!errors.activityFocus}>
                        <SelectValue placeholder="Select a focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wellness">Wellness</SelectItem>
                        <SelectItem value="Adventure">Adventure</SelectItem>
                        <SelectItem value="Dining">Dining</SelectItem>
                        <SelectItem value="Family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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

            <Button type="submit" size="lg" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Request availability'}
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
              {preview.activityFocus && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Focus</p>
                  <p className="text-foreground">{preview.activityFocus}</p>
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
