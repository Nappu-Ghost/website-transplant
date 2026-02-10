"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormCard, PageHeader, PageShell, SectionHeader, useNotify } from '@/components/shared';

const formSchema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email.'),
  subject: z.string().min(3, 'Add a subject.'),
  message: z.string().min(10, 'Share a short message.'),
});

type ContactFormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const notify = useNotify();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    notify.success({
      title: 'Message sent',
      description: 'Our concierge will reply within 24 hours.',
    });
    reset();
  };

  return (
    <PageShell>
      <PageHeader
        title="Contact"
        description="Reach the Azure Lagoon team for reservations, itineraries, or special requests."
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <FormCard
          title="Send a request"
          description="Tell us how we can help. We will respond with a tailored plan."
        >
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Avery Jordan" aria-invalid={!!errors.name} {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Reservation request" aria-invalid={!!errors.subject} {...register('subject')} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                placeholder="Share your preferred dates, guests, and any celebrations."
                aria-invalid={!!errors.message}
                {...register('message')}
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send message'}
            </Button>
          </form>
        </FormCard>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Concierge details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Address</p>
                <p className="text-foreground">Azure Lagoon Island, South Pacific</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
                <p className="text-foreground">+1 (555) 222-4800</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                <p className="text-foreground">concierge@azurelagoon.com</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hours</p>
                <p className="text-foreground">Daily, 7:00 AM - 10:00 PM</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-secondary/60">
            <CardHeader>
              <CardTitle className="text-lg">Find us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <SectionHeader
                title="Arrival map"
                description="Private ferry and air transfers are coordinated by the concierge."
              />
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border/70">
                <iframe
                  title="Azure Lagoon map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.5%2C-1.2%2C73.4%2C0.1&layer=mapnik"
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
              <p>
                We will share precise transfer coordinates once your stay is confirmed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
