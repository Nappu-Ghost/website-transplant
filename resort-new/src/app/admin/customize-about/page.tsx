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
  defaultAboutConfig,
  type AboutAmenity,
  type AboutConfig,
  type AboutGalleryItem,
  type AboutStatItem,
  type AboutTeamMember,
} from '@/lib/about-defaults';

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createGalleryItem = (): AboutGalleryItem => ({
  id: createId('gallery'),
  imageUrl: '',
  label: '',
  caption: '',
});

const createParagraph = () => '';

const createStat = (): AboutStatItem => ({
  label: '',
  value: '',
});

const createAmenity = (): AboutAmenity => ({
  title: '',
  description: '',
});

const createTeamMember = (): AboutTeamMember => ({
  name: '',
  role: '',
  bio: '',
  imageUrl: '',
});

export default function AdminCustomizeAboutPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AboutConfig>(defaultAboutConfig);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState('');
  const [isJsonDirty, setIsJsonDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'about-page'],
    queryFn: () => adminService.getAboutSettings(),
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      setConfig(data as AboutConfig);
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
    mutationFn: (payload: AboutConfig) => adminService.updateAboutSettings(payload),
    onSuccess: (payload) => {
      setConfig(payload as AboutConfig);
      setLastSavedAt(new Date().toLocaleTimeString());
      setIsJsonDirty(false);
      toast({ title: 'About page updated', description: 'Your updates are live.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Unable to save changes right now.',
        variant: 'destructive',
      });
    },
  });

  const updateHero = (field: keyof AboutConfig['hero'], value: string) => {
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

  const updateGalleryItem = (id: string, field: keyof AboutGalleryItem, value: string) => {
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

  const updateIntro = (field: 'title' | 'description' | 'highlight', value: string) => {
    setConfig((prev) => ({
      ...prev,
      intro: { ...prev.intro, [field]: value },
    }));
  };

  const updateIntroParagraph = (index: number, value: string) => {
    setConfig((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        paragraphs: prev.intro.paragraphs.map((item, i) => (i === index ? value : item)),
      },
    }));
  };

  const addIntroParagraph = () => {
    setConfig((prev) => ({
      ...prev,
      intro: { ...prev.intro, paragraphs: [...prev.intro.paragraphs, createParagraph()] },
    }));
  };

  const removeIntroParagraph = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        paragraphs: prev.intro.paragraphs.filter((_, i) => i !== index),
      },
    }));
  };

  const updateStatsTitle = (value: string) => {
    setConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, title: value },
    }));
  };

  const updateStatItem = (index: number, field: keyof AboutStatItem, value: string) => {
    setConfig((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: prev.stats.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const addStatItem = () => {
    setConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, items: [...prev.stats.items, createStat()] },
    }));
  };

  const removeStatItem = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, items: prev.stats.items.filter((_, i) => i !== index) },
    }));
  };

  const updateSection = (key: 'amenitiesSection' | 'teamSection', field: 'title' | 'description', value: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const updateAmenity = (index: number, field: keyof AboutAmenity, value: string) => {
    setConfig((prev) => ({
      ...prev,
      amenities: prev.amenities.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addAmenity = () => {
    setConfig((prev) => ({ ...prev, amenities: [...prev.amenities, createAmenity()] }));
  };

  const removeAmenity = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index: number, field: keyof AboutTeamMember, value: string) => {
    setConfig((prev) => ({
      ...prev,
      team: prev.team.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addTeamMember = () => {
    setConfig((prev) => ({ ...prev, team: [...prev.team, createTeamMember()] }));
  };

  const removeTeamMember = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setConfig(parsed as AboutConfig);
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
        title="Customize About Page"
        description="Update hero messaging, story content, and team details."
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
        title="Story content"
        description="Update the main narrative and highlights."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Intro copy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Intro title</Label>
            <Input
              value={config.intro.title ?? ''}
              onChange={(event) => updateIntro('title', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Intro description</Label>
            <Textarea
              value={config.intro.description ?? ''}
              onChange={(event) => updateIntro('description', event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Highlight line</Label>
            <Input
              value={config.intro.highlight ?? ''}
              onChange={(event) => updateIntro('highlight', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Paragraphs</Label>
            <div className="grid gap-3">
              {config.intro.paragraphs.map((paragraph, index) => (
                <div key={`paragraph-${index}`} className="space-y-2 rounded-xl border border-border/60 p-4">
                  <Textarea
                    value={paragraph}
                    onChange={(event) => updateIntroParagraph(index, event.target.value)}
                    rows={3}
                  />
                  <Button variant="outline" onClick={() => removeIntroParagraph(index)}>
                    Remove paragraph
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addIntroParagraph}>
                Add paragraph
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Stats panel</CardTitle>
          <Button variant="outline" onClick={addStatItem} disabled={isDisabled}>
            Add stat
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Panel title</Label>
            <Input value={config.stats.title ?? ''} onChange={(event) => updateStatsTitle(event.target.value)} />
          </div>
          <div className="grid gap-3">
            {config.stats.items.map((item, index) => (
              <div key={`stat-${index}`} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={item.label}
                    onChange={(event) => updateStatItem(index, 'label', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={item.value}
                    onChange={(event) => updateStatItem(index, 'value', event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => removeStatItem(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SectionHeader
        title="Amenities"
        description="Update amenities list and section heading."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Amenities section</CardTitle>
          <Button variant="outline" onClick={addAmenity} disabled={isDisabled}>
            Add amenity
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Section title</Label>
              <Input
                value={config.amenitiesSection.title ?? ''}
                onChange={(event) => updateSection('amenitiesSection', 'title', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Section description</Label>
              <Input
                value={config.amenitiesSection.description ?? ''}
                onChange={(event) => updateSection('amenitiesSection', 'description', event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3">
            {config.amenities.map((amenity, index) => (
              <div key={`amenity-${index}`} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={amenity.title}
                    onChange={(event) => updateAmenity(index, 'title', event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={amenity.description}
                    onChange={(event) => updateAmenity(index, 'description', event.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Button variant="outline" onClick={() => removeAmenity(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SectionHeader
        title="Team"
        description="Update team profiles and section heading."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex items-center justify-between gap-4 sm:flex-row">
          <CardTitle className="text-lg">Team section</CardTitle>
          <Button variant="outline" onClick={addTeamMember} disabled={isDisabled}>
            Add team member
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Section title</Label>
              <Input
                value={config.teamSection.title ?? ''}
                onChange={(event) => updateSection('teamSection', 'title', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Section description</Label>
              <Input
                value={config.teamSection.description ?? ''}
                onChange={(event) => updateSection('teamSection', 'description', event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3">
            {config.team.map((member, index) => (
              <div key={`team-${index}`} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={member.name}
                    onChange={(event) => updateTeamMember(index, 'name', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={member.role}
                    onChange={(event) => updateTeamMember(index, 'role', event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Bio</Label>
                  <Textarea
                    value={member.bio}
                    onChange={(event) => updateTeamMember(index, 'bio', event.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Image URL</Label>
                  <Input
                    value={member.imageUrl}
                    onChange={(event) => updateTeamMember(index, 'imageUrl', event.target.value)}
                  />
                </div>
                <div>
                  <Button variant="outline" onClick={() => removeTeamMember(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SectionHeader
        title="Raw JSON"
        description="Advanced option: edit the about config as JSON."
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
