"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import type { DateRange } from "react-day-picker";
import { addDays, format, parseISO, isWithinInterval } from "date-fns";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useAuth } from '@/hooks/auth/useAuth';
import { auth as authUtils } from '@/lib/auth'; // Corrected import
import { useToast } from '@/hooks/use-toast';
import apiInstance, { ApiClient } from '@/lib/api'; // Use the global instance

interface Appointment {
  id: string;
  bookingReference: string;
  appointmentTime: string;
  status: string;
  price: number;
  customerId: string; // Assuming ID is string from your previous interfaces
  customer: {
    name: string | null;
    email: string;
  };
  serviceId: string; // Assuming ID is string
  service: {
    name: string;
    id: string; // Add service ID here if needed for service type filtering
  };
  clinicId: string; // Assuming ID is string
  clinic: {
    name: string;
    id: string; // Add clinic ID here
  };
  doctorId: string; // Assuming ID is string
  doctor: {
    user?: {
      name: string | null;
    };
  };
  notes?: string | null;
}

interface RevenueItem {
  date: string;
  clinic: string;
  serviceId: string; // Store service ID for filtering
  serviceName: string;
  revenue: number;
}

interface Clinic {
  id: string;
  name: string;
}

interface Service { // For service filter dropdown
  id: string;
  name: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue ($)",
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

export default function RevenueReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentWeekRange());
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all'); // For service ID

  const [clinics, setClinics] = useState<Clinic[]>([{ id: 'all', name: 'All Clinics' }]);
  const [services, setServices] = useState<Service[]>([{ id: 'all', name: 'All Service Types' }]);

  const [allFetchedAppointments, setAllFetchedAppointments] = useState<Appointment[]>([]);

  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  const [tableRevenueData, setTableRevenueData] = useState<RevenueItem[]>([]);
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([]);

  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch Clinics
  useEffect(() => {
    if (authUser && !isAuthLoading) {
      setIsLoadingClinics(true);
      const fetchInitialClinics = async () => {
        try {
          const token = authUtils.getToken();
          const clinicsData = await apiInstance.getClinics(token);
          if (clinicsData && Array.isArray(clinicsData)) {
            setClinics([
              { id: 'all', name: 'All Clinics' },
              ...clinicsData.map((c: any) => ({ id: String(c.id), name: c.name }))
            ]);
          }
        } catch (error: any) {
          toast({ title: 'Error Fetching Clinics', description: error.message, variant: 'destructive' });
        } finally {
          setIsLoadingClinics(false);
        }
      };
      fetchInitialClinics();
    }
  }, [authUser, isAuthLoading, toast]);

  // Fetch Services
  useEffect(() => {
    if (authUser && !isAuthLoading) {
      setIsLoadingServices(true);
      const fetchInitialServices = async () => {
        try {
          const token = authUtils.getToken();
          const servicesData = await apiInstance.getServices(token);
          if (servicesData && Array.isArray(servicesData)) {
            setServices([
              { id: 'all', name: 'All Service Types' },
              ...servicesData.map((s: any) => ({ id: String(s.id), name: s.name }))
            ]);
          }
        } catch (error: any) {
          toast({ title: 'Error Fetching Services', description: error.message, variant: 'destructive' });
        } finally {
          setIsLoadingServices(false);
        }
      };
      fetchInitialServices();
    }
  }, [authUser, isAuthLoading, toast]);

  // Initial fetch of appointments
  useEffect(() => {
    if (!authUser || isAuthLoading) {
      if (!isAuthLoading && !authUser) router.push('/login?redirect=/admin/reports/revenue');
      return;
    }
    setIsLoadingAppointments(true);
    const fetchInitialAppointments = async () => {
      const token = authUtils.getToken();
      if (!token) {
        toast({ title: "Authentication Error", description: "Token missing.", variant: "destructive" });
        setIsLoadingAppointments(false);
        router.push('/login?redirect=/admin/reports/revenue');
        return;
      }
      try {
        // Fetch ALL 'COMPLETED' appointments, or within a very broad date range if necessary
        // For frontend filtering, you want as much relevant data as feasible.
        const broadStartDate = addDays(new Date(), -365 * 2); // e.g., last 2 years
        const initialFilters: any = {
          status: 'COMPLETED', // Only completed appointments contribute to actual revenue
          dateFrom: format(broadStartDate, 'yyyy-MM-dd'),
          dateTo: format(new Date(), 'yyyy-MM-dd'),
        };
        console.log("Fetching initial revenue appointments with filters:", initialFilters);
        const appointmentsData = await apiInstance.getAppointments(initialFilters, token);
        setAllFetchedAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (error: any) {
        toast({ title: 'Error Loading Initial Appointments', description: error.message, variant: 'destructive' });
        setAllFetchedAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    fetchInitialAppointments();
  }, [authUser, isAuthLoading, toast, router]);

  // Memoized filtered appointments for revenue calculation
  const revenueAppointments = useMemo(() => {
    if (isLoadingAppointments || !allFetchedAppointments) return [];

    return allFetchedAppointments.filter(appt => {
      if (!appt || !appt.appointmentTime || !appt.clinic || !appt.service) return false;

      // Status filter is already applied in initial fetch (COMPLETED)
      // if (appt.status !== 'COMPLETED') return false; // Double check or apply if initial fetch changed

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
      const isServiceMatch = selectedService === 'all' || String(appt.service.id) === selectedService;

      return isDateMatch && isClinicMatch && isServiceMatch;
    });
  }, [allFetchedAppointments, dateRange, selectedClinic, selectedService, isLoadingAppointments]);

  // Process filtered appointments into RevenueItems and Chart Data
  useEffect(() => {
    if (isLoadingAppointments) return;

    const processedData = revenueAppointments.map(apt => ({
      date: format(parseISO(apt.appointmentTime), 'yyyy-MM-dd'),
      clinic: apt.clinic.name,
      serviceId: String(apt.service.id),
      serviceName: apt.service.name,
      revenue: apt.price
    }));
    setTableRevenueData(processedData);

    // Generate complete date range array
    const dateArray: string[] = [];
    if (dateRange?.from && dateRange?.to) {
      let currentDate = new Date(dateRange.from);
      while (currentDate <= dateRange.to) {
        dateArray.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Initialize revenue data for all dates
    const dailyRevenue: { [date: string]: number } = {};
    // First initialize all dates with 0
    dateArray.forEach(date => {
      dailyRevenue[date] = 0;
    });
    // Then add actual revenue data
    processedData.forEach(item => {
      dailyRevenue[item.date] = (dailyRevenue[item.date] || 0) + item.revenue;
    });

    const aggregatedChartData = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(aggregatedChartData);

  }, [revenueAppointments, isLoadingAppointments, dateRange]);

  const totalRevenue = useMemo(() => {
    return tableRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  }, [tableRevenueData]);

  const handleDownload = () => {
    if (tableRevenueData.length === 0) {
      toast({ title: "No Data", description: "No revenue data to download for the current filters.", variant: "default" });
      return;
    }
    const dateFromString = dateRange?.from ? format(dateRange.from, 'yyyyMMdd') : 'allTime';
    const dateToString = dateRange?.to ? format(dateRange.to, 'yyyyMMdd') : 'allTime';
    const clinicName = selectedClinic === 'all' ? 'allClinics' : clinics.find(c => c.id === selectedClinic)?.name.replace(/\s+/g, '') || selectedClinic;
    const serviceName = selectedService === 'all' ? 'allServices' : services.find(s => s.id === selectedService)?.name.replace(/\s+/g, '') || selectedService;

    const filename = `revenueReport-${clinicName}-${serviceName}-${dateFromString}-to-${dateToString}.csv`;
    const csvHeader = ['Date', 'Clinic', 'Service', 'Revenue'];
    const csvRows = tableRevenueData.map(item => [
      format(new Date(item.date), "yyyy-MM-dd"),
      `"${item.clinic.replace(/"/g, '""')}"`,
      `"${item.serviceName.replace(/"/g, '""')}"`,
      item.revenue.toFixed(2)
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
      toast({ title: "Download Failed", description: "CSV download is not supported.", variant: "destructive" });
    }
  };

  const pageIsLoading = isAuthLoading || isLoadingClinics || isLoadingServices;

  if (isAuthLoading) { // Show full page loader only for initial auth check
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Revenue Report
              </CardTitle>
              <CardDescription>Track and analyze clinic revenue from completed appointments.</CardDescription>
            </div>
            <Button onClick={handleDownload} disabled={pageIsLoading || isLoadingAppointments || tableRevenueData.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")} disabled={pageIsLoading || isLoadingAppointments}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
            </Popover>

            <Select value={selectedClinic} onValueChange={setSelectedClinic} disabled={pageIsLoading || isLoadingAppointments || clinics.length <= 1}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Clinic" /></SelectTrigger>
              <SelectContent>{clinics.map(clinic => (<SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>))}</SelectContent>
            </Select>

            <Select value={selectedService} onValueChange={setSelectedService} disabled={pageIsLoading || isLoadingAppointments || services.length <= 1}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Service Type" /></SelectTrigger>
              <SelectContent>{services.map(type => (<SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>))}</SelectContent>
            </Select>

            <Button variant="outline" onClick={() => { setDateRange({ from: addDays(new Date(), -30), to: new Date() }); setSelectedClinic('all'); setSelectedService('all'); }} disabled={pageIsLoading || isLoadingAppointments}>Clear Filters</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoadingAppointments && !pageIsLoading ? ( // Show spinner for appointment loading specifically if other page elements are ready
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Loading revenue data...</span></div>
          ) : !pageIsLoading && !isLoadingAppointments && ( // Content to show once everything is loaded
            <>
              <Card className="bg-gradient-to-r from-teal-50 to-background">
                <CardHeader className="pb-2"><CardDescription>Total Revenue (Filtered)</CardDescription><CardTitle className="text-4xl font-bold text-primary">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle></CardHeader>
                <CardContent><div className="text-xs text-muted-foreground">Based on selected filters and completed appointments.</div></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Revenue Trend</CardTitle><CardDescription>Daily revenue over the selected period.</CardDescription></CardHeader>
                <CardContent className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), "MMM dd")} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                          <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-revenue)", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0, style: { filter: `drop-shadow(0 0 4px hsl(var(--primary-foreground)/0.5))` } }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No revenue data for chart.</div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-medium text-primary mb-4">Detailed Revenue Entries</h3>
                <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto"> {/* Added max-height and overflow */}
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Clinic</TableHead><TableHead>Service</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {tableRevenueData.length > 0 ? (
                        tableRevenueData.map((item, index) => (
                          <TableRow key={`${item.date}-${item.clinic}-${item.serviceName}-${index}`}><TableCell>{format(parseISO(item.date), "MMM dd, yyyy")}</TableCell><TableCell>{item.clinic}</TableCell><TableCell>{item.serviceName}</TableCell><TableCell className="text-right font-medium">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-24">No revenue data found for selected filters.</TableCell></TableRow>
                      )}
                      {tableRevenueData.length > 0 && (
                        <TableRow className="bg-muted/50 font-semibold sticky bottom-0">
                          <TableCell colSpan={3} className="text-right">Total</TableCell>
                          <TableCell className="text-right text-primary">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
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