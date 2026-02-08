// src/app/admin/clinics/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Ensure useCallback is imported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Building2, Loader2 } from 'lucide-react'; // Added Building2
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth'; // For auth state
import { auth as authUtils } from '@/lib/auth'; // For getToken
import { useRouter } from 'next/navigation';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
  imageUrl: string | null;
  rooms: number;
  beds: number;
  surgeryRooms: number;
  status: string;
}

// Minimal type for images fetched for the select dropdown
interface ClinicImage {
  name: string;
  path: string;
}


export default function ClinicManagementPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Partial<Clinic> | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For overall page data loading
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [isEditing, setIsEditing] = useState(false);
  const [clinicImages, setClinicImages] = useState<ClinicImage[]>([]);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const { toast } = useToast();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const getAuthHeaders = useCallback((contentType: string = 'application/json') => {
    const token = authUtils.getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
      // router.push('/login?redirect=/admin/clinics'); // Redirect is better handled by page's useEffect
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': contentType,
    };
  }, [toast]); // Removed router, toast is enough. Page effect handles redirect.

  const fetchClinics = useCallback(async () => {
    setIsLoading(true);
    // GET for clinics is public, so token not strictly needed for this specific fetch to /api/clinics
    // but if /api/clinics Next.js route itself had some auth check, it would be.
    // For consistency with other admin fetches, we can still try to get headers.
    const headersForGet = getAuthHeaders('application/json'); // Or just {} if truly public
    // If public, headers for GET might not need Authorization.
    // For now, let's assume /api/clinics (Next.js route) for GET is public and doesn't need auth header.

    try {
      const response = await fetch('/api/clinics'); // No auth header needed if Next.js API route for GET /clinics is public
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Failed to fetch clinics: ${response.statusText}`);
      }
      const data = await response.json();
      setClinics(Array.isArray(data) ? data.map((c: any) => ({ ...c, id: String(c.id) })) : []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, toast]); // Include getAuthHeaders if it were used in the fetch above

  const fetchClinicImages = useCallback(async () => {
    // Assuming clinic images are public or auth is handled by its Next.js API route
    try {
      const response = await fetch('/api/clinic-images');
      if (!response.ok) throw new Error('Failed to fetch clinic images');
      const data = await response.json();
      setClinicImages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch clinic images.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.push('/login?redirect=/admin/clinics');
    } else if (!isAuthLoading && authUser) {
      fetchClinics();
      fetchClinicImages();
    }
  }, [authUser, isAuthLoading, fetchClinics, fetchClinicImages, router]);


  const handleAddClinic = () => {
    setCurrentClinic({ status: 'ACTIVE', imageUrl: 'none', rooms: 3, beds: 0, surgeryRooms: 1 });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    setCurrentClinic({ ...clinic, imageUrl: clinic.imageUrl || 'none' });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClinic = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setDeleteAlertOpen(true);
  };

  const confirmDeleteClinic = async () => {
    if (!clinicToDelete) return;
    setIsDeleting(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/clinics/${clinicToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': headers.Authorization }, // Only auth header for DELETE
      });

      if (!response.ok) {
        if (response.status === 204) { // Handle 204 as success
          // continue to success logic
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to delete clinic' }));
          throw new Error(errorData.error || errorData.detail || 'Failed to delete clinic');
        }
      }
      setClinics(clinics.filter(c => c.id !== clinicToDelete.id));
      toast({ title: "Success", description: "Clinic deleted successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
      setClinicToDelete(null);
    }
  };

  const handleSaveClinic = async () => {
    if (!currentClinic?.name || !currentClinic?.address) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and address are required." });
      return;
    }
    setIsSubmitting(true);
    const headers = getAuthHeaders(); // This gets { Authorization, Content-Type }

    console.log("[ClinicPage SaveClinic] Token from authUtils.getToken():", authUtils.getToken());
    console.log("[ClinicPage SaveClinic] Headers being prepared:", headers);


    if (!headers) {
      setIsSubmitting(false);
      return; // getAuthHeaders already handled toast & redirect
    }

    try {
      const clinicData = {
        name: currentClinic.name,
        address: currentClinic.address,
        phone: currentClinic.phone || null,
        openingHours: currentClinic.openingHours || null,
        imageUrl: currentClinic.imageUrl === 'none' ? null : currentClinic.imageUrl,
        rooms: Number(currentClinic.rooms) || 0,
        beds: Number(currentClinic.beds) || 0,
        surgeryRooms: Number(currentClinic.surgeryRooms) || 0,
        status: currentClinic.status || 'ACTIVE',
      };

      const response = await fetch(
        isEditing ? `/api/clinics/${currentClinic.id}` : '/api/clinics',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: headers, // Pass the retrieved headers
          body: JSON.stringify(clinicData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to save clinic' }));
        throw new Error(error.message || error.detail || 'Failed to save clinic');
      }
      const savedClinic = await response.json();
      if (isEditing) {
        setClinics(clinics.map(c => c.id === savedClinic.id ? savedClinic : c));
      } else {
        setClinics(prevClinics => [savedClinic, ...prevClinics]);
      }
      setIsModalOpen(false);
      setCurrentClinic(null);
      toast({ title: "Success", description: `Clinic ${isEditing ? 'updated' : 'created'} successfully.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Clinic, value: string | number) => {
    if (currentClinic) {
      setCurrentClinic({ ...currentClinic, [field]: value });
    }
  };

  if (isAuthLoading) {
    return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></main>;
  }
  if (!authUser) { // Should be redirected by useEffect if this state is reached after loading
    return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><p>Redirecting to login...</p></main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Clinic Management
              </CardTitle>
              <CardDescription>Manage dental clinic locations and their facilities.</CardDescription>
            </div>
            <Button onClick={handleAddClinic}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Clinic
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Opening Hours</TableHead>
                  <TableHead className="text-center">Rooms</TableHead>
                  <TableHead className="text-center">Beds</TableHead>
                  <TableHead className="text-center">Surgery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && clinics.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> <p>Loading clinics...</p></TableCell></TableRow>
                ) : clinics.length > 0 ? (
                  clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {clinic.imageUrl && clinic.imageUrl !== 'none' && (<img src={clinic.imageUrl} alt={clinic.name} className="w-8 h-8 rounded object-cover" />)}
                          {clinic.name}
                        </div>
                      </TableCell>
                      <TableCell>{clinic.address}</TableCell>
                      <TableCell>{clinic.phone || '-'}</TableCell>
                      <TableCell>{clinic.openingHours || '-'}</TableCell>
                      <TableCell className="text-center">{clinic.rooms}</TableCell>
                      <TableCell className="text-center">{clinic.beds}</TableCell>
                      <TableCell className="text-center">{clinic.surgeryRooms}</TableCell>
                      <TableCell><Badge variant={clinic.status === 'ACTIVE' ? 'default' : 'secondary'}>{clinic.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClinic(clinic)} className="mr-2 text-primary hover:text-primary/80"><Edit className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClinic(clinic)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground h-24">No clinics found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{isEditing ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle><DialogDescription>{isEditing ? 'Update clinic details.' : 'Add a new clinic location.'}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name *</Label><Input id="name" className="col-span-3" value={currentClinic?.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="address" className="text-right">Address *</Label><Input id="address" className="col-span-3" value={currentClinic?.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Phone</Label><Input id="phone" className="col-span-3" value={currentClinic?.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="openingHours" className="text-right">Opening Hours</Label><Input id="openingHours" className="col-span-3" value={currentClinic?.openingHours || ''} onChange={(e) => handleInputChange('openingHours', e.target.value)} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rooms" className="text-right">Rooms</Label><Input id="rooms" type="number" min="0" className="col-span-3" value={currentClinic?.rooms || 0} onChange={(e) => handleInputChange('rooms', Number(e.target.value))} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="beds" className="text-right">Beds</Label><Input id="beds" type="number" min="0" className="col-span-3" value={currentClinic?.beds || 0} onChange={(e) => handleInputChange('beds', Number(e.target.value))} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="surgeryRooms" className="text-right">Surgery Rms</Label><Input id="surgeryRooms" type="number" min="0" className="col-span-3" value={currentClinic?.surgeryRooms || 0} onChange={(e) => handleInputChange('surgeryRooms', Number(e.target.value))} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="status" className="text-right">Status</Label><Select value={currentClinic?.status || 'ACTIVE'} onValueChange={(value) => handleInputChange('status', value)}><SelectTrigger id="status" className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="image" className="text-right">Image</Label><div className="col-span-3"><Select value={currentClinic?.imageUrl || 'none'} onValueChange={(value) => handleInputChange('imageUrl', value)}><SelectTrigger id="image"><SelectValue placeholder="Select image" /></SelectTrigger><SelectContent>{clinicImages.length > 0 ? clinicImages.map((image) => (<SelectItem key={image.path} value={image.path}><div className="flex items-center gap-2"><img src={image.path} alt={image.name} className="w-6 h-6 object-cover rounded" />{image.name}</div></SelectItem>)) : <SelectItem value="none" disabled>No images available</SelectItem>}<SelectItem value="none">No image</SelectItem></SelectContent></Select>{currentClinic?.imageUrl && currentClinic.imageUrl !== 'none' && (<div className="mt-2"><img src={currentClinic.imageUrl} alt="Current" className="w-20 h-20 object-cover rounded" /></div>)}</div></div>
          </div>
          <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="button" onClick={handleSaveClinic} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Clinic</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the clinic: <span className="font-semibold">{clinicToDelete?.name}</span>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteClinic} disabled={isDeleting} className="bg-destructive hover:bg-destructive/80">{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};