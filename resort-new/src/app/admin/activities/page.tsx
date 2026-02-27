"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModalDialog, PageHeader, SectionHeader } from '@/components/shared';
import { demoImageUrl } from '@/lib/demo-images';
import { activityService, metaService } from '@/lib/api-service';
import { toast } from '@/hooks/use-toast';

interface Activity {
  id: number;
  name: string;
  activityType: string;
  price: number;
  capacity?: number | null;
  imageUrl?: string | null;
  isPremium?: boolean;
}

interface ActivityDraft {
  name: string;
  activityType: string;
  price: string;
  capacity: string;
  imageUrl: string;
  isPremium: string;
}

const emptyDraft = (): ActivityDraft => ({
  name: '',
  activityType: 'Adventure',
  price: '',
  capacity: '10',
  imageUrl: '',
  isPremium: 'false',
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function AdminActivitiesPage() {
  const queryClient = useQueryClient();
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ActivityDraft>(emptyDraft());
  const [imageFile, setImageFile] = useState<File | null>(null);

  const metaQuery = useQuery<{ demoMode?: boolean; demo_mode?: boolean }>({
    queryKey: ['meta'],
    queryFn: () => metaService.get(),
  });

  const isDemoMode = useMemo(() => {
    const data: any = metaQuery.data;
    return Boolean(data?.demoMode ?? data?.demo_mode);
  }, [metaQuery.data]);

  const activitiesQuery = useQuery<Activity[]>({
    queryKey: ['activities', 'admin'],
    queryFn: () => activityService.list(),
  });

  const createActivityMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => activityService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'admin'] });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      activityService.update(String(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'admin'] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => activityService.uploadImage(String(id), file),
    onSuccess: (data: any) => {
      const nextUrl = data?.imageUrl ?? data?.image_url ?? '';
      setDraft((current) => ({ ...current, imageUrl: nextUrl }));
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['activities', 'admin'] });
      toast({ title: 'Image uploaded', description: 'Activity image has been updated.' });
    },
    onError: (e: any) => {
      toast({ title: 'Upload failed', description: e?.message || 'An unexpected error occurred.', variant: 'destructive' });
    },
  });

  const handleOpenCreate = () => {
    setActiveActivityId(null);
    setDraft(emptyDraft());
    setImageFile(null);
  };

  const handleOpenEdit = (activity: Activity) => {
    setActiveActivityId(activity.id);
    setDraft({
      name: activity.name,
      activityType: activity.activityType,
      price: String(activity.price ?? ''),
      capacity: String(activity.capacity ?? ''),
      imageUrl: activity.imageUrl ?? '',
      isPremium: activity.isPremium ? 'true' : 'false',
    });
    setImageFile(null);
  };

  const previewUrl = useMemo(() => {
    if (!draft.imageUrl) return '';
    return metaService.toPublicUrl(draft.imageUrl);
  }, [draft.imageUrl]);

  const handleSave = () => {
    const payload = {
      name: draft.name.trim(),
      activityType: draft.activityType.trim(),
      price: Number(draft.price),
      capacity: draft.capacity ? Number(draft.capacity) : undefined,
      imageUrl: draft.imageUrl.trim() || undefined,
      isPremium: draft.isPremium === 'true',
    };

    if (activeActivityId) {
      updateActivityMutation.mutate({ id: activeActivityId, payload });
    } else {
      createActivityMutation.mutate(payload);
    }
  };

  const activities = useMemo(() => activitiesQuery.data ?? [], [activitiesQuery.data]);
  const isSaving = createActivityMutation.isPending || updateActivityMutation.isPending;
  return (
    <div className="space-y-8">
      <PageHeader
        title="Activities"
        description="Curate experiences, capacity, and schedules."
      />

      {activitiesQuery.isError ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Unable to load activities</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {activitiesQuery.error instanceof Error
              ? activitiesQuery.error.message
              : 'Please try again shortly.'}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Experience roster</CardTitle>
          <ModalDialog
            title="Add activity"
            description="Create a new resort experience."
            trigger={<Button variant="outline" onClick={handleOpenCreate}>Add activity</Button>}
            footer={
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save activity'}
              </Button>
            }
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activity-name">Name</Label>
                  <Input
                    id="activity-name"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Reef Snorkeling"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Category</Label>
                  <Input
                    id="activity-type"
                    value={draft.activityType}
                    onChange={(event) => setDraft((current) => ({ ...current, activityType: event.target.value }))}
                    placeholder="Adventure"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activity-price">Price</Label>
                  <Input
                    id="activity-price"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-capacity">Capacity</Label>
                  <Input
                    id="activity-capacity"
                    type="number"
                    min={1}
                    value={draft.capacity}
                    onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))}
                    placeholder="12"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="activity-image">Image URL</Label>
                  <Input
                    id="activity-image"
                    value={draft.imageUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                    placeholder="/images/gallery/activities/snorkel.svg"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {isDemoMode ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            imageUrl: demoImageUrl('activity', current.name || String(Date.now())),
                          }))
                        }
                      >
                        Generate demo image
                      </Button>
                    ) : null}

                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={!imageFile || uploadImageMutation.isPending || createActivityMutation.isPending}
                        onClick={async () => {
                          if (!imageFile) return;
                          try {
                            let nextId = activeActivityId;
                            if (!nextId) {
                              const payload = {
                              name: draft.name.trim(),
                              activityType: draft.activityType.trim(),
                              price: Number(draft.price),
                              capacity: draft.capacity ? Number(draft.capacity) : undefined,
                              imageUrl: draft.imageUrl.trim() || undefined,
                              isPremium: draft.isPremium === 'true',
                            };
                              const created: any = await createActivityMutation.mutateAsync(payload);
                              nextId = Number(created?.id ?? created?.ID ?? created?.roomId ?? created?.activityId ?? created?.hotelId ?? NaN);
                              if (!Number.isFinite(nextId)) nextId = null;
                              if (!nextId) throw new Error('Unable to determine created record id.');
                              // Update local state so future uploads/edits use the same record.
                              setActiveActivityId(nextId);
                            }
                            await uploadImageMutation.mutateAsync({ id: nextId, file: imageFile });
                          } catch (e: any) {
                            toast({
                              title: 'Upload failed',
                              description: e?.message || 'An unexpected error occurred.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>

                    {previewUrl ? (
                      <a className="text-xs text-muted-foreground underline" href={previewUrl} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Premium</Label>
                  <Select
                    value={draft.isPremium}
                    onValueChange={(value) => setDraft((current) => ({ ...current, isPremium: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Premium</SelectItem>
                      <SelectItem value="false">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ModalDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activitiesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    Loading activities...
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No activities yet.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{activity.name}</p>
                        {activity.isPremium ? (
                          <Badge variant="secondary" className="mt-1">Premium</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{activity.activityType}</TableCell>
                    <TableCell>{activity.capacity ?? '—'}</TableCell>
                    <TableCell>{formatCurrency(activity.price)}</TableCell>
                    <TableCell>
                      <Badge variant={activity.isPremium ? 'outline' : 'secondary'}>
                        {activity.isPremium ? 'Premium' : 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ModalDialog
                        title="Edit activity"
                        description="Update pricing, category, or capacity."
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(activity)}
                          >
                            Edit
                          </Button>
                        }
                        footer={
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save changes'}
                          </Button>
                        }
                      >
                        <div className="grid gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`activity-name-${activity.id}`}>Name</Label>
                              <Input
                                id={`activity-name-${activity.id}`}
                                value={draft.name}
                                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`activity-type-${activity.id}`}>Category</Label>
                              <Input
                                id={`activity-type-${activity.id}`}
                                value={draft.activityType}
                                onChange={(event) => setDraft((current) => ({ ...current, activityType: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`activity-price-${activity.id}`}>Price</Label>
                              <Input
                                id={`activity-price-${activity.id}`}
                                type="number"
                                min={0}
                                value={draft.price}
                                onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`activity-capacity-${activity.id}`}>Capacity</Label>
                              <Input
                                id={`activity-capacity-${activity.id}`}
                                type="number"
                                min={1}
                                value={draft.capacity}
                                onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`activity-image-${activity.id}`}>Image URL</Label>
                              <Input
                                id={`activity-image-${activity.id}`}
                                value={draft.imageUrl}
                                onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Premium</Label>
                              <Select
                                value={draft.isPremium}
                                onValueChange={(value) => setDraft((current) => ({ ...current, isPremium: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Tier" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Premium</SelectItem>
                                  <SelectItem value="false">Standard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </ModalDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SectionHeader
        title="Experience notes"
        description="Chef table waitlist is trending high for sunset sessions this week."
      />
    </div>
  );
}
