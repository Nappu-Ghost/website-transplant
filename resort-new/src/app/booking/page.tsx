import { BookingForm } from '@/components/booking-form';

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold text-foreground">Plan Your Stay</h1>
        <p className="text-base text-muted-foreground">
          Share your preferred dates and room style. We will respond with a curated plan.
        </p>
      </div>
      <BookingForm />
    </div>
  );
}
