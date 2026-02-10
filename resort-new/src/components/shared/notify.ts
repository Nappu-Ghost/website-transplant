"use client";

import { useToast } from '@/hooks/use-toast';

interface NotifyOptions {
  title: string;
  description?: string;
}

export function useNotify() {
  const { toast } = useToast();

  return {
    success: ({ title, description }: NotifyOptions) =>
      toast({ title, description }),
    error: ({ title, description }: NotifyOptions) =>
      toast({ title, description, variant: 'destructive' }),
  };
}
