"use client";

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModalDialog, PageHeader, SectionHeader } from '@/components/shared';
import { hotelService } from '@/lib/api-service';

interface Hotel {
  id: number;
  name: string;
  location: string;
  description?: string | null;
  imageUrl?: string | null;
  floors: number;
}

interface HotelDraft {
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  floors: string;
}

const emptyDraft: HotelDraft = {
  name: '',
  location: '',
  description: '',
  imageUrl: '',
  floors: '1',
};

export default function AdminHotelsPage() {
  const queryClient = useQueryClient();
  const [activeHotelId, setActiveHotelId] = useState<number | null>(null);
  const [draft, setDraft] = useState<HotelDraft>(emptyDraft);

  const hotelsQuery = useQuery<Hotel[]>({
    queryKey: ['hotels', 'admin'],
    queryFn: () => hotelService.list(),
  });

  const createHotelMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => hotelService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels', 'admin'] });
    },
  });

  const updateHotelMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      hotelService.update(String(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels', 'admin'] });
    },
  });

  const handleOpenCreate = () => {
    setActiveHotelId(null);
    setDraft(emptyDraft);
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setActiveHotelId(hotel.id);
    setDraft({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description ?? '',
      imageUrl: hotel.imageUrl ?? '',
      floors: String(hotel.floors ?? 1),
    });
  };

  const handleSave = () => {
    const payload = {
      name: draft.name.trim(),
      location: draft.location.trim(),
      description: draft.description.trim() || undefined,
      imageUrl: draft.imageUrl.trim() || undefined,
      floors: Number(draft.floors || 1),
    };

    if (activeHotelId) {
      updateHotelMutation.mutate({ id: activeHotelId, payload });
    } else {
      createHotelMutation.mutate(payload);
    }
  };

  const isSaving = createHotelMutation.isPending || updateHotelMutation.isPending;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hotels"
        description="Manage properties, locations, and room counts."
      />

      {hotelsQuery.isError ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Unable to load hotels</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {hotelsQuery.error instanceof Error
              ? hotelsQuery.error.message
              : 'Please try again shortly.'}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Property list</CardTitle>
          <ModalDialog
            title="Add hotel"
            description="Create a new property for the resort portfolio."
            trigger={<Button variant="outline" onClick={handleOpenCreate}>Add hotel</Button>}
            footer={
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save hotel'}
              </Button>
            }
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotel-name">Name</Label>
                  <Input
                    id="hotel-name"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Azure Lagoon Resort"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-location">Location</Label>
                  <Input
                    id="hotel-location"
                    value={draft.location}
                    onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                    placeholder="Baa Atoll"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotel-floors">Floors</Label>
                  <Input
                    id="hotel-floors"
                    type="number"
                    min={1}
                    value={draft.floors}
                    onChange={(event) => setDraft((current) => ({ ...current, floors: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-image">Image URL</Label>
                  <Input
                    id="hotel-image"
                    value={draft.imageUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                    placeholder="/images/gallery/hotels/hotel1.jpg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-description">Description</Label>
                <Input
                  id="hotel-description"
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Oceanfront resort with lagoon villas"
                />
              </div>
            </div>
          </ModalDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Floors</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotelsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    Loading hotels...
                  </TableCell>
                </TableRow>
              ) : (hotelsQuery.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No hotels yet.
                  </TableCell>
                </TableRow>
              ) : (
                (hotelsQuery.data ?? []).map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{hotel.name}</p>
                        {hotel.description ? (
                          <p className="text-xs text-muted-foreground">{hotel.description}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{hotel.location}</TableCell>
                    <TableCell>{hotel.floors}</TableCell>
                    <TableCell>
                      <ModalDialog
                        title="Edit hotel"
                        description="Update property details."
                        trigger={
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(hotel)}>
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
                              <Label htmlFor={`hotel-name-${hotel.id}`}>Name</Label>
                              <Input
                                id={`hotel-name-${hotel.id}`}
                                value={draft.name}
                                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`hotel-location-${hotel.id}`}>Location</Label>
                              <Input
                                id={`hotel-location-${hotel.id}`}
                                value={draft.location}
                                onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`hotel-floors-${hotel.id}`}>Floors</Label>
                              <Input
                                id={`hotel-floors-${hotel.id}`}
                                type="number"
                                min={1}
                                value={draft.floors}
                                onChange={(event) => setDraft((current) => ({ ...current, floors: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`hotel-image-${hotel.id}`}>Image URL</Label>
                              <Input
                                id={`hotel-image-${hotel.id}`}
                                value={draft.imageUrl}
                                onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`hotel-description-${hotel.id}`}>Description</Label>
                            <Input
                              id={`hotel-description-${hotel.id}`}
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
        title="Property notes"
        description="Set up hotels before adding rooms and suites to inventory."
      />
    </div>
  );
}
