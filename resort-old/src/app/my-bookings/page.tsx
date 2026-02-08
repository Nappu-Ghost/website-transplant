"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BookingStatus } from "@/components/admin/bookings/types";

// Define interfaces
interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  floorNumber: number;
  isPremium: boolean;
  hotel: {
    id: number;
    name: string;
  };
}

interface Activity {
  id: number;
  name: string;
  activityType: string;
  price: number;
  isPremium?: boolean;
}

interface FerryTicket {
  id: number;
  numberOfTickets: number;
  price: number;
}

interface BookingRoom {
  id: number;
  roomId: number;
  room: Room;
}

interface BookingActivity {
  id: number;
  activityId: number;
  activity: Activity;
}

interface Booking {
  id: number;
  userId: number;
  numberOfGuests: number;
  status: BookingStatus;
  totalPrice: number;
  startDate: string;
  endDate: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  rooms: BookingRoom[];
  activities: BookingActivity[];
  ferryTicket: FerryTicket | null;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

// Status badge component
const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "PAYMENT_COMPLETED":
        return "bg-teal-500/20 text-teal-500 border-teal-500/30";
      case "CONFIRMED":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "CHECKED_IN":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "CHECKED_OUT":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "PAYMENT_COMPLETED":
        return "Payment Completed";
      case "CONFIRMED":
        return "Confirmed";
      case "CHECKED_IN":
        return "Checked In";
      case "CHECKED_OUT":
        return "Checked Out";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};

