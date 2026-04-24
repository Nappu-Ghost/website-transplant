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
import { hotelService, roomService, metaService } from '@/lib/api-service';
import { toast } from '@/hooks/use-toast';

interface Hotel {
  id: number;
  name: string;
}

interface Room {
  id: number;
  hotelId: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description?: string | null;
  imageUrl?: string | null;
  floorNumber: number;
  available: boolean;
  isPremium: boolean;
}

interface RoomDraft {
  hotelId: string;
  name: string;
  type: string;
  price: string;
  capacity: string;
  description: string;
  imageUrl: string;
  floorNumber: string;
  available: string;
  isPremium: string;
}

const emptyDraft = (hotelId?: number): RoomDraft => ({
  hotelId: hotelId ? String(hotelId) : '',
  name: '',
  type: 'Suite',
  price: '',
  capacity: '2',
  description: '',
  imageUrl: '',
  floorNumber: '1',
  available: 'true',
  isPremium: 'false',
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function AdminAccommodationsPage() {
  const queryClient = useQueryClient();
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RoomDraft>(emptyDraft());
  const [imageFile, setImageFile] = useState<File | null>(null);

  const metaQuery = useQuery<{ demoMode?: boolean; demo_mode?: boolean }>({
    queryKey: ['meta'],
    queryFn: () => metaService.get(),
  });

  const isDemoMode = useMemo(() => {
    const data: any = metaQuery.data;
    return Boolean(data?.demoMode ?? data?.demo_mode);
  }, [metaQuery.data]);

  const hotelsQuery = useQuery<Hotel[]>({
    queryKey: ['hotels', 'admin'],
    queryFn: () => hotelService.list(),
  });

  const roomsQuery = useQuery<Room[]>({
    queryKey: ['rooms', 'admin'],
    queryFn: () => roomService.list(),
  });

  const createRoomMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => roomService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      roomService.update(String(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => roomService.uploadImage(String(id), file),
    onSuccess: (data: any) => {
      const nextUrl = data?.imageUrl ?? data?.image_url ?? '';
      setDraft((current) => ({ ...current, imageUrl: nextUrl }));
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['rooms', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({ title: 'Image uploaded', description: 'Accommodation image has been updated.' });
    },
    onError: (e: any) => {
      toast({ title: 'Upload failed', description: e?.message || 'An unexpected error occurred.', variant: 'destructive' });
    },
  });

  const hotelsById = useMemo(() => {
    return new Map((hotelsQuery.data ?? []).map((hotel) => [hotel.id, hotel]));
  }, [hotelsQuery.data]);

  const previewUrl = useMemo(() => {
    if (!draft.imageUrl) return '';
    return metaService.toPublicUrl(draft.imageUrl);
  }, [draft.imageUrl]);

  const handleOpenCreate = () => {
    const fallbackHotelId = hotelsQuery.data?.[0]?.id;
    setActiveRoomId(null);
    setDraft(emptyDraft(fallbackHotelId));
    setImageFile(null);
  };

  const handleOpenEdit = (room: Room) => {
    setActiveRoomId(room.id);
    setDraft({
      hotelId: String(room.hotelId),
      name: room.name,
      type: room.type,
      price: String(room.price ?? ''),
      capacity: String(room.capacity ?? 1),
      description: room.description ?? '',
      imageUrl: room.imageUrl ?? '',
      floorNumber: String(room.floorNumber ?? 1),
      available: room.available ? 'true' : 'false',
      isPremium: room.isPremium ? 'true' : 'false',
    });
    setImageFile(null);
  };

  const handleSave = () => {
    if (!draft.hotelId) return;
    const payload = {
      hotelId: Number(draft.hotelId),
      name: draft.name.trim(),
      type: draft.type.trim(),
      price: Number(draft.price),
      capacity: Number(draft.capacity),
      description: draft.description.trim() || undefined,
      imageUrl: draft.imageUrl.trim() || undefined,
      floorNumber: Number(draft.floorNumber),
      available: draft.available === 'true',
      isPremium: draft.isPremium === 'true',
    };

    if (activeRoomId) {
      updateRoomMutation.mutate({ id: activeRoomId, payload });
    } else {
      createRoomMutation.mutate(payload);
    }
  };

  const isSaving = createRoomMutation.isPending || updateRoomMutation.isPending;
  const isBusy = roomsQuery.isLoading || hotelsQuery.isLoading;
  const isMissingHotels = (hotelsQuery.data?.length ?? 0) === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rooms"
        description="Manage suite inventory, availability, and rate tiers."
      />

      {roomsQuery.isError ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Unable to load accommodations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {roomsQuery.error instanceof Error
              ? roomsQuery.error.message
              : 'Please try again shortly.'}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Inventory overview</CardTitle>
          <ModalDialog
            title="Add accommodation"
            description="Create a new room or suite in the inventory."
            trigger={<Button variant="outline" onClick={handleOpenCreate}>Add accommodation</Button>}
            footer={
              <Button onClick={handleSave} disabled={isSaving || isMissingHotels}>
                {isSaving ? 'Saving...' : 'Save accommodation'}
              </Button>
            }
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Property</Label>
                <Select
                  value={draft.hotelId}
                  onValueChange={(value) => setDraft((current) => ({ ...current, hotelId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isMissingHotels ? 'No hotels available' : 'Select hotel'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(hotelsQuery.data ?? []).map((hotel) => (
                      <SelectItem key={hotel.id} value={String(hotel.id)}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Name</Label>
                  <Input
                    id="room-name"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Lagoon Suite 201"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-type">Type</Label>
                  <Input
                    id="room-type"
                    value={draft.type}
                    onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
                    placeholder="Suite"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="room-price">Nightly rate</Label>
                  <Input
                    id="room-price"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                    placeholder="420"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Capacity</Label>
                  <Input
                    id="room-capacity"
                    type="number"
                    min={1}
                    value={draft.capacity}
                    onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))}
                    placeholder="2"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="room-floor">Floor</Label>
                  <Input
                    id="room-floor"
                    type="number"
                    min={1}
                    value={draft.floorNumber}
                    onChange={(event) => setDraft((current) => ({ ...current, floorNumber: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-image">Image URL</Label>
                  <Input
                    id="room-image"
                    value={draft.imageUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                    placeholder="/images/gallery/rooms/room1.jpg"
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
                            imageUrl: demoImageUrl('room', current.name || String(Date.now())),
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
                        disabled={!imageFile || uploadImageMutation.isPending || createRoomMutation.isPending}
                        onClick={async () => {
                          if (!imageFile) return;
                          try {
                            let nextId = activeRoomId;
                            if (!nextId) {
                              if (!draft.hotelId) {
                              toast({ title: 'Missing hotel', description: 'Select a hotel first.', variant: 'destructive' });
                              return;
                            }
                            const payload = {
                              hotelId: Number(draft.hotelId),
                              name: draft.name.trim(),
                              type: draft.type.trim(),
                              price: Number(draft.price),
                              capacity: Number(draft.capacity),
                              description: draft.description.trim() || undefined,
                              imageUrl: draft.imageUrl.trim() || undefined,
                              floorNumber: Number(draft.floorNumber),
                              available: draft.available === 'true',
                              isPremium: draft.isPremium === 'true',
                            };
                              const created: any = await createRoomMutation.mutateAsync(payload);
                              nextId = Number(created?.id ?? created?.ID ?? created?.roomId ?? created?.activityId ?? created?.hotelId ?? NaN);
                              if (!Number.isFinite(nextId)) nextId = null;
                              if (!nextId) throw new Error('Unable to determine created record id.');
                              // Update local state so future uploads/edits use the same record.
                              setActiveRoomId(nextId);
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
                      <div className="mt-1 overflow-hidden rounded-md border border-border/70">
                        <img src={previewUrl} alt="Image preview" className="h-32 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Available</Label>
                  <Select
                    value={draft.available}
                    onValueChange={(value) => setDraft((current) => ({ ...current, available: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="space-y-2">
                <Label htmlFor="room-description">Description</Label>
                <Input
                  id="room-description"
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Oceanfront suite with private deck"
                />
              </div>
            </div>
          </ModalDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isBusy ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    Loading accommodations...
                  </TableCell>
                </TableRow>
              ) : (roomsQuery.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No accommodations yet.
                  </TableCell>
                </TableRow>
              ) : (
                (roomsQuery.data ?? []).map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{room.name}</p>
                        <p className="text-xs text-muted-foreground">{room.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>{hotelsById.get(room.hotelId)?.name ?? 'Unknown'}</TableCell>
                    <TableCell>{formatCurrency(room.price)}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={room.available ? 'secondary' : 'outline'}>
                        {room.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ModalDialog
                        title="Edit accommodation"
                        description="Update pricing, availability, or guest capacity."
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(room)}
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
                          <div className="space-y-2">
                            <Label>Property</Label>
                            <Select
                              value={draft.hotelId}
                              onValueChange={(value) => setDraft((current) => ({ ...current, hotelId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select hotel" />
                              </SelectTrigger>
                              <SelectContent>
                                {(hotelsQuery.data ?? []).map((hotel) => (
                                  <SelectItem key={hotel.id} value={String(hotel.id)}>
                                    {hotel.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`room-name-${room.id}`}>Name</Label>
                              <Input
                                id={`room-name-${room.id}`}
                                value={draft.name}
                                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`room-type-${room.id}`}>Type</Label>
                              <Input
                                id={`room-type-${room.id}`}
                                value={draft.type}
                                onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`room-price-${room.id}`}>Nightly rate</Label>
                              <Input
                                id={`room-price-${room.id}`}
                                type="number"
                                min={0}
                                value={draft.price}
                                onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`room-capacity-${room.id}`}>Capacity</Label>
                              <Input
                                id={`room-capacity-${room.id}`}
                                type="number"
                                min={1}
                                value={draft.capacity}
                                onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`room-floor-${room.id}`}>Floor</Label>
                              <Input
                                id={`room-floor-${room.id}`}
                                type="number"
                                min={1}
                                value={draft.floorNumber}
                                onChange={(event) => setDraft((current) => ({ ...current, floorNumber: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`room-image-${room.id}`}>Image URL</Label>
                              <Input
                                id={`room-image-${room.id}`}
                                value={draft.imageUrl}
                                onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                                placeholder="https://... or /images/..."
                              />
                              {previewUrl ? (
                                <div className="mt-1 overflow-hidden rounded-md border border-border/70">
                                  <img src={previewUrl} alt="Image preview" className="h-32 w-full object-cover" />
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Available</Label>
                              <Select
                                value={draft.available}
                                onValueChange={(value) => setDraft((current) => ({ ...current, available: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Availability" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Available</SelectItem>
                                  <SelectItem value="false">Unavailable</SelectItem>
                                </SelectContent>
                              </Select>
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
                          <div className="space-y-2">
                            <Label htmlFor={`room-description-${room.id}`}>Description</Label>
                            <Input
                              id={`room-description-${room.id}`}
                              value={draft.description}
                              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                            />
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
        title="Availability notes"
        description="Harbor residences have fewer than 3 rooms remaining for the next two weeks."
      />
    </div>
  );
}
