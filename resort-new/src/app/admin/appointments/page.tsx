// src/app/admin/appointments/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, CalendarX, Check, X, Edit3 } from 'lucide-react'; // Added Edit3 for notes
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Removed Select imports as status updates are direct buttons now
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Define interfaces
interface User {
  name: string | null;
  email: string; // Assuming email is always present for customer
}

interface DoctorUser {
  name: string | null;
}

interface Doctor {
  id: number; // Added for constructing PUT payload
  user: DoctorUser | null;
  specialization: string; // Added for constructing PUT payload
  yearsOfExperience: number; // Added for constructing PUT payload
  // Add other Doctor fields required by AppointmentCreate if any
}

interface Service {
  id: number; // Added for constructing PUT payload
  name: string;
  description: string; // Added for constructing PUT payload
  durationMinutes: number; // Added for constructing PUT payload
  // Add other Service fields required by AppointmentCreate if any
}

interface Clinic {
  id: number; // Added for constructing PUT payload
  name: string;
  address: string; // Added for constructing PUT payload
  city: string; // Added for constructing PUT payload
  state: string; // Added for constructing PUT payload
  zipCode: string; // Added for constructing PUT payload
  // Add other Clinic fields required by AppointmentCreate if any
}

interface Appointment {
  id: string; // Assuming this is the integer ID from backend, aliased if needed
  bookingReference: string;
  appointmentTime: string;
  status: string;
  price: number;
  notes?: string | null;
  customerId: number; // Added for constructing PUT payload
  customer: User;
  serviceId: number; // Added for constructing PUT payload
  service: Service;
  clinicId: number; // Added for constructing PUT payload
  clinic: Clinic;
  doctorId: number; // Added for constructing PUT payload
  doctor: Doctor;
}

const statusVariants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  'SCHEDULED': 'default',
  'COMPLETED': 'secondary',
  'CANCELLED': 'destructive',
  'NOSHOW': 'outline'
};

