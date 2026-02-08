"use client";

import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { ApiClient } from '@/lib/api';
import auth from '@/lib/auth';
import { format, parseISO, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Calendar, Clock, DollarSign, Users, Calendar as CalendarIcon, UserRound } from 'lucide-react';

// Tooth Icon component for the header
const ToothIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.57034 14.2814 5.6209 14.6221 5.6614 15M19.1656 12.1093C18.9256 12.6877 18.6803 13.2788 18.5 14C18.351 14.596 18.2908 15.4584 18.2268 16.3755C18.076 18.536 17.904 21 16.5 21C15.601 21 15.2072 19.5857 14.7735 18.0285C14.2424 16.1214 13.6516 14 12 14C10.3485 14 9.75768 16.1214 9.22655 18.0285C8.79288 19.5857 8.39901 21 7.50003 21C6.67282 21 6.27328 20.1446 6.05377 19" />
  </svg>
);

// Create API client instance
const apiClient = new ApiClient();

interface Appointment {
  id: string;
  bookingReference: string;
  appointmentTime: string;
  status: string;
  price: number;
  customerId: number;
  customer: {
    name: string | null;
    email: string;
  };
  serviceId: number;
  service: {
    name: string;
  };
  clinicId: number;
  clinic: {
    name: string;
  };
  doctorId: number;
  doctor: {
    user?: {
      name: string | null;
    };
  };
  notes?: string | null;
}

interface DoctorInfo {
  id: string;
  userId: number;
  name: string;
  specialty: string;
  clinicId: number;
  clinic?: {
    id: string;
    name: string;
  };
  status: string;
  user?: {
    name: string;
    email: string;
  };
}

interface ClinicDoctorsInfo {
  clinicId: string;
  clinicName: string;
  active: number;
  total: number;
}

interface RevenueData {
  day: string;
  amount: number;
}

