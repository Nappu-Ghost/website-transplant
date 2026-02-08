// src/app/admin/roster/surgery-rooms/page.tsx
"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar as CalendarIconLucide, Loader2, Scissors } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label'; // <<< IMPORTED LABEL
import { cn } from '@/lib/utils';
import { format, parseISO, isValid as isValidDate, parse as parseTime } from 'date-fns'; // Renamed parse to parseTime
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
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
}

interface SurgeryBookingData {
    id: string | number;
    clinic?: ClinicData | null;
    doctor?: DoctorData | null;
    clinicId: string | number;
    doctorId: string | number;
    date: string;
    startTime: string;
    endTime: string;
    procedure: string;
}

const surgeryBookingFormSchema = z.object({
    clinicId: z.string().nonempty({ message: "Clinic is required." }),
    doctorId: z.string().nonempty({ message: "Doctor is required." }),
    date: z.date({ required_error: "Date is required.", invalid_type_error: "Invalid date format." }),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid start time (HH:mm)." }),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid end time (HH:mm)." }),
    procedure: z.string().min(3, { message: "Procedure description is too short." }).nonempty({ message: "Procedure is required." }),
}).refine(data => {
    if (data.startTime && data.endTime) {
        const baseDate = new Date(); // Use a common base for time parsing
        const startDateTime = parseTime(data.startTime, 'HH:mm', baseDate);
        const endDateTime = parseTime(data.endTime, 'HH:mm', baseDate);
        return endDateTime > startDateTime;
    }
    return true;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

type SurgeryBookingFormData = z.infer<typeof surgeryBookingFormSchema>;

export default function SurgeryRoomsPage() {
    const [bookings, setBookings] = useState<SurgeryBookingData[]>([]);
    const [clinics, setClinics] = useState<ClinicData[]>([]);
    const [doctors, setDoctors] = useState<DoctorData[]>([]);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<SurgeryBookingData | null>(null);

    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<SurgeryBookingData | null>(null);

    const [viewingDate, setViewingDate] = useState<Date | undefined>(new Date());

    const { toast } = useToast();
    const { user: authUser, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const form = useForm<SurgeryBookingFormData>({
        resolver: zodResolver(surgeryBookingFormSchema),
        defaultValues: {
            clinicId: '', doctorId: '', date: new Date(),
            startTime: '09:00', endTime: '10:00', procedure: '',
        },
    });

    const getAuthHeaders = useCallback(() => {
        const token = authUtils.getToken();
        if (!token) {
            toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
            router.push('/login?redirect=/admin/roster/surgery-rooms');
            return null;
        }
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }, [toast, router]);

    const fetchPageData = useCallback(async (filterDate?: Date) => {
        if (!authUser) return;
        setIsLoadingData(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsLoadingData(false); return; }

        try {
            const dateToFilter = filterDate || viewingDate || new Date();
            const formattedDate = format(dateToFilter, 'yyyy-MM-dd');

            const bookingsUrl = `/api/surgery-bookings?date=${formattedDate}`;
            const clinicsUrl = '/api/clinics';
            const doctorsUrl = '/api/doctors';

            const [bookingsRes, clinicsRes, doctorsRes] = await Promise.all([
                fetch(bookingsUrl, { headers }),
                fetch(clinicsUrl, { headers }),
                fetch(doctorsUrl, { headers })
            ]);

            if (!bookingsRes.ok) throw new Error(`Bookings: ${(await bookingsRes.json().catch(() => ({}))).error || bookingsRes.statusText || 'Failed to fetch bookings'}`);
            const bookingsData = await bookingsRes.json();
            setBookings(Array.isArray(bookingsData) ? bookingsData.map((b: any) => ({ ...b, id: String(b.id), clinicId: String(b.clinicId), doctorId: String(b.doctorId) })) : []);

            if (!clinicsRes.ok) throw new Error(`Clinics: ${(await clinicsRes.json().catch(() => ({}))).error || clinicsRes.statusText || 'Failed to fetch clinics'}`);
            const clinicsData = await clinicsRes.json();
            setClinics(Array.isArray(clinicsData) ? clinicsData.map((c: any) => ({ ...c, id: String(c.id) })) : []);

            if (!doctorsRes.ok) throw new Error(`Doctors: ${(await doctorsRes.json().catch(() => ({}))).error || doctorsRes.statusText || 'Failed to fetch doctors'}`);
            const doctorsData = await doctorsRes.json();
            setDoctors(Array.isArray(doctorsData) ? doctorsData.map((d: any) => ({ ...d, id: String(d.id) })) : []);

        } catch (error: any) {
            console.error('Error fetching page data:', error.message);
            if (error.message?.includes('401') || error.message?.includes('403') || error.message?.toLowerCase().includes('not authenticated')) {
                toast({ title: "Authentication Error", description: "Session may have expired. Please login again.", variant: "destructive" });
                router.push('/login?redirect=/admin/roster/surgery-rooms');
            } else {
                toast({ title: "Error Loading Data", description: error.message || "Failed to load page data.", variant: "destructive" });
            }
            setBookings([]); setClinics([]); setDoctors([]);
        } finally {
            setIsLoadingData(false);
        }
    }, [authUser, getAuthHeaders, toast, router, viewingDate]);

    useEffect(() => {
        if (!isAuthLoading && authUser) {
            fetchPageData(viewingDate);
        } else if (!isAuthLoading && !authUser) {
            router.push('/login?redirect=/admin/roster/surgery-rooms');
        }
    }, [authUser, isAuthLoading, fetchPageData, router, viewingDate]); // This effect runs when viewingDate changes too

    const handleAddBooking = () => {
        setEditingBooking(null);
        form.reset({
            clinicId: clinics.length > 0 ? String(clinics[0].id) : '',
            doctorId: doctors.length > 0 ? String(doctors[0].id) : '',
            date: viewingDate || new Date(),
            startTime: '09:00', endTime: '10:00', procedure: '',
        });
        setIsModalOpen(true);
    };

    const handleEditBooking = (booking: SurgeryBookingData) => {
        setEditingBooking(booking);
        form.reset({
            clinicId: String(booking.clinicId),
            doctorId: String(booking.doctorId),
            date: booking.date && isValidDate(parseISO(booking.date)) ? parseISO(booking.date) : new Date(),
            startTime: booking.startTime,
            endTime: booking.endTime,
            procedure: booking.procedure,
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (values: SurgeryBookingFormData) => {
        setIsSubmitting(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsSubmitting(false); return; }

        const payload = {
            ...values,
            date: format(values.date, 'yyyy-MM-dd'),
            clinicId: parseInt(values.clinicId),
            doctorId: parseInt(values.doctorId),
        };

        try {
            const endpoint = editingBooking ? `/api/surgery-bookings/${editingBooking.id}` : '/api/surgery-bookings';
            const method = editingBooking ? 'PUT' : 'POST';
            const response = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to save booking' }));
                throw new Error(errorData.error || errorData.detail || `Failed to ${editingBooking ? 'update' : 'create'} booking`);
            }
            toast({ title: "Success", description: `Surgery booking ${editingBooking ? 'updated' : 'created'} successfully.` });
            setIsModalOpen(false);
            fetchPageData(values.date);
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteDialog = (booking: SurgeryBookingData) => {
        setBookingToDelete(booking);
        setDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!bookingToDelete) return;
        setIsDeleting(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsDeleting(false); setDeleteAlertOpen(false); return; }

        try {
            const response = await fetch(`/api/surgery-bookings/${bookingToDelete.id}`, { method: 'DELETE', headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to delete' }));
                throw new Error(errorData.error || errorData.detail || 'Failed to delete surgery booking');
            }
            setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
            toast({ title: "Success", description: "Surgery booking deleted successfully." });
        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
            setDeleteAlertOpen(false);
            setBookingToDelete(null);
        }
    };

    if (isAuthLoading) {
        return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></main>;
    }
    if (!authUser) {
        return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><p>Redirecting to login...</p></main>;
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                                <Scissors className="h-5 w-5" /> Surgery Room Bookings
                            </CardTitle>
                            <CardDescription>View and manage surgery room schedules.</CardDescription>
                        </div>
                        <Button onClick={handleAddBooking}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Surgery Booking
                        </Button>
                    </div>
                    <div className="mt-6 flex items-center gap-4 border-t pt-4">
                        <Label htmlFor="view-date" className="whitespace-nowrap font-medium">View Schedule for:</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="view-date" variant={"outline"} className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !viewingDate && "text-muted-foreground")}>
                                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                                    {viewingDate ? format(viewingDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={viewingDate} onSelect={setViewingDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Bookings for: {viewingDate ? format(viewingDate, 'PPP') : 'N/A'}
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Clinic</TableHead>
                                    <TableHead>Time Slot</TableHead>
                                    <TableHead>Procedure</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingData && bookings.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="mt-2">Loading bookings...</p></TableCell></TableRow>
                                ) : bookings.length > 0 ? (
                                    bookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.clinic?.name || `Clinic ID ${booking.clinicId}`}</TableCell>
                                            <TableCell className="font-mono text-xs">{booking.startTime} - {booking.endTime}</TableCell>
                                            <TableCell>{booking.procedure}</TableCell>
                                            <TableCell>{booking.doctor?.user?.name || `Doctor ID ${booking.doctorId}`}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}><Edit className="h-4 w-4 mr-1 md:mr-2" />Edit</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(booking)}><Trash2 className="h-4 w-4 mr-1 md:mr-2" />Delete</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">Surgery room is free on this date.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) { form.reset({ clinicId: '', doctorId: '', date: new Date(), startTime: '09:00', endTime: '10:00', procedure: '' }); setEditingBooking(null); }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingBooking ? 'Edit Surgery Booking' : 'New Surgery Booking'}</DialogTitle>
                        <DialogDescription>{editingBooking ? 'Update details for this surgery.' : 'Schedule a new procedure.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="clinicId" render={({ field }) => (
                                <FormItem> <FormLabel>Clinic *</FormLabel>
                                    <Select onValueChange={field.onChange} value={String(field.value || '')} required>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Clinic" /></SelectTrigger></FormControl>
                                        <SelectContent>{clinics.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select> <FormMessage /> </FormItem>)}
                            />
                            <FormField control={form.control} name="doctorId" render={({ field }) => (
                                <FormItem> <FormLabel>Doctor *</FormLabel>
                                    <Select onValueChange={field.onChange} value={String(field.value || '')} required>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger></FormControl>
                                        <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.user?.name || `Doctor ID ${d.id}`}</SelectItem>)}</SelectContent>
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
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                        </PopoverContent>
                                    </Popover> <FormMessage /> </FormItem>)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="startTime" render={({ field }) => (
                                    <FormItem> <FormLabel>Start Time *</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl> <FormMessage /> </FormItem>)}
                                />
                                <FormField control={form.control} name="endTime" render={({ field }) => (
                                    <FormItem> <FormLabel>End Time *</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl> <FormMessage /> </FormItem>)}
                                />
                            </div>
                            <FormField control={form.control} name="procedure" render={({ field }) => (
                                <FormItem> <FormLabel>Procedure *</FormLabel>
                                    <FormControl><Input placeholder="e.g., Root Canal Therapy" {...field} /></FormControl>
                                    <FormMessage /> </FormItem>)}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingBooking ? 'Save Changes' : 'Create Booking'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the surgery booking for
                            <strong className="block mt-1">{bookingToDelete?.procedure} on {bookingToDelete?.date ? format(parseISO(bookingToDelete.date), 'PPP') : ''} with {bookingToDelete?.doctor?.user?.name || `Doctor ID ${bookingToDelete?.doctorId}`}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Booking
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}