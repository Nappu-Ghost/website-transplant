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
import {
  defaultActivitiesConfig,
  type ActivitiesConfig,
  type ActivitiesGalleryItem,
} from '@/lib/activities-defaults';

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createGalleryItem = (): ActivitiesGalleryItem => ({
  id: createId('gallery'),
  imageUrl: '',
  label: '',
  caption: '',
});

export default function AdminCustomizeActivitiesPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ActivitiesConfig>(defaultActivitiesConfig);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState('');
  const [isJsonDirty, setIsJsonDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activities-page'],
    queryFn: () => adminService.getActivitiesSettings(),
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      setConfig(data as ActivitiesConfig);
      if (!isJsonDirty) {
        setRawJson(JSON.stringify(data, null, 2));
      }
    }
  }, [data, isJsonDirty]);

  useEffect(() => {
    if (!isJsonDirty) {
      setRawJson(JSON.stringify(config, null, 2));
    }
  }, [config, isJsonDirty]);

  const mutation = useMutation({
    mutationFn: (payload: ActivitiesConfig) => adminService.updateActivitiesSettings(payload),
    onSuccess: (payload) => {
      setConfig(payload as ActivitiesConfig);
      setLastSavedAt(new Date().toLocaleTimeString());
      setIsJsonDirty(false);
      toast({ title: 'Activities page updated', description: 'Your updates are live.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Unable to save changes right now.',
        variant: 'destructive',
      });
    },
  });

  const updateHero = (field: keyof ActivitiesConfig['hero'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateHeroCta = (key: 'ctaPrimary' | 'ctaSecondary', field: 'label' | 'url', value: string) => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [key]: { ...prev.hero[key], [field]: value },
      },
    }));
  };

  const updateGalleryItem = (id: string, field: keyof ActivitiesGalleryItem, value: string) => {
    setConfig((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addGalleryItem = () => {
    setConfig((prev) => ({ ...prev, gallery: [...prev.gallery, createGalleryItem()] }));
  };

  const removeGalleryItem = (id: string) => {
    setConfig((prev) => ({ ...prev, gallery: prev.gallery.filter((item) => item.id !== id) }));
  };

  const updateSection = (key: 'featured' | 'listing', field: 'title' | 'description', value: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setConfig(parsed as ActivitiesConfig);
      setIsJsonDirty(false);
      toast({ title: 'JSON applied', description: 'The editor has been updated.' });
    } catch (error: any) {
      toast({
        title: 'Invalid JSON',
        description: error?.message || 'Fix JSON formatting before applying.',
        variant: 'destructive',
      });
    }
  };

  const isSaving = mutation.isPending;
  const isDisabled = isSaving || isLoading;

  const hasGallery = useMemo(() => config.gallery.length > 0, [config.gallery.length]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customize Activities Page"
        description="Update hero messaging, gallery imagery, and section headers."
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
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Hero gallery</CardTitle>
          <Button variant="outline" onClick={addGalleryItem} disabled={isDisabled}>
            Add gallery image
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!hasGallery ? (
            <div className="text-sm text-muted-foreground">Add at least one gallery image.</div>
          ) : (
            config.gallery.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={item.imageUrl}
                    onChange={(event) => updateGalleryItem(item.id, 'imageUrl', event.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={item.label ?? ''}
                    onChange={(event) => updateGalleryItem(item.id, 'label', event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Caption</Label>
                  <Textarea
                    value={item.caption ?? ''}
                    onChange={(event) => updateGalleryItem(item.id, 'caption', event.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Button variant="outline" onClick={() => removeGalleryItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <SectionHeader
        title="Section headings"
        description="Label the featured and full listing sections."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Featured experiences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={config.featured.title ?? ''}
              onChange={(event) => updateSection('featured', 'title', event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={config.featured.description ?? ''}
              onChange={(event) => updateSection('featured', 'description', event.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">All activities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={config.listing.title ?? ''}
              onChange={(event) => updateSection('listing', 'title', event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={config.listing.description ?? ''}
              onChange={(event) => updateSection('listing', 'description', event.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <SectionHeader
        title="Raw JSON"
        description="Advanced option: edit the activities config as JSON."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">JSON editor</CardTitle>
          <Button variant="outline" onClick={applyJson} disabled={isDisabled}>
            Apply JSON
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={rawJson}
            onChange={(event) => {
              setRawJson(event.target.value);
              setIsJsonDirty(true);
            }}
            rows={14}
            className="font-mono text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Use camelCase keys, matching the UI fields. Invalid JSON will be rejected.
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => mutation.mutate(config)} disabled={isDisabled}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
