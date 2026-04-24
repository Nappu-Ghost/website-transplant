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
import { defaultHomepageConfig, type HomepageConfig, type HomepageHeroCard, type HomepageListItem, type HomepageAd } from '@/lib/homepage-defaults';

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyAd = (): HomepageAd => ({
  id: createId('ad'),
  title: '',
  description: '',
  imageUrl: '',
  ctaText: '',
  ctaUrl: '',
  badge: '',
});

const createHeroCard = (): HomepageHeroCard => ({
  id: createId('hero'),
  title: '',
  detail: '',
  tag: '',
});

const createListItem = (prefix: string): HomepageListItem => ({
  id: createId(prefix),
  title: '',
  description: '',
});

export default function AdminCustomizeHomePage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'homepage'],
    queryFn: () => adminService.getHomepageSettings(),
  });

  useEffect(() => {
    if (data) {
      setConfig(data as HomepageConfig);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: HomepageConfig) => adminService.updateHomepageSettings(payload),
    onSuccess: (payload) => {
      setConfig(payload as HomepageConfig);
      setLastSavedAt(new Date().toLocaleTimeString());
      toast({ title: 'Homepage updated', description: 'Your homepage updates are live.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Unable to save changes right now.',
        variant: 'destructive',
      });
    },
  });

  const updateHero = (field: keyof HomepageConfig['hero'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateHeroCta = (key: 'ctaPrimary' | 'ctaSecondary' | 'ctaTertiary', field: 'label' | 'url', value: string) => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [key]: { ...prev.hero[key], [field]: value },
      },
    }));
  };

  const updateHeroCard = (id: string, field: keyof HomepageHeroCard, value: string) => {
    setConfig((prev) => ({
      ...prev,
      heroCards: prev.heroCards.map((card) => (card.id === id ? { ...card, [field]: value } : card)),
    }));
  };

  const addHeroCard = () => {
    setConfig((prev) => ({ ...prev, heroCards: [...prev.heroCards, createHeroCard()] }));
  };

  const removeHeroCard = (id: string) => {
    setConfig((prev) => ({ ...prev, heroCards: prev.heroCards.filter((card) => card.id !== id) }));
  };

  const updateTwoIsland = (field: 'title' | 'description', value: string) => {
    setConfig((prev) => ({
      ...prev,
      twoIsland: { ...prev.twoIsland, [field]: value },
    }));
  };

  const updateTwoIslandCard = (
    key: 'resort' | 'park',
    field: 'title' | 'description' | 'imageUrl',
    value: string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      twoIsland: {
        ...prev.twoIsland,
        [key]: { ...prev.twoIsland[key], [field]: value },
      },
    }));
  };

  const updateFerryTitle = (value: string) => {
    setConfig((prev) => ({ ...prev, ferry: { ...prev.ferry, title: value } }));
  };

  const updateFerryItem = (id: string, field: keyof HomepageListItem, value: string) => {
    setConfig((prev) => ({
      ...prev,
      ferry: {
        ...prev.ferry,
        items: prev.ferry.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const addFerryItem = () => {
    setConfig((prev) => ({
      ...prev,
      ferry: { ...prev.ferry, items: [...prev.ferry.items, createListItem('ferry')] },
    }));
  };

  const removeFerryItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      ferry: { ...prev.ferry, items: prev.ferry.items.filter((item) => item.id !== id) },
    }));
  };

  const updateFerryCta = (field: 'label' | 'url', value: string) => {
    setConfig((prev) => ({
      ...prev,
      ferry: {
        ...prev.ferry,
        cta: { ...prev.ferry.cta, [field]: value },
      },
    }));
  };

  const updateDayPlannerTitle = (value: string) => {
    setConfig((prev) => ({ ...prev, dayPlanner: { ...prev.dayPlanner, title: value } }));
  };

  const updateDayPlannerItem = (id: string, field: keyof HomepageListItem, value: string) => {
    setConfig((prev) => ({
      ...prev,
      dayPlanner: {
        ...prev.dayPlanner,
        items: prev.dayPlanner.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const addDayPlannerItem = () => {
    setConfig((prev) => ({
      ...prev,
      dayPlanner: { ...prev.dayPlanner, items: [...prev.dayPlanner.items, createListItem('planner')] },
    }));
  };

  const removeDayPlannerItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      dayPlanner: { ...prev.dayPlanner, items: prev.dayPlanner.items.filter((item) => item.id !== id) },
    }));
  };

  const updateDayPlannerCta = (field: 'label' | 'url', value: string) => {
    setConfig((prev) => ({
      ...prev,
      dayPlanner: {
        ...prev.dayPlanner,
        cta: { ...prev.dayPlanner.cta, [field]: value },
      },
    }));
  };

  const updateAdField = (id: string, field: keyof HomepageAd, value: string) => {
    setConfig((prev) => ({
      ...prev,
      ads: prev.ads.map((ad) => (ad.id === id ? { ...ad, [field]: value } : ad)),
    }));
  };

  const addAd = () => {
    setConfig((prev) => ({ ...prev, ads: [...prev.ads, createEmptyAd()] }));
  };

  const removeAd = (id: string) => {
    setConfig((prev) => ({ ...prev, ads: prev.ads.filter((ad) => ad.id !== id) }));
  };

  const isSaving = mutation.isPending;
  const isDisabled = isSaving || isLoading;

  const hasAds = useMemo(() => config.ads.length > 0, [config.ads.length]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customize Home Page"
        description="Update hero, highlights, and promotional sections for the homepage."
      />
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="text-sm text-muted-foreground">
          {lastSavedAt ? `Last saved at ${lastSavedAt}` : 'Make edits, then save to publish.'}
        </div>
        <Button onClick={() => mutation.mutate(config)} disabled={isDisabled}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Hero section</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hero-kicker">Kicker</Label>
            <Input
              id="hero-kicker"
              value={config.hero.kicker ?? ''}
              onChange={(event) => updateHero('kicker', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              value={config.hero.title ?? ''}
              onChange={(event) => updateHero('title', event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hero-description">Description</Label>
            <Textarea
              id="hero-description"
              value={config.hero.description ?? ''}
              onChange={(event) => updateHero('description', event.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-primary">Primary CTA label</Label>
            <Input
              id="hero-cta-primary"
              value={config.hero.ctaPrimary?.label ?? ''}
              onChange={(event) => updateHeroCta('ctaPrimary', 'label', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-primary-url">Primary CTA URL</Label>
            <Input
              id="hero-cta-primary-url"
              value={config.hero.ctaPrimary?.url ?? ''}
              onChange={(event) => updateHeroCta('ctaPrimary', 'url', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-secondary">Secondary CTA label</Label>
            <Input
              id="hero-cta-secondary"
              value={config.hero.ctaSecondary?.label ?? ''}
              onChange={(event) => updateHeroCta('ctaSecondary', 'label', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-secondary-url">Secondary CTA URL</Label>
            <Input
              id="hero-cta-secondary-url"
              value={config.hero.ctaSecondary?.url ?? ''}
              onChange={(event) => updateHeroCta('ctaSecondary', 'url', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-tertiary">Tertiary CTA label</Label>
            <Input
              id="hero-cta-tertiary"
              value={config.hero.ctaTertiary?.label ?? ''}
              onChange={(event) => updateHeroCta('ctaTertiary', 'label', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-cta-tertiary-url">Tertiary CTA URL</Label>
            <Input
              id="hero-cta-tertiary-url"
              value={config.hero.ctaTertiary?.url ?? ''}
              onChange={(event) => updateHeroCta('ctaTertiary', 'url', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Hero cards</CardTitle>
          <Button variant="outline" onClick={addHeroCard} disabled={isDisabled}>
            Add hero card
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {config.heroCards.map((card) => (
            <div key={card.id} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={card.title} onChange={(event) => updateHeroCard(card.id, 'title', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tag</Label>
                <Input value={card.tag ?? ''} onChange={(event) => updateHeroCard(card.id, 'tag', event.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Description</Label>
                <Textarea value={card.detail} onChange={(event) => updateHeroCard(card.id, 'detail', event.target.value)} rows={2} />
              </div>
              <div>
                <Button variant="outline" onClick={() => removeHeroCard(card.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Two-island overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Section title</Label>
            <Input value={config.twoIsland.title ?? ''} onChange={(event) => updateTwoIsland('title', event.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Section description</Label>
            <Textarea value={config.twoIsland.description ?? ''} onChange={(event) => updateTwoIsland('description', event.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Resort card title</Label>
            <Input value={config.twoIsland.resort.title} onChange={(event) => updateTwoIslandCard('resort', 'title', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Azure Land card title</Label>
            <Input value={config.twoIsland.park.title} onChange={(event) => updateTwoIslandCard('park', 'title', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Resort card description</Label>
            <Textarea value={config.twoIsland.resort.description} onChange={(event) => updateTwoIslandCard('resort', 'description', event.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Azure Land card description</Label>
            <Textarea value={config.twoIsland.park.description} onChange={(event) => updateTwoIslandCard('park', 'description', event.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Resort image URL</Label>
            <Input value={config.twoIsland.resort.imageUrl ?? ''} onChange={(event) => updateTwoIslandCard('resort', 'imageUrl', event.target.value)} />
            {config.twoIsland.resort.imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <img
                  src={config.twoIsland.resort.imageUrl}
                  alt={config.twoIsland.resort.title || 'Resort image preview'}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Azure Land image URL</Label>
            <Input value={config.twoIsland.park.imageUrl ?? ''} onChange={(event) => updateTwoIslandCard('park', 'imageUrl', event.target.value)} />
            {config.twoIsland.park.imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <img
                  src={config.twoIsland.park.imageUrl}
                  alt={config.twoIsland.park.title || 'Azure Land image preview'}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Ferry section</CardTitle>
          <Button variant="outline" onClick={addFerryItem} disabled={isDisabled}>
            Add ferry item
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Section title</Label>
            <Input value={config.ferry.title ?? ''} onChange={(event) => updateFerryTitle(event.target.value)} />
          </div>
          {config.ferry.items.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={item.title} onChange={(event) => updateFerryItem(item.id, 'title', event.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={item.description} onChange={(event) => updateFerryItem(item.id, 'description', event.target.value)} rows={2} />
              </div>
              <div>
                <Button variant="outline" onClick={() => removeFerryItem(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA label</Label>
              <Input value={config.ferry.cta?.label ?? ''} onChange={(event) => updateFerryCta('label', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input value={config.ferry.cta?.url ?? ''} onChange={(event) => updateFerryCta('url', event.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

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
          config.ads.map((ad, index) => (
            <Card key={ad.id} className="border-border/70 bg-card/90">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Advertisement {index + 1}</CardTitle>
                  <p className="text-xs text-muted-foreground">ID: {ad.id}</p>
                </div>
                <Button variant="outline" onClick={() => removeAd(ad.id)}>
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
                      onChange={(event) => updateAdField(ad.id, 'title', event.target.value)}
                      placeholder="Lagoon Dining Week"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`badge-${ad.id}`}>Badge</Label>
                    <Input
                      id={`badge-${ad.id}`}
                      value={ad.badge ?? ''}
                      onChange={(event) => updateAdField(ad.id, 'badge', event.target.value)}
                      placeholder="Azure Land"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${ad.id}`}>Description</Label>
                    <Textarea
                      id={`description-${ad.id}`}
                      value={ad.description}
                      onChange={(event) => updateAdField(ad.id, 'description', event.target.value)}
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
                      onChange={(event) => updateAdField(ad.id, 'imageUrl', event.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cta-${ad.id}`}>CTA text</Label>
                    <Input
                      id={`cta-${ad.id}`}
                      value={ad.ctaText ?? ''}
                      onChange={(event) => updateAdField(ad.id, 'ctaText', event.target.value)}
                      placeholder="Reserve a table"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cta-url-${ad.id}`}>CTA URL</Label>
                    <Input
                      id={`cta-url-${ad.id}`}
                      value={ad.ctaUrl ?? ''}
                      onChange={(event) => updateAdField(ad.id, 'ctaUrl', event.target.value)}
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

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Day planner</CardTitle>
          <Button variant="outline" onClick={addDayPlannerItem} disabled={isDisabled}>
            Add planner item
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Section title</Label>
            <Input value={config.dayPlanner.title ?? ''} onChange={(event) => updateDayPlannerTitle(event.target.value)} />
          </div>
          {config.dayPlanner.items.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={item.title} onChange={(event) => updateDayPlannerItem(item.id, 'title', event.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={item.description} onChange={(event) => updateDayPlannerItem(item.id, 'description', event.target.value)} rows={2} />
              </div>
              <div>
                <Button variant="outline" onClick={() => removeDayPlannerItem(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA label</Label>
              <Input value={config.dayPlanner.cta?.label ?? ''} onChange={(event) => updateDayPlannerCta('label', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input value={config.dayPlanner.cta?.url ?? ''} onChange={(event) => updateDayPlannerCta('url', event.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={addAd} disabled={isDisabled}>
          Add advertisement
        </Button>
        <Button onClick={() => mutation.mutate(config)} disabled={isDisabled}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
