"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { metaService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { defaultMapConfig, type ResortMapConfig } from '@/lib/map-defaults';

const clampZoom = (value: number) => Math.max(0.8, Math.min(2.5, Number(value.toFixed(1))));

export default function MapPage() {
  const [config, setConfig] = useState<ResortMapConfig>(defaultMapConfig);
  const [activePinId, setActivePinId] = useState<string | null>(defaultMapConfig.pins[0]?.id ?? null);
  const [zoom, setZoom] = useState<number>(defaultMapConfig.defaultZoom ?? 1);

  const { data, isLoading } = useQuery({
    queryKey: ['meta', 'map'],
    queryFn: () => metaService.getMap(),
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      const nextConfig = data as ResortMapConfig;
      setConfig(nextConfig);
      setActivePinId(nextConfig.pins[0]?.id ?? null);
      setZoom(clampZoom(nextConfig.defaultZoom ?? 1));
    }
  }, [data]);

  const activePin = useMemo(
    () => config.pins.find((pin) => pin.id === activePinId) ?? config.pins[0] ?? null,
    [activePinId, config.pins],
  );

  const previewImage = resolveImageUrl(config.backgroundImageUrl);

  return (
    <div className="space-y-8">
      <PageHeader
        title={config.title || 'Resort Map'}
        description={config.description || 'Explore the resort and discover key locations.'}
      />

      {!config.enabled ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Map currently unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The interactive map has been disabled from the admin dashboard for now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Interactive resort map</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hover a pin to preview the name, then click for the full card.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setZoom((value) => clampZoom(value - 0.1))}>
                  Zoom out
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setZoom(clampZoom(config.defaultZoom ?? 1))}>
                  Reset
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setZoom((value) => clampZoom(value + 0.1))}>
                  Zoom in
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/70 bg-slate-100 shadow-inner">
                <div
                  className="absolute inset-0 transition-transform duration-200"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={config.title || 'Resort map'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),linear-gradient(135deg,_rgba(15,23,42,0.03),_rgba(59,130,246,0.06))] text-sm text-muted-foreground">
                      No map background has been configured yet.
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-transparent" />

                  {config.pins.map((pin, index) => {
                    const isActive = pin.id === activePin?.id;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => setActivePinId(pin.id)}
                        className="group absolute -translate-x-1/2 -translate-y-full"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        aria-label={pin.name || `Pin ${index + 1}`}
                        title={pin.name || `Pin ${index + 1}`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-lg transition ${
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-white bg-slate-950 text-white hover:bg-slate-800'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="pointer-events-none absolute left-1/2 top-[-0.45rem] hidden -translate-x-1/2 rounded-full bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground shadow group-hover:block">
                          {pin.name || `Pin ${index + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                {isLoading ? 'Loading latest map settings...' : `Default zoom: ${(config.defaultZoom ?? 1).toFixed(1)}x`}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Pin details</CardTitle>
            </CardHeader>
            <CardContent>
              {activePin ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{activePin.name}</h2>
                    {activePin.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{activePin.description}</p>
                    ) : null}
                  </div>

                  {activePin.images?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activePin.images.map((image) => {
                        const imageUrl = resolveImageUrl(image.url);
                        return (
                          <div key={image.id} className="overflow-hidden rounded-2xl border border-border/60 bg-background/70">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={image.alt || activePin.name}
                                className="h-40 w-full object-cover"
                              />
                            ) : null}
                            {(image.caption || image.alt) ? (
                              <div className="space-y-1 p-3">
                                {image.alt ? <p className="text-sm font-medium text-foreground">{image.alt}</p> : null}
                                {image.caption ? <p className="text-xs text-muted-foreground">{image.caption}</p> : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No gallery images have been added for this pin yet.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pins are available yet. An admin can add them from the Map Editor.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}