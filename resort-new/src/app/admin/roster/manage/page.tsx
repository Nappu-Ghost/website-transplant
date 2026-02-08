// src/app/admin/roster/manage/page.tsx
"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar as CalendarIconLucide, Loader2, Clock } from 'lucide-react'; // Renamed Calendar import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar component
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
// We will use fetch directly to Next.js API routes, so api.ts is not directly used here for these calls
// import api from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { auth as authUtils, User as AuthUserType } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface UserData {
    id: string | number;
    name: string | null;
    email?: string;
}

interface ClinicData {
    id: string | number;
    name: string;
}

interface DoctorData {
    id: string | number;
    user?: UserData | null;
    clinicId?: string | number;
}

interface ShiftData {
    id: string | number;
    doctor?: DoctorData | null;
    clinic?: ClinicData | null;
    doctorId: string | number;
    clinicId: string | number;
    date: string;
    shiftTime: string;
    room: string | null;
    createdAt?: string;
    updatedAt?: string;
}

const ShiftTimeEnum = {
    MORNING: "MORNING",
    AFTERNOON: "AFTERNOON",
    EVENING: "EVENING",
} as const;

type ShiftTimeKeys = keyof typeof ShiftTimeEnum;

const shiftFormSchema = z.object({
    doctorId: z.string().nonempty({ message: "Doctor is required." }),
    clinicId: z.string().nonempty({ message: "Clinic is required." }),
    date: z.date({ required_error: "Date is required.", invalid_type_error: "Invalid date format." }),
    shiftTime: z.nativeEnum(ShiftTimeEnum, { errorMap: () => ({ message: "Shift time is required." }) }),
    room: z.string().optional().nullable(),
});

type ShiftFormData = z.infer<typeof shiftFormSchema>;

