"use client";

import { useEffect, useMemo, useState } from 'react';
import { Leaf, Sparkles, Sun, Waves, HeartHandshake } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureCard, PageShell, SectionHeader } from '@/components/shared';
import { metaService } from '@/lib/api-service';
import { resolveImageUrl } from '@/lib/asset-url';
import { defaultAboutConfig, type AboutConfig } from '@/lib/about-defaults';
import ChromaGrid, { type ChromaItem } from '@/components/chroma-grid';

const amenityIcons = [Waves, Leaf, Sparkles, Sun];

export default function AboutPage() {
  const { data: aboutData } = useQuery({
    queryKey: ['about', 'page'],
    queryFn: () => metaService.getAbout(),
  });

  const aboutConfig = useMemo<AboutConfig>(() => {
    if (aboutData && typeof aboutData === 'object') {
      return aboutData as AboutConfig;
    }
    return defaultAboutConfig;
  }, [aboutData]);

  const heroGallery = useMemo(() => {
    const gallery = aboutConfig.gallery?.length
      ? aboutConfig.gallery
      : defaultAboutConfig.gallery;
    return gallery;
  }, [aboutConfig.gallery]);

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    if (heroGallery.length <= 1) {
      setActiveHeroIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroGallery.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [heroGallery.length]);

  const chromaItems = useMemo<ChromaItem[]>(() => {
    const palette = [
      { border: '#3B82F6', gradient: 'linear-gradient(145deg, #3B82F6, #000)' },
      { border: '#10B981', gradient: 'linear-gradient(180deg, #10B981, #000)' },
      { border: '#F59E0B', gradient: 'linear-gradient(165deg, #F59E0B, #000)' },
      { border: '#EF4444', gradient: 'linear-gradient(195deg, #EF4444, #000)' },
      { border: '#8B5CF6', gradient: 'linear-gradient(225deg, #8B5CF6, #000)' },
      { border: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #000)' },
    ];

    return aboutConfig.team.map((member, index) => {
      const colors = palette[index % palette.length];
      const image = resolveImageUrl(member.imageUrl) || member.imageUrl;
      return {
        image,
        title: member.name,
        subtitle: member.role,
        handle: member.bio,
        borderColor: colors.border,
        gradient: colors.gradient,
      };
    });
  }, [aboutConfig.team]);

  return (
    <PageShell>
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm md:p-10">
        {heroGallery.map((item, index) => {
          const imageSrc = resolveImageUrl(item.imageUrl);
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                index === activeHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={item.label || 'About hero'}
                  className="absolute inset-0 h-full w-full object-cover object-right"
                />
              ) : null}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_hsl(var(--background))_0%,_hsl(var(--background)/0.88)_35%,_hsl(var(--background)/0.35)_60%,_transparent_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.22),_transparent_55%)]" />
        <div className="relative max-w-3xl space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {aboutConfig.hero.kicker}
          </p>
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl lg:text-5xl font-serif">
            {aboutConfig.hero.title}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            {aboutConfig.hero.description}
          </p>
          <div className="flex flex-wrap gap-3">
            {aboutConfig.hero.ctaPrimary?.url && aboutConfig.hero.ctaPrimary.label ? (
              <a className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm" href={aboutConfig.hero.ctaPrimary.url}>
                {aboutConfig.hero.ctaPrimary.label}
              </a>
            ) : null}
            {aboutConfig.hero.ctaSecondary?.url && aboutConfig.hero.ctaSecondary.label ? (
              <a className="inline-flex items-center justify-center rounded-md border border-border/70 px-6 py-3 text-sm font-medium text-foreground" href={aboutConfig.hero.ctaSecondary.url}>
                {aboutConfig.hero.ctaSecondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 text-base text-muted-foreground">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">{aboutConfig.intro.title}</h2>
            {aboutConfig.intro.description ? (
              <p className="text-sm text-muted-foreground">{aboutConfig.intro.description}</p>
            ) : null}
          </div>
          {aboutConfig.intro.paragraphs.map((paragraph, index) => (
            <p key={`intro-${index}`}>{paragraph}</p>
          ))}
          {aboutConfig.intro.highlight ? (
            <div className="flex items-center gap-3 text-sm text-foreground">
              <HeartHandshake className="h-5 w-5 text-primary" />
              {aboutConfig.intro.highlight}
            </div>
          ) : null}
        </div>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{aboutConfig.stats.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {aboutConfig.stats.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 space-y-8">
        <SectionHeader
          title={aboutConfig.amenitiesSection.title || ''}
          description={aboutConfig.amenitiesSection.description || undefined}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {aboutConfig.amenities.map((amenity, index) => (
            <FeatureCard
              key={`${amenity.title}-${index}`}
              icon={amenityIcons[index % amenityIcons.length]}
              title={amenity.title}
              description={amenity.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-8">
        <SectionHeader
          title={aboutConfig.teamSection.title || ''}
          description={aboutConfig.teamSection.description || undefined}
        />
        <ChromaGrid
          items={chromaItems}
          columns={4}
          radius={320}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
        />
      </section>
    </PageShell>
  );
}
