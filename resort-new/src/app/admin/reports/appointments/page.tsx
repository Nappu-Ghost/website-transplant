"use client";

import React, { useState, useEffect, useCallback, useMemo, HTMLAttributes } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { addDays, format, parseISO, isWithinInterval } from "date-fns"; // Added parseISO, isWithinInterval
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import { auth as authUtils } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import apiInstance from '@/lib/api'; // Use the global instance

interface Appointment {
  id: string;
  bookingReference: string;
  appointmentTime: string; // Expect ISO string
  status: string;
  price: number;
  customerId: number; // Assuming number based on previous files
  customer: {
    name: string | null;
    email: string;
  };
  serviceId: number; // Assuming number
  service: {
    name: string;
    id: string; // Keep for consistency if service object has id
  };
  clinicId: number; // Assuming number
  clinic: {
    name: string;
    id: string; // Keep for consistency
  };
  doctorId: number; // Assuming number
  doctor: {
    id: string; // Keep for consistency
    user?: {
      name: string | null;
    };
  };
  notes?: string | null;
}

interface ClinicOption {
  id: string;
  name: string;
}

const statuses = [
  { id: 'all', name: 'All Statuses' },
  { id: 'SCHEDULED', name: 'Scheduled' },
  { id: 'COMPLETED', name: 'Completed' },
  { id: 'CANCELLED', name: 'Cancelled' },
  // Add other statuses if applicable, e.g., 'NOSHOW'
];

