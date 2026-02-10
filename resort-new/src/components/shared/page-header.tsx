import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-10 flex flex-col gap-3', className)}>
      <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
      {description ? (
        <p className="text-base text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
