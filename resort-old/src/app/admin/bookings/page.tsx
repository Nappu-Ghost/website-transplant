"use client";

import { useState, useEffect } from "react";
import { BookingStatus, Booking } from "@/components/admin/bookings/types";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import BookingsList from "@/components/admin/bookings/BookingsList";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">("ALL");
  const [selectedService, setSelectedService] = useState<"Room" | "Ferry" | "Activity" | "ALL">("ALL");

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/bookings");
        
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        
        const data = await response.json();
        setBookings(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Function to update booking status
  const updateBookingStatus = async (id: number, status: BookingStatus) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      const updatedBooking = await response.json();
      
      // Update the booking in the state
      setBookings(bookings.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking status. Please try again.");
    }
  };

  // Function to delete a booking
  const deleteBooking = async (id: number) => {
    try {
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      // Remove the booking from the state
      setBookings(bookings.filter(booking => booking.id !== id));
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking. Please try again.");
    }
  };

  // Filter bookings based on search term, status, and service
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.id.toString().includes(searchTerm) ||
      booking.rooms.some(r => r.room.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.activities.some(a => a.activity.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === "ALL" || booking.status === selectedStatus;
    
    const matchesService =
      selectedService === "ALL" || 
      (selectedService === "Room" && booking.rooms.length > 0) ||
      (selectedService === "Activity" && booking.activities.length > 0) ||
      (selectedService === "Ferry" && booking.ferryTicket !== null);

    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Bookings Management</h1>
        <div className="flex space-x-3 sm:space-x-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Data
          </button>
          <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Add Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <BookingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />

      {/* Bookings List */}
      <BookingsList
        bookings={bookings}
        filteredBookings={filteredBookings}
        onUpdateStatus={updateBookingStatus}
        onDelete={deleteBooking}
        loading={loading}
        error={error}
      />
    </div>
  );
}
