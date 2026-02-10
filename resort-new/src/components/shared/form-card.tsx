import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function FormCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormCardProps) {
  return (
    <Card className={cn('border-border/70 bg-card/90 shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