// This is the PAGE content for /admin/dashboard
const AdminDashboardPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [clinicsDoctors, setClinicsDoctors] = useState<ClinicDoctorsInfo[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorInfo[]>([]);
  const [userData, setUserData] = useState<{ name: string }>({ name: 'Admin User' });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current user
        const user = auth.getUser();
        if (user) {
          setUserData({ name: user.name || 'Admin User' });
        }
        
        // Get today's date for filtering
        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');
        const nextWeek = format(addDays(today, 7), 'yyyy-MM-dd');
          // Get upcoming appointments for today
        try {
          const appointments = await apiClient.getAppointments({
            dateFrom: formattedToday,
            dateTo: formattedToday
          }) || [];
          
          // Validate and clean appointments data
          const validAppointments = Array.isArray(appointments) 
            ? appointments.filter(apt => apt && typeof apt === 'object') 
            : [];
            // Sort appointments by appointment time
          const sortedAppointments = [...validAppointments].sort((a: Appointment, b: Appointment) => {
            try {
              const dateA = a.appointmentTime ? new Date(a.appointmentTime) : new Date(0);
              const dateB = b.appointmentTime ? new Date(b.appointmentTime) : new Date(0);
              return dateA.getTime() - dateB.getTime();
            } catch (e) {
              console.error("Error comparing appointment times:", e);
              return 0; // If dates can't be compared, don't change order
            }
          });
          
          setUpcomingAppointments(sortedAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setUpcomingAppointments([]);
        }
        
        // Calculate monthly revenue from COMPLETED and SCHEDULED appointments this month
        try {
          const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
          
          // Get both completed and scheduled appointments for the current month
          const [completedAppointments, scheduledAppointments] = await Promise.all([
            apiClient.getAppointments({
              dateFrom: monthStart,
              dateTo: monthEnd,
              status: 'COMPLETED'
            }),
            apiClient.getAppointments({
              dateFrom: monthStart,
              dateTo: monthEnd,
              status: 'SCHEDULED'
            })
          ]);

          // Combine the appointments
          const monthlyAppointments = [
            ...(Array.isArray(completedAppointments) ? completedAppointments : []),
            ...(Array.isArray(scheduledAppointments) ? scheduledAppointments : [])
          ];
          
          // Calculate total revenue from both types of appointments
          let monthTotal = 0;
          if (Array.isArray(monthlyAppointments)) {
            monthlyAppointments.forEach((apt: Appointment) => {
              if (typeof apt.price === 'number') {
                monthTotal += apt.price;
              } else {
                console.warn("Invalid price for appointment:", apt.bookingReference);
              }
            });
          }
          setMonthlyRevenue(monthTotal);
          
          // Generate daily revenue data for the chart
          const daysInMonth = eachDayOfInterval({
            start: startOfMonth(today),
            end: endOfMonth(today)
          });
          
          const dailyRevenue = daysInMonth.map(day => {
            let dayRevenue = 0;
            
            if (Array.isArray(monthlyAppointments)) {
              // Filter completed and scheduled appointments for this day
              const dayAppointments = monthlyAppointments.filter((apt: Appointment) => {
                try {
                  return apt.appointmentTime && 
                         isSameDay(new Date(apt.appointmentTime), day) &&
                         (apt.status === 'COMPLETED' || apt.status === 'SCHEDULED');
                } catch (e) {
                  console.error("Error comparing dates for appointment:", apt.bookingReference, e);
                  return false;
                }
              });
              
              // Sum up the revenue for the day from appointment prices
              dayAppointments.forEach((apt: Appointment) => {
                if (typeof apt.price === 'number') {
                  dayRevenue += apt.price;
                } else {
                  console.warn("Invalid price for day chart:", apt.bookingReference);
                }
              });
            }
            
            return {
              day: format(day, 'dd'),
              amount: dayRevenue
            };
          });
          
          setRevenueData(dailyRevenue);
        } catch (error) {
          console.error("Error processing revenue data:", error);
          setMonthlyRevenue(0);
          setRevenueData([]);
        }
          // Get all clinics and doctors, then calculate active doctors per clinic
        try {
          const clinics = await apiClient.getClinics() || [];
          const doctors = await apiClient.getDoctors() || [];
          
          if (!Array.isArray(clinics) || !Array.isArray(doctors)) {
            throw new Error("Invalid response format for clinics or doctors");
          }
          
          // Process doctors with clinic information
          const processedDoctors = doctors
            .filter(doc => doc && doc.id)
            .map((doctor: any) => {
              // Find the clinic this doctor belongs to
              const doctorClinic = clinics.find((clinic: any) => 
                clinic && clinic.id && doctor.clinicId === clinic.id
              );
              
              return {
                ...doctor,
                clinic: doctorClinic ? {
                  id: doctorClinic.id,
                  name: doctorClinic.name || `Clinic ${doctorClinic.id}`
                } : undefined
              };
            });
          
          // Sort doctors by status (active first) then by name
          const sortedDoctors = [...processedDoctors].sort((a: DoctorInfo, b: DoctorInfo) => {
            if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
            if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
            
            const nameA = a.user?.name || a.name || '';
            const nameB = b.user?.name || b.name || '';
            return nameA.localeCompare(nameB);
          });
          
          setAllDoctors(sortedDoctors);
          
          // Still calculate clinic statistics for the summary
          const clinicsWithDoctors = clinics
            .filter(clinic => clinic && clinic.id)
            .map((clinic: any) => {
              const clinicDoctors = doctors.filter((doc: DoctorInfo) => 
                doc && doc.clinicId && clinic.id && doc.clinicId === clinic.id
              );
              const activeDoctorsCount = clinicDoctors.filter((doc: DoctorInfo) => 
                doc && doc.status === 'ACTIVE'
              ).length;
              
              return {
                clinicId: clinic.id,
                clinicName: clinic.name || `Clinic ${clinic.id}`,
                active: activeDoctorsCount,
                total: clinicDoctors.length
              };
            });
          
          setClinicsDoctors(clinicsWithDoctors);
        } catch (error) {
          console.error("Error processing doctors data:", error);
          setClinicsDoctors([]);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  // Format appointment time for display
  const formatAppointmentTime = (time: string) => {
    if (!time) return 'No time specified';
    
    try {
      const [hours, minutes] = time.split(':');
      
      if (!hours || !minutes) {
        return time; // Return original if it can't be split
      }
      
      const hour = parseInt(hours, 10);
      
      if (isNaN(hour)) {
        return time; // Return original if parsing fails
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return time || 'No time specified';
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">      {/* Main dashboard content specific to this page */}
      <div className="flex items-center gap-2 mb-2">
        <ToothIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Island Dental Connect Dashboard</h1>
      </div>
      <p className="text-muted-foreground mb-6">Welcome, {userData.name}! Here's a summary of clinic activity.</p>
      
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>          {/* Summary stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-primary">Upcoming Appointments</h3>
              </div>                <p className="text-3xl font-bold">                {upcomingAppointments.filter(apt => {
                  try {
                    if (!apt.appointmentTime) {
                      console.warn("Appointment missing appointmentTime:", apt.bookingReference);
                      return false;
                    }
                    // Only count appointments that are:
                    // 1. Today
                    // 2. Have status "SCHEDULED"
                    return isSameDay(new Date(apt.appointmentTime), new Date()) && 
                           apt.status === 'SCHEDULED';
                  } catch (e) {
                    console.error("Error parsing appointment time for", apt.bookingReference, e);
                    return false;
                  }
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-primary">Total Revenue</h3>
              </div>
              <p className="text-3xl font-bold">${monthlyRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">This Month (Completed & Scheduled)</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-primary">Active Doctors</h3>
              </div>
              <p className="text-3xl font-bold">
                {clinicsDoctors.reduce((sum, clinic) => sum + clinic.active, 0)} / {clinicsDoctors.reduce((sum, clinic) => sum + clinic.total, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Across All Clinics</p>
            </div>
          </div>
          
          {/* Monthly Revenue Chart */}
          <div className="rounded-lg border bg-card p-6 shadow-sm mb-8">
            <h3 className="text-lg font-medium text-primary mb-4">Monthly Revenue</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(value) => value}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => {
                      // Get appointments for this day
                      const dayAppointments = revenueData.find(data => data.day === value.toString());
                      if (!dayAppointments) return [`$${value.toFixed(2)}`, 'Revenue'];

                      return [
                        <>
                          <div className="font-medium">Day {dayAppointments.day}</div>
                          <div className="text-sm">
                            Total Revenue: ${value.toFixed(2)}
                          </div>
                        </>,
                        'Revenue'
                      ];
                    }}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Two column layout for appointments and doctors */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming Appointments Timeline */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-primary mb-4">Upcoming Appointments</h3>
              <div className="space-y-5">
                {upcomingAppointments.length > 0 ? (                  upcomingAppointments.slice(0, 6).map((appointment) => (
                    <div key={appointment.bookingReference} className="flex gap-4 items-start border-l-4 border-primary pl-4 pb-2">
                      <div className="min-w-10 text-center">
                        <div className="bg-primary/10 rounded-full p-2">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.service?.name || 'Service'}</p>                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            try {
                              if (!appointment.appointmentTime) {
                                console.warn("Missing appointmentTime for", appointment.bookingReference);
                                return 'Date not specified';
                              }
                              return format(new Date(appointment.appointmentTime), 'MMM d, yyyy h:mm a');
                            } catch (e) {
                              console.error("Error formatting appointment time for", appointment.bookingReference, e);
                              return 'Invalid date';
                            }
                          })()}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                            {appointment.doctor?.user?.name || 'Dr. Unknown'}
                          </span>
                          <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                            {appointment.clinic?.name || 'Unknown Clinic'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 
                          appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                )}
                
                {upcomingAppointments.length > 6 && (
                  <div className="text-center mt-4">
                    <a href="/admin/appointments" className="text-primary hover:text-primary/80 text-sm font-medium">
                      View all {upcomingAppointments.length} appointments
                    </a>
                  </div>
                )}
              </div>
            </div>            {/* All Doctors */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-primary mb-4">All Doctors</h3>
              <div className="space-y-0.5">
                {allDoctors.map((doctor) => (
                  <div key={doctor.id} className="border-b py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {doctor.user?.name || doctor.name || `Doctor ${doctor.id}`}
                        </div>
                        {doctor.specialty && (
                          <div className="text-sm text-muted-foreground">
                            {doctor.specialty}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm mb-1">
                          {doctor.clinic?.name || 'Unassigned'}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          doctor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {doctor.status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {allDoctors.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No doctors found</p>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">
                    {allDoctors.filter(doc => doc.status === 'ACTIVE').length}
                  </span> of {allDoctors.length} doctors active
                </div>
                <a href="/admin/doctors" className="text-primary hover:text-primary/80 text-sm font-medium">
                  Manage doctors
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default AdminDashboardPage; // Export as default page component
