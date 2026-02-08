// src/app/admin/doctors/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Stethoscope, AtSign, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label'; // <<< IMPORT ADDED HERE
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { auth as authUtils, User as AuthUserType } from '@/lib/auth'; // Renamed User to AuthUserType
import { useRouter } from 'next/navigation';

interface UserData {
  id: string | number;
  name: string | null;
  email: string;
  role: string;
}

interface ClinicData {
  id: string | number;
  name: string;
}

interface DoctorData {
  id: string | number;
  specialty: string | null;
  status: string;
  user?: UserData | null;
  clinic?: ClinicData | null;
  clinicId: string | number;
  userId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
}

const CREATE_NEW_USER_DOCTOR_VALUE = "_CREATE_NEW_DOCTOR_";

const doctorFormSchema = z.object({
  userId: z.string().optional().nullable().or(z.literal(CREATE_NEW_USER_DOCTOR_VALUE)).or(z.literal('')),
  userEmail: z.string().email({ message: "Valid email required if creating new user." }).optional().or(z.literal('')),
  userName: z.string().min(2, { message: "Name must be at least 2 characters if creating new user." }).optional().or(z.literal('')),
  userPassword: z.string().min(8, { message: "Password must be at least 8 characters if creating new user." }).optional().or(z.literal('')),
  clinicId: z.string().nonempty({ message: "Clinic selection is required." }),
  specialty: z.string().optional().nullable(),
  status: z.string().nonempty({ message: "Status is required." }),
}).refine(data => {
  if (data.userId === CREATE_NEW_USER_DOCTOR_VALUE || data.userId === '' || !data.userId) {
    if (!data.userEmail) return false;
    try { z.string().email().parse(data.userEmail); } catch (e) { return false; }
    if (!data.userName || data.userName.length < 2) return false;
    if (!data.userPassword || data.userPassword.length < 8) return false;
  }
  return true;
}, {
  message: "For new user: valid Email, Name (min 2 chars), and Password (min 8 chars) are required.",
  path: ["userEmail"],
});

