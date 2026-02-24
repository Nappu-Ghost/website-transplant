"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SectionHeader } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';

const createId = () => `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type HomepageAd = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  badge?: string | null;
};

const createEmptyAd = (): HomepageAd => ({
  id: createId(),
  title: '',
  description: '',
  imageUrl: '',
  ctaText: '',
  ctaUrl: '',
  badge: '',
});

export default function AdminCustomizeHomePage() {
  const { toast } = useToast();
  const [ads, setAds] = useState<HomepageAd[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'homepage'],
    queryFn: () => adminService.getHomepageSettings(),
  });

  useEffect(() => {
    if (data?.ads) {
      setAds(data.ads);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: { ads: HomepageAd[] }) => adminService.updateHomepageSettings(payload),
    onSuccess: (payload) => {
      setAds(payload?.ads ?? ads);
      toast({ title: 'Homepage updated', description: 'Your advertisement section is live.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Unable to save changes right now.',
        variant: 'destructive',
      });
    },
  });

  const handleAdd = () => {
    setAds((prev) => [...prev, createEmptyAd()]);
  };

  const handleRemove = (id: string) => {
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  const updateField = (id: string, field: keyof HomepageAd, value: string) => {
    setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, [field]: value } : ad)));
  };

  const isSaving = mutation.isPending;
  const isDisabled = isSaving || isLoading;

  const hasAds = useMemo(() => ads.length > 0, [ads.length]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customize Home Page"
        description="Update the advertisement tiles featured on the resort homepage."
      />
      <SectionHeader
        title="Homepage advertisements"
        description="Add promos for events, island perks, or ferry upgrades."
      />

      <div className="grid gap-6">
        {!hasAds ? (
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">No advertisements yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Add your first ad to highlight new events or offers.
            </CardContent>
          </Card>
        ) : (
          ads.map((ad, index) => (
            <Card key={ad.id} className="border-border/70 bg-card/90">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Advertisement {index + 1}</CardTitle>
                  <p className="text-xs text-muted-foreground">ID: {ad.id}</p>
                </div>
                <Button variant="outline" onClick={() => handleRemove(ad.id)}>
                  Remove
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${ad.id}`}>Title</Label>
                    <Input
                      id={`title-${ad.id}`}
                      value={ad.title}
                      onChange={(event) => updateField(ad.id, 'title', event.target.value)}
                      placeholder="Lagoon Dining Week"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`badge-${ad.id}`}>Badge</Label>
                    <Input
                      id={`badge-${ad.id}`}
                      value={ad.badge ?? ''}
                      onChange={(event) => updateField(ad.id, 'badge', event.target.value)}
                      placeholder="Theme park"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${ad.id}`}>Description</Label>
                    <Textarea
                      id={`description-${ad.id}`}
                      value={ad.description}
                      onChange={(event) => updateField(ad.id, 'description', event.target.value)}
                      placeholder="Chef collaborations, oceanfront tastings, and a closing night under lanterns."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`image-${ad.id}`}>Image URL</Label>
                    <Input
                      id={`image-${ad.id}`}
                      value={ad.imageUrl ?? ''}
                      onChange={(event) => updateField(ad.id, 'imageUrl', event.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cta-${ad.id}`}>CTA text</Label>
                    <Input
                      id={`cta-${ad.id}`}
                      value={ad.ctaText ?? ''}
                      onChange={(event) => updateField(ad.id, 'ctaText', event.target.value)}
                      placeholder="Reserve a table"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cta-url-${ad.id}`}>CTA URL</Label>
                    <Input
                      id={`cta-url-${ad.id}`}
                      value={ad.ctaUrl ?? ''}
                      onChange={(event) => updateField(ad.id, 'ctaUrl', event.target.value)}
                      placeholder="/booking"
                    />
                  </div>
                  {ad.imageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-border/60">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title || 'Advertisement preview'}
                        className="h-36 w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleAdd} disabled={isDisabled}>
          Add advertisement
        </Button>
        <Button onClick={() => mutation.mutate({ ads })} disabled={isDisabled}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
