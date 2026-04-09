"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Minus, Plus, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { metaService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { defaultMapConfig, type ResortMapConfig } from '@/lib/map-defaults';

const clampZoom = (v: number) => Math.max(0.8, Math.min(2.5, parseFloat(v.toFixed(1))));

export default function MapPage() {
  const [config, setConfig] = useState<ResortMapConfig>(defaultMapConfig);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imgAspect, setImgAspect] = useState('16 / 9');

  const { data, isLoading } = useQuery({
    queryKey: ['meta', 'map'],
    queryFn: () => metaService.getMap(),
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      const next = data as ResortMapConfig;
      setConfig(next);
      setActivePinId(null);
      setActiveImageIndex(0);
      setZoom(clampZoom(next.defaultZoom ?? 1));
    }
  }, [data]);

  const activePin = useMemo(
    () => config.pins.find((pin) => pin.id === activePinId) ?? null,
    [activePinId, config.pins],
  );

  const activeImages = activePin?.images ?? [];
  const featuredImage = resolveImageUrl(activeImages[activeImageIndex]?.url);
  const previewImage = resolveImageUrl(config.backgroundImageUrl);

  if (!config.enabled) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="rounded-2xl border border-border/60 bg-card/90 px-6 py-5 text-sm text-muted-foreground shadow-sm">
          The interactive map is currently unavailable.
        </div>
      </div>
    );
  }

  return (
    <section className="h-[calc(100vh-4.5rem)] bg-background px-2 py-2 sm:px-4 sm:py-4">
      <div className="grid h-full min-h-0 overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-border/60 bg-background/80 lg:border-b-0 lg:border-r">
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">Resort map</p>
                <h2 className="text-xl font-semibold text-foreground">Explore the resort</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {config.description || 'Choose a place from the list or tap a pin to explore the resort.'}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 rounded-full">
                {config.pins.length} places
              </Badge>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">Zoom controls</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isLoading ? 'Loading map…' : `Current zoom ${zoom.toFixed(1)}×`}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setZoom((value) => clampZoom(value - 0.1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setZoom((value) => clampZoom(value + 0.1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZoom(clampZoom(config.defaultZoom ?? 1))}
                className="mt-3 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                Reset to {(config.defaultZoom ?? 1).toFixed(1)}×
              </button>
            </div>
          </div>

          <Separator />

          <div className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-3">
                {config.pins.length ? (
                  config.pins.map((pin, index) => {
                    const isActive = pin.id === activePinId;
                    const thumb = resolveImageUrl(pin.images?.[0]?.url);

                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => {
                          setActivePinId(isActive ? null : pin.id);
                          setActiveImageIndex(0);
                        }}
                        className={`w-full rounded-[20px] border p-2.5 text-left transition ${
                          isActive
                            ? 'border-primary/40 bg-primary/5 shadow-sm'
                            : 'border-border/60 bg-card hover:border-primary/30 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-14 w-16 shrink-0 rounded-xl object-cover" />
                          ) : (
                            <div className="h-14 w-16 shrink-0 rounded-xl bg-muted" />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <p className="truncate text-sm font-semibold text-foreground">
                                {pin.name || `Location ${index + 1}`}
                              </p>
                            </div>
                            {pin.description ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{pin.description}</p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                    No locations available yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {activePin ? (
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Selected place</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{activePin.name}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActivePinId(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {featuredImage ? (
                <img
                  src={featuredImage}
                  alt={activeImages[activeImageIndex]?.alt || activePin.name}
                  className="h-36 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-2xl bg-muted text-xs text-muted-foreground">
                  No photos yet
                </div>
              )}

              {activePin.description ? (
                <p className="text-xs leading-5 text-muted-foreground">{activePin.description}</p>
              ) : null}

              {activeImages.length > 1 ? (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {activeImages.map((image, index) => {
                    const imageUrl = resolveImageUrl(image.url);
                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-11 w-14 shrink-0 overflow-hidden rounded-lg border transition ${
                          index === activeImageIndex
                            ? 'border-primary ring-1 ring-primary/30'
                            : 'border-border/50 hover:border-primary/40'
                        }`}
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                            {index + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Pick a place from the list to see details here.
            </div>
          )}
        </aside>

        <div className="relative min-h-0 bg-[linear-gradient(180deg,rgba(120,113,108,0.08),rgba(231,229,228,0.18))]">
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5 lg:p-6">
            <div
              className="relative h-full max-w-full overflow-hidden rounded-[26px] border border-border/60 bg-muted/40 shadow-inner"
              style={{ aspectRatio: imgAspect }}
            >
              <div
                className="absolute inset-0 transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={config.title || 'Resort map'}
                    className="absolute inset-0 h-full w-full"
                    style={{ objectFit: 'fill' }}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      if (naturalWidth > 0 && naturalHeight > 0) {
                        setImgAspect(`${naturalWidth} / ${naturalHeight}`);
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    No map image configured yet.
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />

                {config.pins.map((pin, index) => {
                  const isActive = pin.id === activePinId;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => {
                        setActivePinId(isActive ? null : pin.id);
                        setActiveImageIndex(0);
                      }}
                      className="group absolute -translate-x-1/2 -translate-y-full"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      aria-label={pin.name || `Location ${index + 1}`}
                      title={pin.name || `Location ${index + 1}`}
                    >
                      {isActive ? <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" /> : null}
                      <span
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition-all duration-150 ${
                          isActive
                            ? 'scale-110 border-primary bg-primary text-primary-foreground'
                            : 'border-background bg-card text-foreground hover:scale-105 hover:border-primary/50'
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/95 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        {pin.name || `Location ${index + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}