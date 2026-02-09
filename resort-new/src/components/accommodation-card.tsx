"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AccommodationCardProps {
  name: string;
  location: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  imageUrl?: string;
  rating?: number;
  isPremium?: boolean;
  tags?: string[];
  href?: string;
}

export function AccommodationCard({
  name,
  location,
  pricePerNight,
  capacity,
  description,
  imageUrl,
  rating,
  isPremium,
  tags,
  href = '/booking',
}: AccommodationCardProps) {
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
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_hsl(var(--accent)/0.35),_hsl(var(--background))_60%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            {isPremium && <Badge>Premium</Badge>}
            {rating !== undefined && (
              <Badge variant="secondary">{rating.toFixed(1)} Rating</Badge>
            )}
          </div>
        </div>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">${pricePerNight}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">per night</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Up to {capacity} guests</span>
            {tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={href}>View details</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
