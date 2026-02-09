"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityCardProps {
  name: string;
  activityType: string;
  price: number;
  duration?: string;
  capacity?: number;
  imageUrl?: string;
  isPremium?: boolean;
  href?: string;
}

export function ActivityCard({
  name,
  activityType,
  price,
  duration,
  capacity,
  imageUrl,
  isPremium,
  href = '/booking',
}: ActivityCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
        <div className="relative aspect-[4/3] w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
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
          <Button asChild variant="outline" className="w-full">
            <Link href={href}>Reserve activity</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
