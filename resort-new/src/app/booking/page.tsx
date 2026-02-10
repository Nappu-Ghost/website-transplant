import { BookingForm } from '@/components/booking-form';
import { PaymentSection } from '@/components/payment-section';
import { PageHeader, PageShell, SectionHeader } from '@/components/shared';

export default function BookingPage() {
  return (
    <PageShell>
      <PageHeader
        title="Plan Your Stay"
        description="Share your preferred dates and room style. We will respond with a curated plan."
      />
      <BookingForm />
      <div className="mt-16 space-y-4">
        <SectionHeader
          title="Payment preview"
          description="Select your preferred payment method. Final totals will update after availability is confirmed."
        />
        <PaymentSection />
      </div>
    </PageShell>
  );
}
