"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Minus, Plus, X } from 'lucide-react';

import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  // Track natural image dimensions so the container exactly matches the image (no letterboxing)
  const [imgAspect, setImgAspect] = useState('16 / 9');

  const { data } = useQuery({
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
    () => config.pins.find((p) => p.id === activePinId) ?? null,
    [activePinId, config.pins],
  );

  const activeImages = activePin?.images ?? [];
  const featuredImage = resolveImageUrl(activeImages[activeImageIndex]?.url);
  const previewImage = resolveImageUrl(config.backgroundImageUrl);

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title || 'Resort Map'}
        description={config.description || 'Explore the resort and discover key locations.'}
      />

      {!config.enabled ? (
        <Card className="border-border/70">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              The interactive map has been disabled. Check back soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-start gap-4">

          {/* ── MAP COLUMN ── */}
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardContent className="p-0">
                {/* Container matches the image's natural aspect ratio — no letterboxing, pins are always accurate */}
                <div className="relative overflow-hidden" style={{ aspectRatio: imgAspect }}>
                  <div
                    className="absolute inset-0 transition-transform duration-200"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                  >
                    {previewImage ? (
                      <>
                        <img
                          src={previewImage}
                          alt={config.title || 'Resort map'}
                          className="absolute inset-0 h-full w-full"
                          style={{ objectFit: 'fill' }}
                          onLoad={(e) => {
                            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                            if (w > 0 && h > 0) setImgAspect(`${w} / ${h}`);
                          }}
                        />
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
                              title={pin.name || `Pin ${index + 1}`}
                            >
                              {isActive && (
                                <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                              )}
                              <span
                                className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-150 ${
                                  isActive
                                    ? 'scale-110 border-primary bg-primary text-primary-foreground'
                                    : 'border-white bg-black/80 text-white hover:scale-110 hover:border-primary hover:bg-primary'
                                }`}
                              >
                                <MapPin className="h-4 w-4" />
                              </span>
                              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-background/95 px-2 py-0.5 text-[11px] font-medium text-foreground shadow opacity-0 transition-opacity group-hover:opacity-100">
                                {pin.name || `Pin ${index + 1}`}
                              </span>
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        No map image configured.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── SIDE PANEL ── */}
          <div className="flex w-64 shrink-0 flex-col gap-3">

            {/* Zoom card */}
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zoom</p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setZoom((v) => clampZoom(v - 0.1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="flex-1 text-center text-sm font-semibold tabular-nums">{zoom.toFixed(1)}×</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setZoom((v) => clampZoom(v + 0.1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                  onClick={() => setZoom(clampZoom(config.defaultZoom ?? 1))}
                >
                  Reset ({(config.defaultZoom ?? 1).toFixed(1)}×)
                </button>
              </CardContent>
            </Card>

            {/* Locations card */}
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Locations</p>
                  <Badge variant="secondary" className="text-xs">{config.pins.length}</Badge>
                </div>

                {config.pins.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">No locations added yet.</p>
                ) : (
                  <div className="divide-y divide-border/30">
                    {config.pins.map((pin, index) => {
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
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </span>
                          {thumb ? (
                            <img src={thumb} alt="" className="h-9 w-12 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="h-9 w-12 shrink-0 rounded-lg bg-muted/80" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                              {pin.name || `Location ${index + 1}`}
                            </p>
                            {pin.description ? (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">{pin.description}</p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active pin detail section */}
                {activePin ? (
                  <>
                    <Separator />
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Details</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setActivePinId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {featuredImage ? (
                        <img
                          src={featuredImage}
                          alt={activeImages[activeImageIndex]?.alt || activePin.name}
                          className="h-36 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                          No photos yet
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-foreground">{activePin.name}</p>
                        {activePin.description ? (
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{activePin.description}</p>
                        ) : null}
                      </div>

                      {activeImages.length > 1 ? (
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {activeImages.map((image, idx) => {
                            const imageUrl = resolveImageUrl(image.url);
                            return (
                              <button
                                key={image.id}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                className={`h-10 w-14 shrink-0 overflow-hidden rounded-lg border transition ${
                                  idx === activeImageIndex
                                    ? 'border-primary ring-1 ring-primary/30'
                                    : 'border-border/50 hover:border-primary/40'
                                }`}
                              >
                                {imageUrl ? (
                                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                                    {idx + 1}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {activeImages[activeImageIndex]?.caption ? (
                        <p className="text-xs text-muted-foreground">{activeImages[activeImageIndex]?.caption}</p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}