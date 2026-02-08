// src/app/book-appointment/page.tsx
"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { User as AuthUserType } from '@/lib/auth';
import { auth as authUtils } from '@/lib/auth'; // For getToken
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ClipboardIcon, Loader2, Calendar as CalendarIconLucide } from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

interface Clinic { id: string | number; name: string; }
interface Service { id: string | number; name: string; priceMorning: number; priceAfternoon: number; priceEvening: number; }
interface Doctor { id: string | number; user?: { name?: string | null; }; /* Add other fields if needed */ }

export default function BookAppointmentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useAuth(); // Use user from useAuth

  const [isPageDataLoading, setIsPageDataLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]); // Initialize as empty array

  const [timeSlots] = useState([
    { id: '09:00', time: '09:00', label: '09:00 AM' }, { id: '09:30', time: '09:30', label: '09:30 AM' },
    { id: '10:00', time: '10:00', label: '10:00 AM' }, { id: '10:30', time: '10:30', label: '10:30 AM' },
    { id: '11:00', time: '11:00', label: '11:00 AM' }, { id: '11:30', time: '11:30', label: '11:30 AM' },
    { id: '13:00', time: '13:00', label: '01:00 PM' }, { id: '13:30', time: '13:30', label: '01:30 PM' },
    { id: '14:00', time: '14:00', label: '02:00 PM' }, { id: '14:30', time: '14:30', label: '02:30 PM' },
    { id: '15:00', time: '15:00', label: '03:00 PM' }, { id: '15:30', time: '15:30', label: '03:30 PM' },
    { id: '16:00', time: '16:00', label: '04:00 PM' }, { id: '16:30', time: '16:30', label: '04:30 PM' },
  ]);
  const [formData, setFormData] = useState({
    clinicId: '', serviceId: '', doctorId: '', // Empty string for no selection
    timeSlot: '', patientName: '', patientEmail: '', notes: '',
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<string>('N/A');

  const getAuthHeaders = useCallback((contentType: string = 'application/json') => {
    const token = authUtils.getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
      router.push('/login?redirect=/book-appointment');
      return null;
    }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': contentType };
  }, [toast, router]);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      toast({ title: "Authentication Required", description: "Please log in to book an appointment.", variant: "destructive" });
      router.push('/login?redirect=/book-appointment');
    } else if (!isAuthLoading && authUser) {
      setFormData(prev => ({ ...prev, patientName: authUser.name || '', patientEmail: authUser.email || '' }));
    }
  }, [authUser, isAuthLoading, router, toast]);

  useEffect(() => {
    if (authUser && !isAuthLoading) {
      const fetchData = async () => {
        setIsPageDataLoading(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsPageDataLoading(false); return; }

        try {
          const [clinicsRes, servicesRes] = await Promise.all([
            fetch('/api/clinics', { headers: { 'Authorization': headers.Authorization } }), // GETs don't need Content-Type
            fetch('/api/services', { headers: { 'Authorization': headers.Authorization } })
          ]);

          if (!clinicsRes.ok) throw new Error(`Clinics: ${(await clinicsRes.json().catch(() => ({}))).error || clinicsRes.statusText}`);
          const clinicsData = await clinicsRes.json();
          setClinics(Array.isArray(clinicsData) ? clinicsData.map((c: any) => ({ ...c, id: String(c.id) })) : []);

          if (!servicesRes.ok) throw new Error(`Services: ${(await servicesRes.json().catch(() => ({}))).error || servicesRes.statusText}`);
          const servicesData = await servicesRes.json();
          setServices(Array.isArray(servicesData) ? servicesData.map((s: any) => ({ ...s, id: String(s.id) })) : []);

        } catch (error: any) {
          console.error('Error fetching initial booking data:', error.message);
          toast({ title: "Data Load Error", description: error.message, variant: "destructive" });
        } finally {
          setIsPageDataLoading(false);
        }
      };
      fetchData();
    }
  }, [authUser, isAuthLoading, getAuthHeaders, toast]);

  useEffect(() => {
    if (formData.clinicId && authUser && !isAuthLoading) {
      const fetchDoctorsForClinic = async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
          const res = await fetch(`/api/doctors?clinicId=${formData.clinicId}`, { headers: { 'Authorization': headers.Authorization } });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.detail || `Failed to fetch doctors: ${res.statusText}`);
          }
          const data = await res.json();
          console.log('Fetched doctors for clinic:', formData.clinicId, data); // Log fetched doctors
          setDoctors(Array.isArray(data) ? data.map((d: any) => ({ ...d, id: String(d.id) })) : []);
        } catch (error: any) {
          console.error('Error fetching doctors:', error.message);
          toast({ title: "Error", description: `Could not load doctors: ${error.message}`, variant: "destructive" });
          setDoctors([]);
        }
      };
      fetchDoctorsForClinic();
    } else {
      setDoctors([]);
    }
  }, [formData.clinicId, authUser, isAuthLoading, getAuthHeaders, toast]);

  useEffect(() => {
    if (formData.serviceId && formData.timeSlot && services.length > 0) {
      const service = services.find(s => String(s.id) === formData.serviceId);
      if (service) {
        const hour = parseInt(formData.timeSlot.split(':')[0]);
        let priceVal = 0;
        if (hour < 12) priceVal = service.priceMorning;
        else if (hour < 17) priceVal = service.priceAfternoon;
        else priceVal = service.priceEvening;
        setCalculatedPrice(`$${priceVal.toFixed(2)}`);
      } else { setCalculatedPrice('N/A'); }
    } else { setCalculatedPrice('N/A'); }
  }, [formData.serviceId, formData.timeSlot, services]);
  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value || '' }));
    if (field === 'clinicId') {
      setFormData(prev => ({ ...prev, doctorId: '' })); // Reset doctor if clinic changes
    }
  };

  const handleBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!authUser || !selectedDate || !formData.timeSlot || !formData.clinicId || !formData.serviceId) {
      toast({ title: "Missing Information", description: "Please select a clinic, service, date, and time slot.", variant: "destructive" });
      return;
    }
    setIsBooking(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsBooking(false); return; }

    try {
      const [hours, minutes] = formData.timeSlot.split(':');
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      let numericPrice = 0;
      const service = services.find(s => String(s.id) === formData.serviceId);
      if (service) {
        const hour = parseInt(hours);
        if (hour < 12) numericPrice = service.priceMorning;
        else if (hour < 17) numericPrice = service.priceAfternoon;
        else numericPrice = service.priceEvening;
      } else {
        setIsBooking(false);
        toast({ title: "Error", description: "Selected service not found for price calculation.", variant: "destructive" });
        return;
      }

      const bookingPayload = {
        clinicId: parseInt(formData.clinicId),
        serviceId: parseInt(formData.serviceId),
        doctorId: formData.doctorId === 'any' || formData.doctorId === '' ? null : parseInt(formData.doctorId),
        appointmentTime: appointmentDateTime.toISOString(),
        customerId: typeof authUser.id === 'string' ? parseInt(authUser.id) : authUser.id,
        price: numericPrice,
        notes: formData.notes,
        // patientName and patientEmail are not standard fields for AppointmentCreate schema
        // The backend should derive patient info from customerId (authenticated user)
      };

      const response = await fetch('/api/appointments', {
        method: 'POST', headers, body: JSON.stringify(bookingPayload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to book appointment');
      }
      setBookingReference(data.bookingReference || 'N/A');
      setShowSuccessDialog(true);
      toast({ title: "Booking Successful!", description: "Your appointment has been confirmed." });      setFormData({
        clinicId: '', serviceId: '', doctorId: '', timeSlot: '', notes: '',
        patientName: authUser.name || '', patientEmail: authUser.email || '',
      });
      setSelectedDate(new Date());
    } catch (error: any) {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-grow items-center justify-center"> <Loader2 className="h-12 w-12 animate-spin text-primary" /> </main>
        <AppFooter />
      </div>
    );
  }
  if (!authUser) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-grow items-center justify-center"> <p>Redirecting to login...</p> </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-grow bg-gradient-to-b from-background to-teal-50 py-12 md:py-20">
        <motion.div className="container mx-auto px-4" initial="hidden" animate="visible" variants={fadeIn}>
          <h1 className="mb-8 text-center text-3xl font-bold text-primary md:text-4xl">Book Your Appointment</h1>
          <Card className="mx-auto max-w-3xl shadow-lg">
            <CardHeader><CardTitle className="text-center text-2xl text-primary">Select Your Preferences</CardTitle></CardHeader>
            <CardContent>
              {isPageDataLoading && (!clinics.length || !services.length) ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Loading options...</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="clinic">Clinic *</Label>
                      <Select value={formData.clinicId} onValueChange={(value) => handleInputChange('clinicId', value)} required>
                        <SelectTrigger id="clinic"><SelectValue placeholder="Select a clinic" /></SelectTrigger>
                        <SelectContent>{clinics.map((clinic) => (<SelectItem key={clinic.id} value={String(clinic.id)}>{clinic.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service">Service *</Label>
                      <Select value={formData.serviceId} onValueChange={(value) => handleInputChange('serviceId', value)} required>
                        <SelectTrigger id="service"><SelectValue placeholder="Select a service" /></SelectTrigger>
                        <SelectContent>{services.map((service) => (<SelectItem key={service.id} value={String(service.id)}>{service.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="doctor">Preferred Doctor</Label>
                    <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)} disabled={!formData.clinicId || doctors.length === 0}>                      <SelectTrigger id="doctor"><SelectValue placeholder={!formData.clinicId ? "Select a clinic first" : (doctors.length === 0 ? "No doctors for this clinic" : "Select a doctor")} /></SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (<SelectItem key={doctor.id} value={String(doctor.id)}>{doctor.user?.name || `Doctor ID ${doctor.id}`}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">                    <div className="rounded-md border p-3">
                      <Label className="block text-center mb-2 font-semibold">Date *</Label>
                      <div className="min-w-[280px]">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </div>
                    </div>
                    <div className="space-y-4 pt-1">
                      <div>
                        <Label htmlFor="timeSlot">Available Time Slot *</Label>
                        <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)} required>
                          <SelectTrigger id="timeSlot"><SelectValue placeholder="Select a time" /></SelectTrigger>
                          <SelectContent>{timeSlots.map((slot) => (<SelectItem key={slot.id} value={slot.time}>{slot.label}</SelectItem>))}</SelectContent>
                        </Select>
                        {formData.serviceId && formData.timeSlot && (<p className="mt-2 text-sm font-medium text-primary">Estimated Price: {calculatedPrice}</p>)}
                      </div>
                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Any specific requests..." rows={3} />
                      </div>
                    </div>
                  </div>
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="text-xl">Your Information</CardTitle><CardDescription>This will be used for the booking. Auto-filled if logged in.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label htmlFor="patientName">Patient Name *</Label><Input id="patientName" value={formData.patientName} onChange={(e) => handleInputChange('patientName', e.target.value)} required /></div>
                      <div><Label htmlFor="patientEmail">Patient Email *</Label><Input id="patientEmail" type="email" value={formData.patientEmail} onChange={(e) => handleInputChange('patientEmail', e.target.value)} required /></div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={isBooking || isPageDataLoading}>
                      {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <AppFooter />
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Booking Successful!</DialogTitle><DialogDescription>Your appointment is confirmed. Reference: </DialogDescription></DialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <Input id="bookingRef" value={bookingReference} readOnly className="flex-1 font-mono text-center" />
            <Button type="button" size="sm" variant="outline" onClick={() => { if (bookingReference) { navigator.clipboard.writeText(bookingReference); toast({ title: "Copied!" }); } }}>
              <ClipboardIcon className="h-4 w-4" /><span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start mt-4"><Button type="button" onClick={() => { setShowSuccessDialog(false); router.push('/'); }}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}