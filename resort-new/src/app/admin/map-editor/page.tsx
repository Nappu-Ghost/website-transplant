"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, ImageIcon, MapPin as MapPinIcon, MousePointerClick, Plus } from 'lucide-react';

import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [imgAspect, setImgAspect] = useState(16 / 9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const mapFrameRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    pinId: null as string | null,
    pointerId: -1,
    startX: 0,
    startY: 0,
    moved: false,
  });
  const viewportPanStateRef = useRef({
    isDragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const [mapViewportSize, setMapViewportSize] = useState({ width: 0, height: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'map-page'],
    queryFn: () => adminService.getMapSettings(),
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      const nextConfig = data as ResortMapConfig;
      setConfig(nextConfig);
      setSelectedPinId(nextConfig.pins[0]?.id ?? null);
      setPan({ x: 0, y: 0 });
    }
  }, [data]);

  useEffect(() => {
    if (selectedPinId && !config.pins.some((pin) => pin.id === selectedPinId)) {
      setSelectedPinId(config.pins[0]?.id ?? null);
    }
  }, [config.pins, selectedPinId]);

  useEffect(() => {
    const element = mapViewportRef.current;
    if (!element) return;

    const updateSize = () => {
      setMapViewportSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

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
  const previewImage = resolveImageUrl(config.backgroundImageUrl);

  const coverMapFrame = useMemo(() => {
    const { width, height } = mapViewportSize;

    if (!width || !height) {
      return { width: 0, height: 0, left: 0, top: 0 };
    }

    const viewportAspect = width / height;

    if (viewportAspect > imgAspect) {
      const coverWidth = width;
      const coverHeight = coverWidth / imgAspect;
      return {
        width: coverWidth,
        height: coverHeight,
        left: 0,
        top: (height - coverHeight) / 2,
      };
    }

    const coverHeight = height;
    const coverWidth = coverHeight * imgAspect;

    return {
      width: coverWidth,
      height: coverHeight,
      left: (width - coverWidth) / 2,
      top: 0,
    };
  }, [imgAspect, mapViewportSize]);

  const maxPan = useMemo(() => {
    const extraX = Math.max(0, (coverMapFrame.width - mapViewportSize.width) / 2);
    const extraY = Math.max(0, (coverMapFrame.height - mapViewportSize.height) / 2);
    return { x: extraX, y: extraY };
  }, [coverMapFrame.height, coverMapFrame.width, mapViewportSize.height, mapViewportSize.width]);

  const clampPanOffset = (x: number, y: number) => ({
    x: Math.max(-maxPan.x, Math.min(maxPan.x, x)),
    y: Math.max(-maxPan.y, Math.min(maxPan.y, y)),
  });

  useEffect(() => {
    setPan((prev) => {
      const next = clampPanOffset(prev.x, prev.y);
      return prev.x === next.x && prev.y === next.y ? prev : next;
    });
  }, [maxPan.x, maxPan.y]);

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

  const openPinEditor = (pinId: string) => {
    setSelectedPinId(pinId);
    setIsPinDialogOpen(true);
  };

  const addPin = () => {
    const newPin = createEmptyPin(50, 50, config.pins.length);
    setConfig((prev) => ({ ...prev, pins: [...prev.pins, newPin] }));
    openPinEditor(newPin.id);
  };

  const updatePinPositionFromPointer = (pinId: string, clientX: number, clientY: number) => {
    const rect = mapFrameRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;

    const x = clampPercent(((clientX - rect.left - pan.x) / rect.width) * 100);
    const y = clampPercent(((clientY - rect.top - pan.y) / rect.height) * 100);
    updatePin(pinId, (pin) => ({ ...pin, x, y }));
  };

  const handlePinPointerDown = (event: React.PointerEvent<HTMLButtonElement>, pinId: string) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedPinId(pinId);

    dragStateRef.current = {
      isDragging: true,
      pinId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePinPointerMove = (event: React.PointerEvent<HTMLButtonElement>, pinId: string) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || dragState.pinId !== pinId || dragState.pointerId !== event.pointerId) return;

    const dx = Math.abs(event.clientX - dragState.startX);
    const dy = Math.abs(event.clientY - dragState.startY);

    if (!dragState.moved && dx < 4 && dy < 4) return;

    dragStateRef.current.moved = true;
    event.preventDefault();
    updatePinPositionFromPointer(pinId, event.clientX, event.clientY);
  };

  const handlePinPointerUp = (event: React.PointerEvent<HTMLButtonElement>, pinId: string) => {
    const wasMoved = dragStateRef.current.moved;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = {
      isDragging: false,
      pinId: null,
      pointerId: -1,
      startX: 0,
      startY: 0,
      moved: false,
    };

    if (!wasMoved) {
      openPinEditor(pinId);
    }
  };

  const handlePinPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = {
      isDragging: false,
      pinId: null,
      pointerId: -1,
      startX: 0,
      startY: 0,
      moved: false,
    };
  };

  const removePin = (pinId: string) => {
    const nextPins = config.pins.filter((pin) => pin.id !== pinId);
    setConfig((prev) => ({ ...prev, pins: prev.pins.filter((pin) => pin.id !== pinId) }));
    if (selectedPinId === pinId) {
      setSelectedPinId(nextPins[0]?.id ?? null);
      setIsPinDialogOpen(false);
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Map Editor"
        description="Tune the public map image, then manage pins from the sidebar and drag them directly on the preview."
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

        <div className="grid min-h-[720px] overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_12px_40px_rgba(15,23,42,0.08)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-border/60 bg-background/80 xl:border-b-0 xl:border-r">
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">Pin editor</p>
                  <h2 className="text-xl font-semibold text-foreground">Manage map pins</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Add a pin from here, then drag it freely on the map and save when you are done.
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full">
                  {config.pins.length} pins
                </Badge>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">Add a new pin</p>
                    <p className="text-[11px] text-muted-foreground">
                      New pins start in the center and can be dragged anywhere on the map.
                    </p>
                  </div>
                  <Button type="button" size="sm" className="rounded-full" onClick={addPin}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add pin
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-3 sm:p-4">
                  {config.pins.length ? (
                    config.pins.map((pin, index) => {
                      const isSelected = pin.id === selectedPinId;
                      return (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={() => openPinEditor(pin.id)}
                          className={`w-full rounded-[20px] border p-3 text-left transition ${
                            isSelected
                              ? 'border-primary/40 bg-primary/5 shadow-sm'
                              : 'border-border/60 bg-card hover:border-primary/30 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {pin.name || `Pin ${index + 1}`}
                                </p>
                              </div>
                              <p className="mt-1 text-[11px] text-muted-foreground">Click to edit details</p>
                            </div>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                      No pins yet. Use the button above to create your first one.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>

          <div className="relative min-h-[420px] bg-[linear-gradient(180deg,rgba(120,113,108,0.08),rgba(231,229,228,0.18))]">
            <div
              ref={mapViewportRef}
              className="absolute inset-0 overflow-hidden p-2 select-none sm:p-3 lg:p-4 touch-none cursor-grab active:cursor-grabbing"
              onDragStart={(event) => event.preventDefault()}
              onClick={() => setSelectedPinId(null)}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                viewportPanStateRef.current = {
                  isDragging: true,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  originX: pan.x,
                  originY: pan.y,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!viewportPanStateRef.current.isDragging) return;
                const dx = event.clientX - viewportPanStateRef.current.startX;
                const dy = event.clientY - viewportPanStateRef.current.startY;
                setPan(clampPanOffset(viewportPanStateRef.current.originX + dx, viewportPanStateRef.current.originY + dy));
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                viewportPanStateRef.current.isDragging = false;
              }}
              onPointerLeave={() => {
                viewportPanStateRef.current.isDragging = false;
              }}
            >
              <div
                ref={mapFrameRef}
                className="absolute overflow-hidden rounded-[22px] border border-border/50 bg-muted/20 shadow-inner"
                style={{
                  left: coverMapFrame.left,
                  top: coverMapFrame.top,
                  width: coverMapFrame.width,
                  height: coverMapFrame.height,
                }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-150"
                  style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={config.title || 'Custom resort map'}
                      draggable={false}
                      className="absolute inset-0 h-full w-full select-none"
                      style={{ objectFit: 'cover', userSelect: 'none' }}
                      onLoad={(event) => {
                        const { naturalWidth, naturalHeight } = event.currentTarget;
                        if (naturalWidth > 0 && naturalHeight > 0) {
                          setImgAspect(naturalWidth / naturalHeight);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      Add a background image in Map settings to start plotting your resort landmarks here.
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />

                  {config.pins.map((pin, index) => {
                    const isSelected = pin.id === selectedPinId;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => handlePinPointerDown(event, pin.id)}
                        onPointerMove={(event) => handlePinPointerMove(event, pin.id)}
                        onPointerUp={(event) => handlePinPointerUp(event, pin.id)}
                        onPointerCancel={handlePinPointerCancel}
                        className="group absolute -translate-x-1/2 -translate-y-full touch-none"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        aria-label={`Select ${pin.name || `pin ${index + 1}`}`}
                        title={pin.name || `Pin ${index + 1}`}
                      >
                        <span
                          className={`relative flex h-10 w-10 cursor-grab items-center justify-center rounded-full border-2 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition-all duration-150 active:cursor-grabbing ${
                            isSelected
                              ? 'scale-110 border-primary bg-primary text-primary-foreground'
                              : 'border-background bg-card text-foreground hover:scale-105 hover:border-primary/50'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/95 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {pin.name || `Pin ${index + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="absolute left-5 top-5 max-w-xs rounded-2xl border border-white/30 bg-slate-950/55 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
                Drag the map to pan. Drag pins to reposition them, or click a pin to edit.
              </div>

              <div className="absolute bottom-5 right-5 rounded-full border border-white/30 bg-slate-950/55 px-3 py-1.5 text-xs text-white shadow-sm backdrop-blur">
                Public map default zoom: {config.defaultZoom.toFixed(1)}×
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedPin && isPinDialogOpen)} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
          {selectedPin ? (
            <div className="flex max-h-[85vh] flex-col">
              <div className="border-b border-border/60 px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <DialogHeader className="space-y-1 text-left">
                    <DialogTitle>{selectedPin.name || 'Edit pin'}</DialogTitle>
                    <DialogDescription>
                      Update this pin here. Drag it on the map to change its position, then save to publish.
                    </DialogDescription>
                  </DialogHeader>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removePin(selectedPin.id)}>
                    Remove pin
                  </Button>
                </div>
              </div>

              <ScrollArea className="max-h-[calc(85vh-5rem)]">
                <div className="space-y-5 px-6 py-5">
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/70">
                    {selectedPreviewImage ? (
                      <img
                        src={selectedPreviewImage}
                        alt={selectedPin.images[0]?.alt || selectedPin.name}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        No image preview yet for this pin.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="pin-name">Name</Label>
                      <Input
                        id="pin-name"
                        value={selectedPin.name}
                        onChange={(event) => updatePinField(selectedPin.id, 'name', event.target.value)}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="pin-description">Description</Label>
                      <Textarea
                        id="pin-description"
                        rows={4}
                        value={selectedPin.description ?? ''}
                        onChange={(event) => updatePinField(selectedPin.id, 'description', event.target.value)}
                      />
                    </div>

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
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
