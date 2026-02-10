import type { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  icon: ElementType;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="h-full border-border/70 bg-card/80 transition duration-300 hover:-translate-y-2 hover:shadow-lg">
      <CardHeader className="items-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-foreground/80">{description}</CardContent>
    </Card>
  );
}