export default function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState<Appointment | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false); // General updating state
  const { toast } = useToast();

  const getToken = useCallback(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token found. Please log in.",
          variant: "destructive",
        });
        // TODO: Consider redirecting to login page
        // router.push('/login');
        return null;
      }
      return token;
    }
    return null;
  }, [toast]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setLoading(false);
      setAppointments([]); // Clear appointments if no token
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(errorData.detail || `Failed to fetch appointments (${response.status})`);
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error Fetching Appointments",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setAppointments([]); // Clear appointments on error
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);


  // Helper to construct the full payload for PUT requests
  // This is needed because your Python backend's PUT expects a full AppointmentCreate-like object
  const constructPutPayload = (appointment: Appointment, updates: Partial<Appointment>): any => {
    const updatedAppointment = { ...appointment, ...updates };

    // Map to the structure expected by your Python backend's AppointmentCreate schema
    // Ensure all required fields for AppointmentCreate are present
    return {
      appointmentTime: updatedAppointment.appointmentTime, // Ensure this is ISO format if needed by backend
      status: updatedAppointment.status,
      price: updatedAppointment.price,
      notes: updatedAppointment.notes || null,
      customerId: updatedAppointment.customerId,
      serviceId: updatedAppointment.serviceId,
      clinicId: updatedAppointment.clinicId,
      doctorId: updatedAppointment.doctorId,
      // Add any other fields that are part of schemas.AppointmentCreate
      // and are NOT automatically handled by the backend (like IDs, created_at, etc.)
    };
  };


  const handleStatusUpdate = async (bookingReference: string, newStatus: string) => {
    setUpdating(true);
    const token = getToken();
    if (!token) {
      setUpdating(false);
      return;
    }

    const appointmentToUpdate = appointments.find(apt => apt.bookingReference === bookingReference);
    if (!appointmentToUpdate) {
      toast({ title: "Error", description: "Appointment not found locally.", variant: "destructive" });
      setUpdating(false);
      return;
    }

    // Construct the full payload for PUT
    const payload = constructPutPayload(appointmentToUpdate, { status: newStatus });

    try {
      const response = await fetch(`/api/appointments/${bookingReference}`, {
        method: 'PUT', // Still PUT, but sending full object (or what's needed by AppointmentCreate)
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(errorData.detail || `Failed to update status (${response.status})`);
      }

      // const updatedAppointmentData = await response.json(); // Get the full updated appointment from backend
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt.bookingReference === bookingReference ? { ...apt, status: newStatus } : apt // Simple local update for now
        )
      );
      // Or better: fetchAppointments(); // To get the freshest data including any backend side-effects

      toast({
        title: "Success",
        description: "Appointment status updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error Updating Status",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointmentForEdit(appointment);
    setCurrentNotes(appointment.notes || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointmentForEdit) return;
    setUpdating(true);
    const token = getToken();
    if (!token) {
      setUpdating(false);
      return;
    }

    // Construct the full payload for PUT
    const payload = constructPutPayload(selectedAppointmentForEdit, { notes: currentNotes });

    try {
      const response = await fetch(`/api/appointments/${selectedAppointmentForEdit.bookingReference}`, {
        method: 'PUT', // Still PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(errorData.detail || `Failed to update notes (${response.status})`);
      }

      // const updatedAppointmentData = await response.json();
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt.bookingReference === selectedAppointmentForEdit.bookingReference
            ? { ...apt, notes: currentNotes }
            : apt
        )
      );
      // Or better: fetchAppointments();

      setIsEditDialogOpen(false);
      setSelectedAppointmentForEdit(null);
      toast({
        title: "Success",
        description: "Appointment notes updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating appointment notes:', error);
      toast({
        title: "Error Updating Notes",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAppointment = async (bookingReference: string) => {
    // Optional: Add a confirmation dialog before deleting
    // if (!confirm("Are you sure you want to delete this appointment?")) return;

    setUpdating(true);
    const token = getToken();
    if (!token) {
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${bookingReference}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // For DELETE, response might be 204 No Content on success, or an error object on failure
        if (response.status === 204) {
          // Successfully deleted
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
          throw new Error(errorData.detail || `Failed to delete appointment (${response.status})`);
        }
      }

      setAppointments(prevAppointments =>
        prevAppointments.filter(apt => apt.bookingReference !== bookingReference)
      );
      toast({
        title: "Success",
        description: "Appointment deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error Deleting Appointment",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Appointments Management
              </CardTitle>
              <CardDescription>View and manage all dental appointments</CardDescription>
            </div>
            <Button onClick={fetchAppointments} disabled={loading || updating}>
              {loading || updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading appointments...</p>
                    </TableCell>
                  </TableRow>
                ) : appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.bookingReference}>
                      <TableCell className="font-medium">{appointment.bookingReference}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.customer.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{appointment.customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.service.name}</TableCell>
                      <TableCell>{appointment.doctor.user?.name || 'Dr. Unavailable'}</TableCell>
                      <TableCell>{appointment.clinic.name}</TableCell>
                      <TableCell>{format(new Date(appointment.appointmentTime), 'PPpp')}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[appointment.status] || 'default'}>{appointment.status}</Badge>
                      </TableCell>
                      <TableCell>${appointment.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2 flex-wrap">
                          {appointment.status === 'SCHEDULED' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-green-500 text-green-500 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(appointment.bookingReference, 'COMPLETED')}
                                disabled={updating}
                                title="Mark as Completed"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-500 text-red-500 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(appointment.bookingReference, 'CANCELLED')}
                                disabled={updating}
                                title="Mark as Cancelled"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-orange-500 text-orange-500 hover:bg-orange-50"
                                onClick={() => handleStatusUpdate(appointment.bookingReference, 'NOSHOW')}
                                disabled={updating}
                                title="Mark as No Show"
                              >
                                <CalendarX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(appointment)}
                            disabled={updating}
                            title="Edit Notes"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {/* Allow delete for CANCELLED or NOSHOW perhaps? Or only Admin? Adjust as needed. */}
                          {(appointment.status === 'CANCELLED' || appointment.status === 'NOSHOW') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.bookingReference)}
                              disabled={updating}
                              title="Delete Appointment"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground h-24">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment Notes</DialogTitle>
            <DialogDescription>
              Add or update notes for appointment <span className="font-semibold">{selectedAppointmentForEdit?.bookingReference}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-notes">Notes</Label>
              <Textarea
                id="appointment-notes"
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Add appointment notes here..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedAppointmentForEdit(null);
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={updating}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}