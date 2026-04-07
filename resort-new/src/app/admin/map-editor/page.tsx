"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, ImageIcon, MapPin as MapPinIcon, MousePointerClick } from 'lucide-react';

import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { defaultMapConfig, type MapPin, type MapPinImage, type ResortMapConfig } from '@/lib/map-defaults';

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clampPercent = (value: number) => Math.max(0, Math.min(100, Number(value.toFixed(2))));

const createEmptyPin = (x: number, y: number, count: number): MapPin => ({
  id: createId('pin'),
  name: `Pin ${count + 1}`,
  description: '',
  x,
  y,
  images: [],
});

const createEmptyImage = (): MapPinImage => ({
  id: createId('image'),
  url: '',
  alt: '',
  caption: '',
});

export default function AdminMapEditorPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ResortMapConfig>(defaultMapConfig);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(defaultMapConfig.pins[0]?.id ?? null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState<'add' | 'move' | null>('add');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'map-page'],
    queryFn: () => adminService.getMapSettings(),
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      const nextConfig = data as ResortMapConfig;
      setConfig(nextConfig);
      setSelectedPinId(nextConfig.pins[0]?.id ?? null);
      setPlacementMode(nextConfig.pins.length ? null : 'add');
    }
  }, [data]);

  useEffect(() => {
    if (selectedPinId && !config.pins.some((pin) => pin.id === selectedPinId)) {
      setSelectedPinId(config.pins[0]?.id ?? null);
    }
  }, [config.pins, selectedPinId]);

  const mutation = useMutation({
    mutationFn: (payload: ResortMapConfig) => adminService.updateMapSettings(payload),
    onSuccess: (payload) => {
      const nextConfig = payload as ResortMapConfig;
      setConfig(nextConfig);
      setLastSavedAt(new Date().toLocaleTimeString());
      toast({ title: 'Map updated', description: 'The public Map tab now uses your saved layout.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Unable to save the map right now.',
        variant: 'destructive',
      });
    },
  });

  const selectedPin = useMemo(
    () => config.pins.find((pin) => pin.id === selectedPinId) ?? null,
    [config.pins, selectedPinId],
  );

  const selectedPreviewImage = resolveImageUrl(selectedPin?.images[0]?.url);

  const updateConfig = <K extends keyof ResortMapConfig>(field: K, value: ResortMapConfig[K]) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const updatePin = (pinId: string, updater: (pin: MapPin) => MapPin) => {
    setConfig((prev) => ({
      ...prev,
      pins: prev.pins.map((pin) => (pin.id === pinId ? updater(pin) : pin)),
    }));
  };

  const updatePinField = (pinId: string, field: keyof MapPin, value: string | number | MapPinImage[]) => {
    updatePin(pinId, (pin) => ({ ...pin, [field]: value }));
  };

  const updatePinCoordinate = (pinId: string, field: 'x' | 'y', value: string) => {
    const numericValue = Number.parseFloat(value);
    if (!Number.isFinite(numericValue)) return;
    updatePin(pinId, (pin) => ({ ...pin, [field]: clampPercent(numericValue) }));
  };

  const addPinAt = (x: number, y: number) => {
    const newPin = createEmptyPin(x, y, config.pins.length);
    setConfig((prev) => ({ ...prev, pins: [...prev.pins, newPin] }));
    setSelectedPinId(newPin.id);
    setPlacementMode(null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

    if (placementMode === 'move' && selectedPinId) {
      updatePin(selectedPinId, (pin) => ({ ...pin, x, y }));
      setPlacementMode(null);
      return;
    }

    addPinAt(x, y);
  };

  const removePin = (pinId: string) => {
    setConfig((prev) => ({ ...prev, pins: prev.pins.filter((pin) => pin.id !== pinId) }));
    if (selectedPinId === pinId) {
      setSelectedPinId(config.pins.find((pin) => pin.id !== pinId)?.id ?? null);
    }
  };

  const addImage = (pinId: string) => {
    updatePin(pinId, (pin) => ({ ...pin, images: [...pin.images, createEmptyImage()] }));
  };

  const updateImageField = (
    pinId: string,
    imageId: string,
    field: keyof MapPinImage,
    value: string,
  ) => {
    updatePin(pinId, (pin) => ({
      ...pin,
      images: pin.images.map((image) => (image.id === imageId ? { ...image, [field]: value } : image)),
    }));
  };

  const removeImage = (pinId: string, imageId: string) => {
    updatePin(pinId, (pin) => ({
      ...pin,
      images: pin.images.filter((image) => image.id !== imageId),
    }));
  };

  const isSaving = mutation.isPending;
  const isDisabled = isSaving || isLoading;
  const previewImage = resolveImageUrl(config.backgroundImageUrl);
  // Track natural image aspect ratio so canvas matches the image exactly (no letterboxing)
  const [canvasAspect, setCanvasAspect] = useState('16 / 9');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Map Editor"
        description="Tune the public map image, default zoom, visibility, and interactive pin cards."
      />

      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="text-sm text-muted-foreground">
          {lastSavedAt ? `Last saved at ${lastSavedAt}` : 'Refine the map layout here, then save to publish it live.'}
        </div>
        <Button onClick={() => mutation.mutate(config)} disabled={isDisabled}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="flex items-center gap-3 p-4">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Visibility</p>
              <p className="text-sm font-semibold text-foreground">{config.enabled ? 'Visible on Map tab' : 'Hidden from guests'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="flex items-center gap-3 p-4">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Pins</p>
              <p className="text-sm font-semibold text-foreground">{config.pins.length} location{config.pins.length === 1 ? '' : 's'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="flex items-center gap-3 p-4">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Default zoom</p>
              <p className="text-sm font-semibold text-foreground">{config.defaultZoom.toFixed(1)}x</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Map settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3 md:col-span-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Display map on the public Map tab</p>
                  <p className="text-xs text-muted-foreground">Turn this off to temporarily hide the map from guests.</p>
                </div>
                <Switch checked={config.enabled} onCheckedChange={(checked) => updateConfig('enabled', checked)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map-title">Map title</Label>
                <Input
                  id="map-title"
                  value={config.title ?? ''}
                  onChange={(event) => updateConfig('title', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map-image">Background image URL</Label>
                <Input
                  id="map-image"
                  value={config.backgroundImageUrl ?? ''}
                  onChange={(event) => updateConfig('backgroundImageUrl', event.target.value)}
                  placeholder="https://... or /uploads/..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="map-description">Description</Label>
                <Textarea
                  id="map-description"
                  value={config.description ?? ''}
                  onChange={(event) => updateConfig('description', event.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>Default zoom on Map tab</Label>
                  <span className="text-sm text-muted-foreground">{config.defaultZoom.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[config.defaultZoom]}
                  min={0.8}
                  max={2.5}
                  step={0.1}
                  onValueChange={(value) => updateConfig('defaultZoom', Number((value[0] ?? 1).toFixed(1)))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 bg-card/90">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Map canvas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {placementMode === 'move'
                    ? 'Click the preview to reposition the selected pin.'
                    : 'Click directly on the map to add a new pin.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => setPlacementMode('add')}>
                  Add pin by click
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedPin}
                  onClick={() => setPlacementMode('move')}
                >
                  Move selected pin
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="relative cursor-crosshair overflow-hidden rounded-[28px] border border-dashed border-border/80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.03),_rgba(59,130,246,0.06))]"
                style={{ aspectRatio: canvasAspect, minHeight: '320px' }}
                onClick={handleCanvasClick}
              >
                <div
                  className="absolute inset-0 transition-transform duration-200"
                  style={{ transform: `scale(${config.defaultZoom || 1})`, transformOrigin: 'center center' }}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={config.title || 'Custom resort map'}
                      className="absolute inset-0 h-full w-full"
                      style={{ objectFit: 'fill' }}
                      onLoad={(e) => {
                        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                        if (w > 0 && h > 0) setCanvasAspect(`${w} / ${h}`);
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Add a background image later and start plotting your resort landmarks here.
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent" />

                  {config.pins.map((pin, index) => {
                    const isSelected = pin.id === selectedPinId;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedPinId(pin.id);
                        }}
                        className="group absolute -translate-x-1/2 -translate-y-full"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        aria-label={`Select ${pin.name || `pin ${index + 1}`}`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-lg transition ${
                            isSelected
                              ? 'scale-110 border-primary bg-primary text-primary-foreground'
                              : 'border-white bg-slate-950 text-white hover:scale-105'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="pointer-events-none absolute left-1/2 top-[-0.45rem] hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground shadow group-hover:block">
                          {pin.name || `Pin ${index + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="absolute left-3 top-3 rounded-2xl border border-white/70 bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
                  {placementMode === 'move'
                    ? 'Move mode is on — click the map to place the selected pin.'
                    : 'Tip: click anywhere on the map preview to add a new pin.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Pin list</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-56 rounded-2xl border border-border/60 bg-background/50">
                <div className="space-y-2 p-3">
                  {config.pins.length ? (
                    config.pins.map((pin, index) => {
                      const isSelected = pin.id === selectedPinId;
                      return (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={() => setSelectedPinId(pin.id)}
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border/60 bg-background/60 hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                                {index + 1}
                              </span>
                              <p className="text-sm font-medium text-foreground">{pin.name || `Pin ${index + 1}`}</p>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="p-3 text-sm text-muted-foreground">No pins yet. Click the map preview to add one.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedPin ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Selected pin</CardTitle>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removePin(selectedPin.id)}>
                    Remove pin
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/70">
                  {selectedPreviewImage ? (
                    <img
                      src={selectedPreviewImage}
                      alt={selectedPin.images[0]?.alt || selectedPin.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      No image preview yet for this pin.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin-name">Name</Label>
                  <Input
                    id="pin-name"
                    value={selectedPin.name}
                    onChange={(event) => updatePinField(selectedPin.id, 'name', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin-description">Description</Label>
                  <Textarea
                    id="pin-description"
                    rows={4}
                    value={selectedPin.description ?? ''}
                    onChange={(event) => updatePinField(selectedPin.id, 'description', event.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pin-x">X position (%)</Label>
                    <Input
                      id="pin-x"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={selectedPin.x}
                      onChange={(event) => updatePinCoordinate(selectedPin.id, 'x', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin-y">Y position (%)</Label>
                    <Input
                      id="pin-y"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={selectedPin.y}
                      onChange={(event) => updatePinCoordinate(selectedPin.id, 'y', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Photo gallery</p>
                      <p className="text-xs text-muted-foreground">These images appear in the guest-facing info card.</p>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => addImage(selectedPin.id)}>
                      Add image
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedPin.images.length ? (
                      selectedPin.images.map((image, index) => (
                        <div key={image.id} className="space-y-3 rounded-xl border border-border/60 bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">Image {index + 1}</p>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeImage(selectedPin.id, image.id)}
                            >
                              Remove
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              value={image.url}
                              onChange={(event) => updateImageField(selectedPin.id, image.id, 'url', event.target.value)}
                              placeholder="https://... or /uploads/..."
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Alt text</Label>
                              <Input
                                value={image.alt ?? ''}
                                onChange={(event) => updateImageField(selectedPin.id, image.id, 'alt', event.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Caption</Label>
                              <Input
                                value={image.caption ?? ''}
                                onChange={(event) => updateImageField(selectedPin.id, image.id, 'caption', event.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No images yet for this pin.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/70 bg-card/90">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Select a pin from the list or click the canvas to create one.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