export default function ManageShiftsPage() {
    const [shifts, setShifts] = useState<ShiftData[]>([]);
    const [doctors, setDoctors] = useState<DoctorData[]>([]);
    const [clinics, setClinics] = useState<ClinicData[]>([]);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<ShiftData | null>(null);

    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState<ShiftData | null>(null);

    const { toast } = useToast();
    const { user: authUser, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const form = useForm<ShiftFormData>({
        resolver: zodResolver(shiftFormSchema),
        defaultValues: {
            doctorId: '', clinicId: '', date: new Date(),
            shiftTime: ShiftTimeEnum.MORNING, room: '',
        },
    });

    const getAuthHeaders = useCallback(() => {
        const token = authUtils.getToken();
        if (!token) {
            toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
            router.push('/login?redirect=/admin/roster/manage');
            return null;
        }
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }, [toast, router]);

    const fetchPageData = useCallback(async () => {
        if (!authUser) return;
        setIsLoadingData(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsLoadingData(false); return; }

        try {
            const responses = await Promise.all([
                fetch('/api/shifts', { headers }),
                fetch('/api/doctors', { headers }),
                fetch('/api/clinics', { headers })
            ]);

            const [shiftsRes, doctorsRes, clinicsRes] = responses;

            let shiftsData, doctorsData, clinicsData;

            if (!shiftsRes.ok) {
                const errorData = await shiftsRes.json().catch(() => ({ error: 'Failed to parse shifts error' }));
                throw new Error(`Shifts: ${errorData.error || errorData.detail || shiftsRes.statusText || 'Unknown error'}`);
            }
            shiftsData = await shiftsRes.json();
            setShifts(Array.isArray(shiftsData) ? shiftsData.map((s: any) => ({ ...s, id: String(s.id), doctorId: String(s.doctorId), clinicId: String(s.clinicId) })) : []);

            if (!doctorsRes.ok) {
                const errorData = await doctorsRes.json().catch(() => ({ error: 'Failed to parse doctors error' }));
                throw new Error(`Doctors: ${errorData.error || errorData.detail || doctorsRes.statusText || 'Unknown error'}`);
            }
            doctorsData = await doctorsRes.json();
            setDoctors(Array.isArray(doctorsData) ? doctorsData.map((d: any) => ({ ...d, id: String(d.id), clinicId: d.clinicId ? String(d.clinicId) : undefined })) : []);

            if (!clinicsRes.ok) {
                const errorData = await clinicsRes.json().catch(() => ({ error: 'Failed to parse clinics error' }));
                throw new Error(`Clinics: ${errorData.error || errorData.detail || clinicsRes.statusText || 'Unknown error'}`);
            }
            clinicsData = await clinicsRes.json();
            setClinics(Array.isArray(clinicsData) ? clinicsData.map((c: any) => ({ ...c, id: String(c.id) })) : []);

        } catch (error: any) {
            console.error('Error fetching page data:', error.message);
            if (error.message?.includes('401') || error.message?.includes('403') || error.message?.toLowerCase().includes('not authenticated') || error.message?.toLowerCase().includes('unauthorized')) {
                toast({ title: "Authentication Error", description: "Session may have expired. Please login again.", variant: "destructive" });
                router.push('/login?redirect=/admin/roster/manage');
            } else {
                toast({ title: "Error Loading Data", description: error.message || "Failed to load initial page data.", variant: "destructive" });
            }
            setShifts([]); setDoctors([]); setClinics([]);
        } finally {
            setIsLoadingData(false);
        }
    }, [authUser, getAuthHeaders, toast, router]);

    useEffect(() => {
        if (!isAuthLoading && authUser) {
            fetchPageData();
        } else if (!isAuthLoading && !authUser) {
            router.push('/login?redirect=/admin/roster/manage');
        }
    }, [authUser, isAuthLoading, fetchPageData, router]);

    const handleAddShift = () => {
        setEditingShift(null);
        form.reset({
            doctorId: doctors.length > 0 ? String(doctors[0].id) : '',
            clinicId: clinics.length > 0 ? String(clinics[0].id) : '',
            date: new Date(),
            shiftTime: ShiftTimeEnum.MORNING,
            room: '',
        });
        setIsModalOpen(true);
    };

    const handleEditShift = (shift: ShiftData) => {
        setEditingShift(shift);
        const shiftDate = shift.date && isValidDate(parseISO(shift.date)) ? parseISO(shift.date) : new Date();
        form.reset({
            doctorId: String(shift.doctorId),
            clinicId: String(shift.clinicId),
            date: shiftDate,
            shiftTime: shift.shiftTime as ShiftTimeKeys,
            room: shift.room || '',
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (values: ShiftFormData) => {
        setIsSubmitting(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsSubmitting(false); return; }

        const payload = {
            ...values,
            date: format(values.date, 'yyyy-MM-dd'),
            doctorId: parseInt(values.doctorId),
            clinicId: parseInt(values.clinicId),
        };

        try {
            const endpoint = editingShift ? `/api/shifts/${editingShift.id}` : '/api/shifts';
            const method = editingShift ? 'PUT' : 'POST';
            const response = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to save shift' }));
                throw new Error(errorData.error || errorData.detail || `Failed to ${editingShift ? 'update' : 'create'} shift`);
            }
            toast({ title: "Success", description: `Shift ${editingShift ? 'updated' : 'created'} successfully.` });
            setIsModalOpen(false);
            fetchPageData();
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (shift: ShiftData) => {
        setShiftToDelete(shift);
        setDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!shiftToDelete) return;
        setIsDeleting(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsDeleting(false); setDeleteAlertOpen(false); return; }

        try {
            const response = await fetch(`/api/shifts/${shiftToDelete.id}`, { method: 'DELETE', headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to delete shift' }));
                throw new Error(errorData.error || errorData.detail || 'Failed to delete shift');
            }
            setShifts(prev => prev.filter(s => s.id !== shiftToDelete.id));
            toast({ title: "Success", description: "Shift deleted successfully." });
        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
            setShiftToDelete(null);
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
                                <Clock className="h-5 w-5" /> Manage Doctor Shifts
                            </CardTitle>
                            <CardDescription>Add, edit, or remove doctor schedules.</CardDescription>
                        </div>
                        <Button onClick={handleAddShift}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Shift
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Clinic</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Shift Time</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingData && shifts.length === 0 && !isAuthLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="mt-2 text-muted-foreground">Loading shifts...</p></TableCell></TableRow>
                                ) : shifts.length > 0 ? (
                                    shifts.map((shift) => (
                                        <TableRow key={shift.id}>
                                            <TableCell className="font-medium">{shift.doctor?.user?.name || `Doctor ID ${shift.doctorId}`}</TableCell>
                                            <TableCell>{shift.clinic?.name || `Clinic ID ${shift.clinicId}`}</TableCell>
                                            <TableCell>{shift.date ? format(parseISO(shift.date), 'PPP') : 'N/A'}</TableCell>
                                            <TableCell>{shift.shiftTime}</TableCell>
                                            <TableCell>{shift.room || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditShift(shift)}>
                                                        <Edit className="h-4 w-4 mr-1 md:mr-2" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(shift)}>
                                                        <Trash2 className="h-4 w-4 mr-1 md:mr-2" /> Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                            No shifts scheduled.
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
                if (!open) { form.reset({ doctorId: '', clinicId: '', date: new Date(), shiftTime: ShiftTimeEnum.MORNING, room: '' }); setEditingShift(null); }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
                        <DialogDescription>
                            {editingShift ? 'Update the details for this shift.' : 'Fill in the details to schedule a new shift.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="doctorId" render={({ field }) => (
                                <FormItem> <FormLabel>Doctor *</FormLabel>
                                    <Select onValueChange={field.onChange} value={String(field.value || '')}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {doctors.map((doc) => (
                                                <SelectItem key={doc.id} value={String(doc.id)}>{doc.user?.name || `Doctor ID ${doc.id}`}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select> <FormMessage /> </FormItem>)}
                            />
                            <FormField control={form.control} name="clinicId" render={({ field }) => (
                                <FormItem> <FormLabel>Clinic *</FormLabel>
                                    <Select onValueChange={field.onChange} value={String(field.value || '')}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a clinic" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {clinics.map((clinic) => (
                                                <SelectItem key={clinic.id} value={String(clinic.id)}>{clinic.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select> <FormMessage /> </FormItem>)}
                            />
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col"> <FormLabel>Date *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIconLucide className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus />
                                        </PopoverContent>
                                    </Popover> <FormMessage /> </FormItem>)}
                            />
                            <FormField control={form.control} name="shiftTime" render={({ field }) => (
                                <FormItem> <FormLabel>Shift Time *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select shift time" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.values(ShiftTimeEnum).map((time) => (
                                                <SelectItem key={time} value={time}>{time.charAt(0) + time.slice(1).toLowerCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select> <FormMessage /> </FormItem>)}
                            />
                            <FormField control={form.control} name="room" render={({ field }) => (
                                <FormItem> <FormLabel>Room (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g., Room 101, Surgery A" {...field} value={field.value || ''} /></FormControl>
                                    <FormMessage /> </FormItem>)}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingShift ? 'Save Changes' : 'Create Shift'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this shift?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the shift for:
                            <strong className="block mt-1"> {shiftToDelete?.doctor?.user?.name || `Doctor ID ${shiftToDelete?.doctorId}`} on {shiftToDelete?.date ? format(parseISO(shiftToDelete.date), 'PPP') : ''} ({shiftToDelete?.shiftTime})</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Shift
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}