const chartConfig = {
  count: {
    label: "Appointments",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Get current week's date range (Sunday to Saturday)
const getCurrentWeekRange = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - currentDay; // Adjust to get Sunday
  
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get to Saturday
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { from: startOfWeek, to: endOfWeek };
};

export default function AppointmentsReportPage({ className }: HTMLAttributes<HTMLDivElement>) {
  // Filters State
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(getCurrentWeekRange());
  const [selectedClinic, setSelectedClinic] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  // Data Stores
  const [clinicOptions, setClinicOptions] = useState<ClinicOption[]>([{ id: 'all', name: 'All Clinics' }]);
  const [allFetchedAppointments, setAllFetchedAppointments] = useState<Appointment[]>([]); // Stores ALL data from initial fetch

  // Loading States
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingInitialAppointments, setIsLoadingInitialAppointments] = useState(true); // For the one-time API fetch

  const { toast } = useToast();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Fetch Clinic Options
  useEffect(() => {
    if (authUser && !isAuthLoading) {
      setIsLoadingClinics(true);
      const fetchOptions = async () => {
        try {
          const token = authUtils.getToken();
          const fetchedClinics = await apiInstance.getClinics(token);
          if (fetchedClinics && Array.isArray(fetchedClinics)) {
            const options = fetchedClinics.map((clinic: any) => ({
              id: String(clinic.id),
              name: clinic.name,
            }));
            setClinicOptions([{ id: 'all', name: 'All Clinics' }, ...options]);
          }
        } catch (error: any) {
          toast({ title: "Error fetching clinics", description: error.message, variant: "destructive" });
        } finally {
          setIsLoadingClinics(false);
        }
      };
      fetchOptions();
    }
  }, [authUser, isAuthLoading, toast]);

  // Initial Fetch of Appointments (broad range, minimal API-side filtering)
  useEffect(() => {
    if (!authUser || isAuthLoading) {
      if (!isAuthLoading && !authUser) router.push('/login?redirect=/admin/reports/appointments');
      return;
    }

    setIsLoadingInitialAppointments(true);
    const fetchInitialData = async () => {
      const token = authUtils.getToken();
      if (!token) {
        toast({ title: "Authentication Error", description: "Token missing.", variant: "destructive" });
        setIsLoadingInitialAppointments(false);
        router.push('/login?redirect=/admin/reports/appointments');
        return;
      }
      try {
        // Fetch appointments within a broad initial date range.
        // If your backend /api/appointments supports fetching ALL appointments without date filters,
        // you can remove dateFrom/dateTo. Otherwise, use a wide range.
        const broadStartDate = addDays(new Date(), -365); // Example: last 1 year
        const initialApiFilters: Record<string, string> = {
          dateFrom: format(broadStartDate, 'yyyy-MM-dd'),
          dateTo: format(new Date(), 'yyyy-MM-dd'),
          // You might add a default status filter here if you *never* want certain statuses in the base data
          // e.g. status: 'COMPLETED,SCHEDULED,CANCELLED' if backend supports multiple
        };
        console.log("Fetching initial appointments for report with API filters:", initialApiFilters);
        const data = await apiInstance.getAppointments(initialApiFilters, token);
        setAllFetchedAppointments(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast({ title: "Error Loading Initial Appointments", description: error.message, variant: "destructive" });
        setAllFetchedAppointments([]);
      } finally {
        setIsLoadingInitialAppointments(false);
      }
    };
    fetchInitialData();
  }, [authUser, isAuthLoading, toast, router]);


  // Memoized Frontend Filtering for displayAppointments
  const displayAppointments = useMemo(() => {
    if (isLoadingInitialAppointments || !allFetchedAppointments) return [];

    return allFetchedAppointments.filter(appt => {
      if (!appt || !appt.appointmentTime || !appt.clinic) return false;
      const appointmentDate = parseISO(appt.appointmentTime);

      let isDateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        const startOfDayFrom = new Date(dateRange.from.setHours(0, 0, 0, 0));
        const endOfDayTo = new Date(dateRange.to.setHours(23, 59, 59, 999));
        isDateMatch = isWithinInterval(appointmentDate, { start: startOfDayFrom, end: endOfDayTo });
      } else if (dateRange?.from) {
        const startOfDayFrom = new Date(dateRange.from.setHours(0, 0, 0, 0));
        isDateMatch = appointmentDate >= startOfDayFrom;
      }

      const isClinicMatch = selectedClinic === 'all' || String(appt.clinic.id) === selectedClinic;
      const isStatusMatch = selectedStatus === 'all' || appt.status === selectedStatus;

      return isDateMatch && isClinicMatch && isStatusMatch;
    });
  }, [allFetchedAppointments, dateRange, selectedClinic, selectedStatus, isLoadingInitialAppointments]);


  // Memoized Chart Data (derived from displayAppointments)
  const chartData = useMemo(() => {
    if (isLoadingInitialAppointments || !displayAppointments.length || !dateRange?.from || !dateRange?.to) return [];

    // Generate array of all dates in range
    const dates: string[] = [];
    let currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count appointments per date
    const groupedByDate = displayAppointments.reduce((acc: Record<string, number>, appt: Appointment) => {
      const date = format(parseISO(appt.appointmentTime), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Create data points for all dates, even those with no appointments
    return dates.map(date => ({
      date: format(parseISO(date), 'MMM dd'),
      count: groupedByDate[date] || 0
    }));
  }, [displayAppointments, isLoadingInitialAppointments, dateRange]);


  const handleDownload = () => {
    if (displayAppointments.length === 0) {
      toast({ title: "No Data", description: "No appointments to download for the current filters.", variant: "default" });
      return;
    }
    const dateFromString = dateRange?.from ? format(dateRange.from, 'yyyyMMdd') : 'allTime';
    const dateToString = dateRange?.to ? format(dateRange.to, 'yyyyMMdd') : 'allTime';
    const clinicName = selectedClinic === 'all' ? 'allClinics' : clinicOptions.find(c => c.id === selectedClinic)?.name.replace(/\s+/g, '') || selectedClinic;
    const statusName = selectedStatus === 'all' ? 'allStatuses' : selectedStatus;

    const filename = `appointmentsReport-${clinicName}-${statusName}-${dateFromString}-to-${dateToString}.csv`;
    const csvHeader = ['Booking Ref', 'Patient Name', 'Patient Email', 'Doctor Name', 'Clinic Name', 'Appointment Date', 'Appointment Time', 'Service Name', 'Status', 'Price'];
    const csvRows = displayAppointments.map(appt => [
      `"${appt.bookingReference}"`,
      `"${appt.customer.name || ''}"`,
      `"${appt.customer.email}"`,
      `"${appt.doctor.user?.name || 'N/A'}"`,
      `"${appt.clinic.name}"`,
      format(parseISO(appt.appointmentTime), 'yyyy-MM-dd'),
      format(parseISO(appt.appointmentTime), 'HH:mm'),
      `"${appt.service.name}"`,
      appt.status,
      appt.price.toFixed(2)
    ]);
    const csv = [csvHeader.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      toast({ title: "Download Failed", description: "CSV download not supported.", variant: "destructive" });
    }
  };

  const pageIsLoading = isAuthLoading || isLoadingClinics; // Base page loading (filters etc.)
  // isLoadingInitialAppointments handles the main data loading state for table/chart

  if (isAuthLoading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card className={className}>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-primary">Appointments Report</CardTitle>
              <CardDescription>View and filter appointment data.</CardDescription>
            </div>
            <Button onClick={handleDownload} disabled={pageIsLoading || isLoadingInitialAppointments || displayAppointments.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")} disabled={pageIsLoading || isLoadingInitialAppointments}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
            </Popover>

            <Select value={selectedClinic} onValueChange={setSelectedClinic} disabled={pageIsLoading || isLoadingInitialAppointments || clinicOptions.length <= 1}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Clinic" /></SelectTrigger>
              <SelectContent>{clinicOptions.map(clinic => (<SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>))}</SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={pageIsLoading || isLoadingInitialAppointments}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Status" /></SelectTrigger>
              <SelectContent>{statuses.map(status => (<SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>))}</SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => { 
                setDateRange(getCurrentWeekRange()); 
                setSelectedClinic('all'); 
                setSelectedStatus('all'); 
              }} 
              disabled={pageIsLoading || isLoadingInitialAppointments}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          { /* Show main content loader if initial appointments are still loading AND other page elements are ready */}
          {isLoadingInitialAppointments && !pageIsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading appointments data...</span>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Appointments Trend</CardTitle>
                  <CardDescription>Number of appointments over the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tickFormatter={(value) => value} tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} formatter={(value: number) => [`${value} appts`, undefined]} />
                          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No appointment data for chart with current filters.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-medium text-primary mb-4">Detailed Appointments List</h3>
                <div className="border rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Clinic</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Service</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {displayAppointments.length > 0 ? (
                        displayAppointments.map((appt) => (
                          <TableRow key={appt.bookingReference}>
                            <TableCell className="font-mono text-xs">{appt.bookingReference.substring(0, 8)}</TableCell>
                            <TableCell>{appt.customer.name || appt.customer.email}</TableCell>
                            <TableCell>{appt.doctor.user?.name || 'N/A'}</TableCell>
                            <TableCell>{appt.clinic.name}</TableCell>
                            <TableCell>{format(parseISO(appt.appointmentTime), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{format(parseISO(appt.appointmentTime), 'HH:mm')}</TableCell>
                            <TableCell>{appt.service.name}</TableCell>
                            <TableCell>{appt.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground h-24">No appointments found for the selected filters.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}