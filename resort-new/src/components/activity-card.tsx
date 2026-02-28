"use client";

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { demoImageUrl } from '@/lib/demo-images';
import { resolveImageUrl } from '@/lib/asset-url';

export interface ActivityCardProps {
  demoMode?: boolean;
  name: string;
  activityType: string;
  price: number;
  duration?: string;
  capacity?: number;
  imageUrl?: string;
  isPremium?: boolean;
  href?: string;
  isLoading?: boolean;
  action?: ReactNode;
}

export function ActivityCard({
  demoMode,
  name,
  activityType,
  price,
  duration,
  capacity,
  imageUrl,
  isPremium,
  href = '/booking',
  isLoading,
  action,
}: ActivityCardProps) {
  const candidateImageUrl = imageUrl || (demoMode ? demoImageUrl('activity', name) : undefined);
  const resolvedImageUrl = resolveImageUrl(candidateImageUrl);
        if (isLoading) {
    return (
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
        <Skeleton className="aspect-[4/3] w-full" />
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
        <div className="relative aspect-[4/3] w-full">
          {resolvedImageUrl ? (
            <Image
              src={resolvedImageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.25),_hsl(var(--background))_60%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Badge variant="secondary">{activityType}</Badge>
            {isPremium && <Badge>Premium</Badge>}
          </div>
        </div>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">${price}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">per guest</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {duration && <span>{duration}</span>}
            {capacity && <span>{capacity} guests max</span>}
          </div>
          {action ?? (
            <Button asChild variant="outline" className="w-full">
              <Link href={href}>Reserve activity</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