// Service type badge component
const ServiceBadge = ({ type }: { type: "Room" | "Activity" | "Ferry" }) => {
  const getBadgeColor = () => {
    switch (type) {
      case "Room":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "Activity":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "Ferry":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-md border ${getBadgeColor()}`}
    >
      {type}
    </span>
  );
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchUserBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bookings/user?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        
        const data = await response.json();
        setBookings(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load your bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  // Filter bookings based on active tab
  const today = new Date();
  
  const filteredBookings = bookings.filter((booking) => {
    const endDate = new Date(booking.endDate);
    
    if (activeTab === "upcoming") {
      return endDate >= today && booking.status !== "CANCELLED";
    } else if (activeTab === "past") {
      return endDate < today || booking.status === "CHECKED_OUT";
    } else if (activeTab === "cancelled") {
      return booking.status === "CANCELLED";
    }
    
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Toggle booking details
  const toggleBookingDetails = (bookingId: number) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <p className="mb-6">You need to be logged in to view your bookings.</p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full font-medium transition-all duration-300 hover:scale-105"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="mb-10 bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="shrink-0 relative w-32 h-32">
              <Image
                src={user.profileImage || "/profile.svg"}
                alt={user.name}
                fill
                className="rounded-full object-cover ring-4 ring-white/30 shadow-xl"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-blue-200 mb-3">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 border border-white/30 text-white">
                  {user.role}
                </span>
                {user.role === "PREMIUM" && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    Premium Member
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-200">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex-grow"></div>
            <Link
              href="/booking"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Book New Stay
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex overflow-x-auto space-x-2 bg-white/5 backdrop-blur-lg p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "upcoming"
                ? "bg-white/15 text-white shadow-md"
                : "text-blue-200 hover:bg-white/10"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "past"
                ? "bg-white/15 text-white shadow-md"
                : "text-blue-200 hover:bg-white/10"
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "cancelled"
                ? "bg-white/15 text-white shadow-md"
                : "text-blue-200 hover:bg-white/10"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-20 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mb-4"></div>
                <p className="text-blue-200">Loading your bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 text-center">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-300 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No {activeTab} bookings found</h3>
              <p className="text-blue-200 mb-6">
                {activeTab === "upcoming" 
                  ? "You don't have any upcoming stays. Ready to plan your next getaway?" 
                  : activeTab === "past"
                  ? "You don't have any past stays with us yet."
                  : "You don't have any cancelled bookings."}
              </p>
              {activeTab === "upcoming" && (
                <Link
                  href="/booking"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Book Your Stay
                </Link>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                {/* Booking Card Header */}
                <div
                  onClick={() => toggleBookingDetails(booking.id)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-blue-200">#{booking.id}</span>
                        <StatusBadge status={booking.status} />
                        {booking.isPremium && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                            Premium
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {booking.rooms && booking.rooms.length > 0 
                          ? `${booking.rooms[0].room.hotel.name} - ${booking.rooms.length} ${booking.rooms.length === 1 ? 'Room' : 'Rooms'}`
                          : (booking.activities && booking.activities.length > 0)
                          ? `${booking.activities.length} ${booking.activities.length === 1 ? 'Activity' : 'Activities'}`
                          : booking.ferryTicket
                          ? 'Ferry Booking'
                          : 'Booking'}
                      </h3>
                      <div className="text-blue-200 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{booking.numberOfGuests} Guests</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-2xl font-bold text-white mb-2">
                        ${booking.totalPrice.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1 text-blue-200 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Booked {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2 flex-wrap">
                      {booking.rooms && booking.rooms.length > 0 && (
                        <ServiceBadge type="Room" />
                      )}
                      {booking.activities && booking.activities.length > 0 && (
                        <ServiceBadge type="Activity" />
                      )}
                      {booking.ferryTicket && (
                        <ServiceBadge type="Ferry" />
                      )}
                    </div>
                    
                    <div className="text-blue-200">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 transform transition-transform duration-300 ${expandedBookingId === booking.id ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBookingId === booking.id && (
                  <div className="border-t border-white/10 p-6 bg-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Rooms Section */}
                      {booking.rooms && booking.rooms.length > 0 && (
                        <div className="lg:col-span-2">
                          <h4 className="text-lg font-semibold text-white mb-3">Rooms</h4>
                          <div className="space-y-3">
                            {booking.rooms.map((roomBooking: BookingRoom) => (
                              <div key={roomBooking.id} className="bg-white/10 p-4 rounded-lg border border-white/10">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                  <div>
                                    <h5 className="font-medium text-white">{roomBooking.room.name}</h5>
                                    <p className="text-sm text-blue-200">{roomBooking.room.type} • {roomBooking.room.hotel.name}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                                        Floor {roomBooking.room.floorNumber}
                                      </span>
                                      <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                                        {roomBooking.room.capacity} {roomBooking.room.capacity === 1 ? 'Guest' : 'Guests'}
                                      </span>
                                      {roomBooking.room.isPremium && (
                                        <span className="text-sm bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                                          Premium
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-white">${roomBooking.room.price.toFixed(2)}</div>
                                    <p className="text-sm text-blue-200">per night</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Activities Section */}
                      {booking.activities && booking.activities.length > 0 && (
                        <div className="lg:col-span-2">
                          <h4 className="text-lg font-semibold text-white mb-3">Activities</h4>
                          <div className="space-y-3">
                            {booking.activities.map((activityBooking: BookingActivity) => (
                              <div key={activityBooking.id} className="bg-white/10 p-4 rounded-lg border border-white/10">
                                <div className="flex justify-between gap-4">
                                  <div>
                                    <h5 className="font-medium text-white">{activityBooking.activity.name}</h5>
                                    <p className="text-sm text-blue-200">{activityBooking.activity.activityType}</p>
                                    {activityBooking.activity.isPremium && (
                                      <span className="inline-block mt-2 text-sm bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                                        Premium Activity
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-white">${activityBooking.activity.price.toFixed(2)}</div>
                                    <p className="text-sm text-blue-200">per person</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ferry Section */}
                      {booking.ferryTicket && (
                        <div className="lg:col-span-2">
                          <h4 className="text-lg font-semibold text-white mb-3">Ferry Tickets</h4>
                          <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between gap-4">
                              <div>
                                <h5 className="font-medium text-white">Island Ferry Tickets</h5>
                                <p className="text-sm text-blue-200">
                                  {booking.ferryTicket.numberOfTickets} {booking.ferryTicket.numberOfTickets === 1 ? 'ticket' : 'tickets'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">${booking.ferryTicket.price.toFixed(2)}</div>
                                <p className="text-sm text-blue-200">total</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Booking Summary */}
                      <div className="lg:row-start-1 lg:col-start-3 lg:row-span-2">
                        <div className="bg-white/10 p-4 rounded-lg border border-white/10 sticky top-4">
                          <h4 className="text-lg font-semibold text-white mb-3">Booking Summary</h4>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-200">Status</span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-200">Check-in</span>
                              <span className="text-white">{formatDate(booking.startDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-200">Check-out</span>
                              <span className="text-white">{formatDate(booking.endDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-200">Guests</span>
                              <span className="text-white">{booking.numberOfGuests}</span>
                            </div>
                            
                            <div className="border-t border-white/10 my-3"></div>
                            
                            {booking.rooms && booking.rooms.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-200">Rooms</span>
                                <span className="text-white">{booking.rooms.length} × Room{booking.rooms.length !== 1 && 's'}</span>
                              </div>
                            )}
                            
                            {booking.activities && booking.activities.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-200">Activities</span>
                                <span className="text-white">{booking.activities.length} × Activity{booking.activities.length !== 1 && 'ies'}</span>
                              </div>
                            )}
                            
                            {booking.ferryTicket && (
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-200">Ferry Tickets</span>
                                <span className="text-white">{booking.ferryTicket.numberOfTickets}</span>
                              </div>
                            )}
                            
                            <div className="border-t border-white/10 my-3"></div>
                            
                            <div className="flex justify-between font-semibold">
                              <span className="text-blue-100">Total Price</span>
                              <span className="text-xl text-white">${booking.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          {booking.status === "PENDING" && (
                            <div className="mt-4 flex flex-col space-y-2">
                              <button 
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle payment
                                  window.location.href = `/booking/payment?id=${booking.id}`;
                                }}
                              >
                                Complete Payment
                              </button>
                              
                              <button 
                                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 rounded-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle cancellation
                                  if (window.confirm("Are you sure you want to cancel this booking?")) {
                                    // Cancellation logic would go here
                                  }
                                }}
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                          
                          {booking.status !== "PENDING" && booking.status !== "CANCELLED" && (
                            <div className="mt-4">
                              <Link
                                href={`/booking/details?id=${booking.id}`}
                                className="block w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-center rounded-lg transition-colors"
                              >
                                View Details
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}