type DoctorFormData = z.infer<typeof doctorFormSchema>;

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorData | null>(null);

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorData | null>(null);

  const { toast } = useToast();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      userId: CREATE_NEW_USER_DOCTOR_VALUE, userEmail: '', userName: '', userPassword: '',
      clinicId: '', specialty: '', status: 'ACTIVE',
    },
  });

  const getAuthHeaders = useCallback(() => {
    const token = authUtils.getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
      router.push('/login?redirect=/admin/doctors');
      return null;
    }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, [toast, router]);


  const fetchAllData = useCallback(async () => {
    if (!authUser) return;
    setIsLoadingData(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsLoadingData(false); return; }

    try {
      const [doctorsRes, clinicsRes, usersRes] = await Promise.all([
        fetch('/api/doctors', { headers }),
        fetch('/api/clinics', { headers }),
        fetch('/api/users?role=DOCTOR&includeUnassigned=true', { headers })
      ]);

      if (!doctorsRes.ok) throw new Error(`Doctors: ${(await doctorsRes.json().catch(() => ({}))).error || doctorsRes.statusText}`);
      const doctorsData = await doctorsRes.json();
      setDoctors(Array.isArray(doctorsData) ? doctorsData.map((d: any) => ({ ...d, id: String(d.id), clinicId: String(d.clinicId), userId: d.userId ? String(d.userId) : null })) : []);

      if (!clinicsRes.ok) throw new Error(`Clinics: ${(await clinicsRes.json().catch(() => ({}))).error || clinicsRes.statusText}`);
      const clinicsData = await clinicsRes.json();
      setClinics(Array.isArray(clinicsData) ? clinicsData.map((c: any) => ({ ...c, id: String(c.id) })) : []);

      if (!usersRes.ok) throw new Error(`Users: ${(await usersRes.json().catch(() => ({}))).error || usersRes.statusText}`);
      const usersData = await usersRes.json();
      setAvailableUsers(Array.isArray(usersData) ? usersData.map((u: any) => ({ ...u, id: String(u.id) })) : []);

    } catch (error: any) {
      console.error('Error fetching page data:', error.message);
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.toLowerCase().includes('not authenticated')) {
        toast({ title: "Authentication Error", description: "Session may have expired. Please login again.", variant: "destructive" });
        router.push('/login?redirect=/admin/doctors');
      } else {
        toast({ title: "Error Loading Data", description: error.message || "Failed to load initial page data.", variant: "destructive" });
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [authUser, getAuthHeaders, toast, router]);

  useEffect(() => {
    if (!isAuthLoading && authUser) {
      fetchAllData();
    } else if (!isAuthLoading && !authUser) {
      router.push('/login?redirect=/admin/doctors');
    }
  }, [authUser, isAuthLoading, fetchAllData, router]);


  const handleAddDoctor = () => {
    setEditingDoctor(null);
    form.reset({
      userId: CREATE_NEW_USER_DOCTOR_VALUE, userEmail: '', userName: '', userPassword: '',
      clinicId: clinics.length > 0 ? String(clinics[0].id) : '',
      specialty: '', status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleEditDoctor = (doctor: DoctorData) => {
    setEditingDoctor(doctor);
    form.reset({
      userId: doctor.userId ? String(doctor.userId) : CREATE_NEW_USER_DOCTOR_VALUE,
      userEmail: '', userName: '', userPassword: '',
      clinicId: String(doctor.clinicId), specialty: doctor.specialty || '',
      status: doctor.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: DoctorFormData) => {
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsSubmitting(false); return; }

    const payload: any = {
      clinicId: parseInt(values.clinicId),
      specialty: values.specialty || null,
      status: values.status,
    };

    const isCreatingNewUser = values.userId === CREATE_NEW_USER_DOCTOR_VALUE || !values.userId;

    if (editingDoctor) {
      payload.userId = editingDoctor.userId ? parseInt(String(editingDoctor.userId)) : undefined;
    } else {
      if (!isCreatingNewUser && values.userId) {
        payload.userId = parseInt(values.userId);
      } else if (isCreatingNewUser) {
        if (values.userEmail && values.userName && values.userPassword) {
          payload.userEmail = values.userEmail;
          payload.userName = values.userName;
          payload.userPassword = values.userPassword;
        } else {
          toast({ title: "Input Error", description: "For a new doctor user, email, name, and password are required.", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
      } else {
        toast({ title: "Input Error", description: "Please either link an existing user or provide details to create a new one.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(
        editingDoctor ? `/api/doctors/${editingDoctor.id}` : '/api/doctors',
        { method: editingDoctor ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Failed` }));
        throw new Error(errorData.error || errorData.detail || `Failed to ${editingDoctor ? 'update' : 'create'} doctor`);
      }
      toast({ title: "Success", description: `Doctor profile ${editingDoctor ? 'updated' : 'created'} successfully.` });
      setIsModalOpen(false);
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (doctor: DoctorData) => {
    setDoctorToDelete(doctor);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    setIsDeleting(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsDeleting(false); setDeleteAlertOpen(false); return; }

    try {
      const response = await fetch(`/api/doctors/${doctorToDelete.id}`, { method: 'DELETE', headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete' }));
        throw new Error(errorData.error || errorData.detail || 'Failed to delete doctor profile');
      }
      setDoctors(prev => prev.filter(d => d.id !== doctorToDelete.id));
      toast({ title: "Success", description: "Doctor profile deleted successfully." });
    } catch (error: any) {
      toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
      setDoctorToDelete(null);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <p>Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Doctor Management
              </CardTitle>
              <CardDescription>Manage dental specialists, their linked user accounts, and clinic assignments.</CardDescription>
            </div>
            <Button onClick={handleAddDoctor}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Doctor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData && doctors.length === 0 && !isAuthLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="mt-2 text-muted-foreground">Loading doctors...</p></TableCell></TableRow>
                ) : doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.user?.name || 'N/A (User not linked)'}</TableCell>
                      <TableCell>{doctor.user?.email || 'N/A'}</TableCell>
                      <TableCell>{doctor.clinic?.name || 'Unassigned'}</TableCell>
                      <TableCell>{doctor.specialty || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={doctor.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {doctor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDoctor(doctor)}>
                            <Edit className="h-4 w-4 mr-1 md:mr-2" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(doctor)}>
                            <Trash2 className="h-4 w-4 mr-1 md:mr-2" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                      No doctors found. Click "Add New Doctor" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          form.reset({
            userId: CREATE_NEW_USER_DOCTOR_VALUE,
            clinicId: clinics.length > 0 ? String(clinics[0].id) : '',
            specialty: '',
            status: 'ACTIVE',
            userEmail: '',
            userName: '',
            userPassword: ''
          });
          setEditingDoctor(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor Profile'}</DialogTitle>
            <DialogDescription>
              {editingDoctor ? 'Update the doctor details.' : 'Assign to a clinic and link to a user account or create a new one.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              {!editingDoctor && (
                <>
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Existing User (Role: DOCTOR)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value && value !== CREATE_NEW_USER_DOCTOR_VALUE) {
                              form.setValue('userEmail', '');
                              form.setValue('userName', '');
                              form.setValue('userPassword', '');
                            }
                          }}
                          value={field.value || CREATE_NEW_USER_DOCTOR_VALUE}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder="Select user or create new below" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value={CREATE_NEW_USER_DOCTOR_VALUE}>-- Create New User for this Doctor --</SelectItem>
                            {availableUsers.filter(u => u.role === 'DOCTOR').map((user) => ( // Ensure this filter is appropriate
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.name || user.email} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(form.watch("userId") === CREATE_NEW_USER_DOCTOR_VALUE || !form.watch("userId")) && (
                    <div className="p-3 border rounded-md space-y-3 bg-muted/50">
                      <p className="text-sm font-medium text-muted-foreground">Create New User Account for Doctor:</p>
                      <FormField control={form.control} name="userName" render={({ field }) => (<FormItem> <FormLabel>Doctor's Full Name *</FormLabel> <FormControl><Input placeholder="Dr. Jane Smith" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                      <FormField control={form.control} name="userEmail" render={({ field }) => (<FormItem> <FormLabel>Doctor's Email *</FormLabel> <FormControl><Input type="email" placeholder="doctor@example.com" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                      <FormField control={form.control} name="userPassword" render={({ field }) => (<FormItem> <FormLabel>Password for New User *</FormLabel> <FormControl><Input type="password" placeholder="Min. 8 characters" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                    </div>
                  )}
                </>
              )}
              {editingDoctor && editingDoctor.user && (
                <div>
                  <Label>Linked User Account</Label>
                  <Input value={`${editingDoctor.user.name || 'N/A'} (${editingDoctor.user.email})`} disabled
                    className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed" />
                </div>
              )}
              {editingDoctor && !editingDoctor.user && (
                <div className="p-3 border border-dashed border-destructive rounded-md">
                  <Label className="text-destructive">User Account Not Linked</Label>
                  <p className="text-xs text-muted-foreground">This doctor profile is not currently linked to an active user account.</p>
                </div>
              )}
              <FormField control={form.control} name="clinicId" render={({ field }) => (<FormItem> <FormLabel>Assign to Clinic *</FormLabel> <Select onValueChange={field.onChange} value={String(field.value || '')} required> <FormControl><SelectTrigger><SelectValue placeholder="Select a clinic" /></SelectTrigger></FormControl> <SelectContent> {clinics.map((clinic) => (<SelectItem key={clinic.id} value={String(clinic.id)}>{clinic.name}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem>)} />
              <FormField control={form.control} name="specialty" render={({ field }) => (<FormItem> <FormLabel>Specialty</FormLabel> <FormControl><Input placeholder="e.g., Orthodontics, Pediatrics" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem> <FormLabel>Profile Status *</FormLabel> <Select onValueChange={field.onChange} value={field.value} required> <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="ACTIVE">Active</SelectItem> <SelectItem value="INACTIVE">Inactive</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem>)} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingDoctor ? 'Save Changes' : 'Create Doctor Profile'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the doctor profile for:
              <strong className="block mt-1"> {doctorToDelete?.user?.name || doctorToDelete?.user?.email || `Doctor ID ${doctorToDelete?.id}`}</strong>.
              This will not delete the associated user account (if any), only the doctor profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Doctor Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}