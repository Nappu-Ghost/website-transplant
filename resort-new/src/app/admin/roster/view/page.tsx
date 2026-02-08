// src/app/admin/roster/view/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIconLucide, Filter, Loader2, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid as isValidDate, isEqual as isDateEqual, startOfDay } from 'date-fns'; // Added isEqual, startOfDay
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import { auth as authUtils } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// --- Interfaces (align with your backend schemas after toCamelCase) ---
interface ClinicData {
  id: string | number;
  name: string;
}

interface UserData {
  id: string | number;
  name: string | null;
  email?: string;
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
  doctorId: string | number; // Keep these for potential future use or if data comes this way
  clinicId: string | number; // Keep these
  date: string; // ISO string from backend "yyyy-MM-dd"
  shiftTime: string;
  room: string | null;
}

export default function ViewSchedulesPage() {
  const [allShifts, setAllShifts] = useState<ShiftData[]>([]); // Store all fetched shifts
  const [clinics, setClinics] = useState<ClinicData[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');

  const { toast } = useToast();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = authUtils.getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Session token not found. Please log in.", variant: "destructive" });
      router.push('/login?redirect=/admin/roster/view');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [toast, router]);

  const fetchPageData = useCallback(async () => {
    if (!authUser) return;
    setIsLoadingData(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsLoadingData(false); return; }

    try {
      // Fetch ALL shifts initially, without date/clinic filters sent to this Next.js API route
      const [shiftsRes, clinicsRes] = await Promise.all([
        fetch('/api/shifts', { headers }), // Your Next.js API route for shifts
        fetch('/api/clinics', { headers })  // Your Next.js API route for clinics
      ]);

      if (!shiftsRes.ok) {
        const errorData = await shiftsRes.json().catch(() => ({ error: 'Failed to parse shifts error' }));
        throw new Error(`Shifts: ${errorData.error || errorData.detail || shiftsRes.statusText || 'Unknown error'}`);
      }
      const shiftsData = await shiftsRes.json();
      setAllShifts(Array.isArray(shiftsData) ? shiftsData.map((s: any) => ({ ...s, id: String(s.id), doctorId: String(s.doctorId), clinicId: String(s.clinicId) })) : []);

      if (!clinicsRes.ok) {
        const errorData = await clinicsRes.json().catch(() => ({ error: 'Failed to parse clinics error' }));
        throw new Error(`Clinics: ${errorData.error || errorData.detail || clinicsRes.statusText || 'Unknown error'}`);
      }
      const clinicsData = await clinicsRes.json();
      // Add "All Clinics" option to the fetched clinics
      const formattedClinics = Array.isArray(clinicsData) ? clinicsData.map((c: any) => ({ ...c, id: String(c.id) })) : [];
      setClinics([{ id: 'all', name: 'All Clinics' }, ...formattedClinics]);

    } catch (error: any) {
      console.error('Error fetching page data:', error.message);
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.toLowerCase().includes('not authenticated')) {
        toast({ title: "Authentication Error", description: "Session may have expired. Please login again.", variant: "destructive" });
        router.push('/login?redirect=/admin/roster/view');
      } else {
        toast({ title: "Error Loading Data", description: error.message || "Failed to load page data.", variant: "destructive" });
      }
      setAllShifts([]); setClinics([{ id: 'all', name: 'All Clinics' }]);
    } finally {
      setIsLoadingData(false);
    }
  }, [authUser, getAuthHeaders, toast, router]);

  useEffect(() => {
    if (!isAuthLoading && authUser) {
      fetchPageData();
    } else if (!isAuthLoading && !authUser) {
      router.push('/login?redirect=/admin/roster/view');
    }
  }, [authUser, isAuthLoading, fetchPageData, router]);

  // Client-side filtering logic using useMemo
  const filteredSchedules = useMemo(() => {
    if (!allShifts) return [];
    return allShifts.filter(shift => {
      let isDateMatch = true;
      if (selectedDate) {
        // Compare dates by ignoring time component
        const shiftDateObj = startOfDay(parseISO(shift.date));
        const selectedDateObj = startOfDay(selectedDate);
        isDateMatch = isDateEqual(shiftDateObj, selectedDateObj);
      }

      const isClinicMatch = selectedClinicId === 'all' || String(shift.clinicId) === selectedClinicId;

      return isDateMatch && isClinicMatch;
    });
  }, [allShifts, selectedDate, selectedClinicId]);

  const clearFilters = () => {
    setSelectedDate(new Date()); // Reset to today, or undefined for no date filter
    setSelectedClinicId('all');
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
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                <Eye className="h-5 w-5" /> View Doctor Schedules
              </CardTitle>
              <CardDescription>Filter and view scheduled doctor shifts.</CardDescription>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 items-center border-t pt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIconLucide className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>

            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map(clinic => (
                  <SelectItem key={clinic.id} value={String(clinic.id)}>{clinic.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Clear Filters
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
                  <TableHead>Shift</TableHead>
                  <TableHead>Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData && filteredSchedules.length === 0 ? ( // Show loader if loading and no results yet
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="mt-2">Loading schedules...</p></TableCell></TableRow>
                ) : filteredSchedules.length > 0 ? (
                  filteredSchedules.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.doctor?.user?.name || `Doctor ID ${shift.doctorId}`}</TableCell>
                      <TableCell>{shift.clinic?.name || `Clinic ID ${shift.clinicId}`}</TableCell>
                      <TableCell>{shift.date ? format(parseISO(shift.date), 'PPP') : 'N/A'}</TableCell>
                      <TableCell>{shift.shiftTime}</TableCell>
                      <TableCell>{shift.room || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                      No schedules found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}