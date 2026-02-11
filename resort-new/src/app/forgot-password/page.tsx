"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormCard, PageHeader, PageShell, useNotify } from '@/components/shared';

const formSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

type ForgotPasswordValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const notify = useNotify();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    notify.success({
      title: 'Reset link sent',
      description: 'Check your email for password reset instructions.',
    });
  };

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title="Reset your password"
        description="We will email you a secure link to reset your account password."
      />
      <FormCard title="Password reset" description="Enter the email associated with your account.">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Remembered your password? <Link href="/login" className="text-primary underline-offset-4 hover:underline">Back to login</Link>
        </p>
      </FormCard>
    </PageShell>
  );
}
