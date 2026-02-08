"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, Star, Users, BriefcaseMedical, Loader2 } from 'lucide-react';
import type { DateRange } from "react-day-picker";
import { addDays, format, parseISO, isWithinInterval } from "date-fns";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import apiInstance from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import { auth as authUtils } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

interface Appointment {
  id: string;
  bookingReference: string;
  appointmentTime: string;
  status: string;
  service: {
    name: string;
    id: string;
  };
  doctor: {
    id: string;
    user?: {
      name: string | null;
    };
  };
  clinic: {
    id: string;
    name: string;
  };
}

interface Clinic {
  id: string;
  name: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const serviceChartConfig = {
  count: { label: "Appointments" },
} satisfies ChartConfig;

const doctorChartConfig = {
  count: { label: "Appointments" },
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

export default function PopularityReportPage() {
  const { toast } = useToast();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(getCurrentWeekRange());
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [clinics, setClinics] = useState<Clinic[]>([{ id: 'all', name: 'All Clinics' }]);
  const [allFetchedAppointments, setAllFetchedAppointments] = useState<Appointment[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [popularServices, setPopularServices] = useState<{ name: string; count: number }[]>([]);
  const [popularDoctors, setPopularDoctors] = useState<{ name: string; count: number }[]>([]);
  const [servicePieData, setServicePieData] = useState<{ name: string; count: number; fill: string }[]>([]);
  const [doctorPieData, setDoctorPieData] = useState<{ name: string; count: number; fill: string }[]>([]);

  // MOVED DEFINITIONS UP
  const calculatePopularity = useCallback((apps: Appointment[], groupBy: 'service' | 'doctor') => {
    const counts: { [key: string]: number } = {};
    if (!Array.isArray(apps)) return [];
    apps.forEach(appointment => {
      let name = '';
      if (groupBy === 'service') {
        name = appointment.service?.name || 'Unknown Service';
      } else {
        name = appointment.doctor?.user?.name || `Doctor ID: ${appointment.doctor?.id || 'Unknown'}`;
      }
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const formatPieData = useCallback((data: { name: string; count: number }[]) => {
    const topN = 5;
    if (!Array.isArray(data)) return [];
    const topData = data.slice(0, topN);
    const otherCount = data.slice(topN).reduce((sum, item) => sum + item.count, 0);
    const pieData = topData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length]
    }));
    if (otherCount > 0) {
      pieData.push({
        name: 'Other',
        count: otherCount,
        fill: COLORS[topN % COLORS.length]
      });
    }
    return pieData;
  }, []);


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
              ...clinicsData.map((clinic: any) => ({
                id: String(clinic.id),
                name: clinic.name
              }))
            ]);
          }
        } catch (error: any) {
          toast({
            title: 'Error Fetching Clinics',
            description: error.message || 'Failed to fetch clinics for filter.',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingClinics(false);
        }
      };
      fetchInitialClinics();
    }
  }, [authUser, isAuthLoading, toast]);

  useEffect(() => {
    if (!authUser || isAuthLoading) {
      if (!isAuthLoading && !authUser) {
        router.push('/login?redirect=/admin/reports/popularity');
      }
      return;
    }

    setIsLoadingAppointments(true);
    const fetchInitialAppointments = async () => {
      const token = authUtils.getToken();
      if (!token) {
        toast({ title: "Authentication Error", description: "Session token not found.", variant: "destructive" });
        setIsLoadingAppointments(false);
        router.push('/login?redirect=/admin/reports/popularity');
        return;
      }
      try {
        const initialFilters: any = {};
        // For frontend filtering, fetch a broader range initially.
        // You might adjust these default broad filters as needed.
        const broadStartDate = addDays(new Date(), -365); // e.g., last 1 year
        initialFilters.dateFrom = format(broadStartDate, 'yyyy-MM-dd');
        initialFilters.dateTo = format(new Date(), 'yyyy-MM-dd');

        console.log("Fetching initial appointments with broad filters:", initialFilters);
        const appointmentsData = await apiInstance.getAppointments(initialFilters, token);
        console.log("Initial appointments data received:", appointmentsData);
        setAllFetchedAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (error: any) {
        toast({
          title: 'Error Loading Initial Appointments',
          description: error.message || 'Failed to fetch base appointment data.',
          variant: 'destructive',
        });
        setAllFetchedAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    fetchInitialAppointments();
  }, [authUser, isAuthLoading, toast, router]);

  const filteredAppointments = useMemo(() => {
    if (isLoadingAppointments || !allFetchedAppointments) return [];

    console.log("Filtering from:", allFetchedAppointments.length, "appointments");
    console.log("Date range filter:", dateRange);
    console.log("Clinic filter:", selectedClinic);

    return allFetchedAppointments.filter(appt => {
      if (!appt || !appt.appointmentTime || !appt.clinic) { // Add null checks
        console.warn("Skipping invalid appointment object:", appt);
        return false;
      }
      const appointmentDate = parseISO(appt.appointmentTime);

      let isDateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        const startOfDayFrom = new Date(dateRange.from.setHours(0, 0, 0, 0));
        const endOfDayTo = new Date(dateRange.to.setHours(23, 59, 59, 999));
        isDateMatch = isWithinInterval(appointmentDate, { start: startOfDayFrom, end: endOfDayTo });
      } else if (dateRange?.from) {
        const startOfDayFrom = new Date(dateRange.from.setHours(0, 0, 0, 0));
        isDateMatch = appointmentDate >= startOfDayFrom;
      } else if (dateRange?.to) {
        const endOfDayTo = new Date(dateRange.to.setHours(23, 59, 59, 999));
        isDateMatch = appointmentDate <= endOfDayTo;
      }

      const isClinicMatch = selectedClinic === 'all' || String(appt.clinic.id) === selectedClinic;

      // if(isDateMatch && isClinicMatch) console.log("Matched appt:", appt.bookingReference, appt.appointmentTime, appt.clinic.name);
      return isDateMatch && isClinicMatch;
    });
  }, [allFetchedAppointments, dateRange, selectedClinic, isLoadingAppointments]);


  useEffect(() => {
    // This effect now correctly runs AFTER calculatePopularity and formatPieData are defined.
    if (isLoadingAppointments || !filteredAppointments) return;

    console.log("Recalculating popularity with", filteredAppointments.length, "filtered appointments");

    const servicesPopularity = calculatePopularity(filteredAppointments, 'service');
    const doctorsPopularity = calculatePopularity(filteredAppointments, 'doctor');

    setPopularServices(servicesPopularity);
    setPopularDoctors(doctorsPopularity);

    setServicePieData(formatPieData(servicesPopularity));
    setDoctorPieData(formatPieData(doctorsPopularity));

  }, [filteredAppointments, calculatePopularity, formatPieData, isLoadingAppointments]);


  const handleDownload = async (type: 'service' | 'doctor') => {
    const data = type === 'service' ? popularServices : popularDoctors;
    if (data.length === 0) {
      toast({ title: "No Data", description: "No data available to download for the current filters.", variant: "default" });
      return;
    }
    const dateFromString = dateRange?.from ? format(dateRange.from, 'yyyyMMdd') : 'allTime';
    const dateToString = dateRange?.to ? format(dateRange.to, 'yyyyMMdd') : 'allTime';
    const clinicName = selectedClinic === 'all' ? 'allClinics' : clinics.find(c => c.id === selectedClinic)?.name.replace(/\s+/g, '') || selectedClinic;

    const filename = `${type}-popularity-${clinicName}-${dateFromString}-to-${dateToString}.csv`;
    const csvHeader = ['Rank', type === 'service' ? 'Service Name' : 'Doctor Name', 'Number of Appointments'];
    const csvRows = data.map((item, index) => [
      index + 1,
      `"${item.name.replace(/"/g, '""')}"`,
      item.count
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
      toast({ title: "Download Failed", description: "CSV download is not supported by your browser.", variant: "destructive" });
    }
  };

  const overallLoading = isAuthLoading || isLoadingClinics; // isLoadingAppointments is handled per section

  if (isAuthLoading) {
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
                <Star className="h-5 w-5" /> Popularity Report
              </CardTitle>
              <CardDescription>Analyze popular services and doctors.</CardDescription>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                  disabled={overallLoading || isLoadingAppointments}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select
              value={selectedClinic}
              onValueChange={setSelectedClinic}
              disabled={overallLoading || isLoadingAppointments || clinics.length <= 1}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map(clinic => (
                  <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setDateRange(getCurrentWeekRange());
                setSelectedClinic('all');
              }}
              disabled={overallLoading || isLoadingAppointments}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <BriefcaseMedical className="h-5 w-5 text-primary" /> Popular Services
                </CardTitle>
                <CardDescription className="text-xs">Ranking by appointment count.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload('service')}
                disabled={isLoadingAppointments || popularServices.length === 0}
              >
                <Download className="mr-1.5 h-3 w-3" /> Download
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="h-[250px] w-full">
                {isLoadingAppointments ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : servicePieData.length > 0 ? (
                  <ChartContainer config={serviceChartConfig} className="h-full w-full aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="dot" />} />
                        <Pie
                          data={servicePieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} labelLine={false}
                          label={({ cx, cy, midAngle, outerRadius, percent, name, index }) => {
                            const RADIAN = Math.PI / 180; const radius = outerRadius + 15; const x = cx + radius * Math.cos(-midAngle * RADIAN); const y = cy + radius * Math.sin(-midAngle * RADIAN); const textAnchor = Math.cos(-midAngle * RADIAN) >= 0 ? "start" : "end";
                            return (percent * 100) > 3 ? (<text x={x} y={y} fill={servicePieData[index].fill} textAnchor={textAnchor} dominantBaseline="central" className="text-xs font-medium">{`${name} (${(percent * 100).toFixed(0)}%)`}</text>) : null;
                          }}
                        >{servicePieData.map((entry) => (<Cell key={`cell-service-${entry.name}`} fill={entry.fill} className="stroke-background hover:opacity-80" strokeWidth={1} />))}</Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs" />} verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} height={50} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">No service data for selected filters.</div>
                )}
              </div>
              <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                <Table><TableHeader><TableRow><TableHead className="w-16">Rank</TableHead><TableHead>Service</TableHead><TableHead className="text-right">Appointments</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isLoadingAppointments && popularServices.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    ) : popularServices.length > 0 ? (
                      popularServices.map((service, index) => (
                        <TableRow key={service.name + index}><TableCell className="text-center">{index + 1}</TableCell><TableCell className="font-medium">{service.name}</TableCell><TableCell className="text-right">{service.count}</TableCell></TableRow>
                      ))
                    ) : !isLoadingAppointments ? ( // Show "No data" only if not loading
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">No service data found.</TableCell></TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1"><CardTitle className="flex items-center gap-2 text-base font-medium"><Users className="h-5 w-5 text-primary" /> Popular Doctors</CardTitle><CardDescription className="text-xs">Ranking by appointment count.</CardDescription></div>
              <Button size="sm" variant="outline" onClick={() => handleDownload('doctor')} disabled={isLoadingAppointments || popularDoctors.length === 0}>
                <Download className="mr-1.5 h-3 w-3" /> Download
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="h-[250px] w-full">
                {isLoadingAppointments ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : doctorPieData.length > 0 ? (
                  <ChartContainer config={doctorChartConfig} className="h-full w-full aspect-square">
                    <ResponsiveContainer width="100%" height="100%"><PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="dot" />} />
                      <Pie data={doctorPieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} labelLine={false}
                        label={({ cx, cy, midAngle, outerRadius, percent, name, index }) => {
                          const RADIAN = Math.PI / 180; const radius = outerRadius + 15; const x = cx + radius * Math.cos(-midAngle * RADIAN); const y = cy + radius * Math.sin(-midAngle * RADIAN); const textAnchor = Math.cos(-midAngle * RADIAN) >= 0 ? "start" : "end";
                          return (percent * 100) > 3 ? (<text x={x} y={y} fill={doctorPieData[index].fill} textAnchor={textAnchor} dominantBaseline="central" className="text-xs font-medium">{`${name} (${(percent * 100).toFixed(0)}%)`}</text>) : null;
                        }}
                      >{doctorPieData.map((entry) => (<Cell key={`cell-doctor-${entry.name}`} fill={entry.fill} className="stroke-background hover:opacity-80" strokeWidth={1} />))}</Pie>
                      <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs" />} verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} height={50} />
                    </PieChart></ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">No doctor data for selected filters.</div>
                )}
              </div>
              <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                <Table><TableHeader><TableRow><TableHead className="w-16">Rank</TableHead><TableHead>Doctor</TableHead><TableHead className="text-right">Appointments</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {isLoadingAppointments && popularDoctors.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    ) : popularDoctors.length > 0 ? (
                      popularDoctors.map((doctor, index) => (
                        <TableRow key={doctor.name + index}><TableCell className="text-center">{index + 1}</TableCell><TableCell className="font-medium">{doctor.name}</TableCell><TableCell className="text-right">{doctor.count}</TableCell></TableRow>
                      ))
                    ) : !isLoadingAppointments ? ( // Show "No data" only if not loading
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">No doctor data found.</TableCell></TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}