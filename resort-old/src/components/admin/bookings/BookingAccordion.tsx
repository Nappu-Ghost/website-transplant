import { useState } from "react";
import { Booking, BookingStatus } from "./types";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingServiceBadge from "./BookingServiceBadge";
import BookingActions from "./BookingActions";

type BookingAccordionItemProps = {
  booking: Booking;
  onUpdateStatus: (id: number, status: BookingStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isOpen: boolean;
  toggleOpen: () => void;
};

const BookingAccordionItem = ({ 
  booking, 
  onUpdateStatus, 
  onDelete,
  isOpen,
  toggleOpen
}: BookingAccordionItemProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end.getTime() - start.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.round(differenceInDays);
  };

  // Get service counts
  const roomCount = booking.rooms.length;
  const activityCount = booking.activities.length;
  const ferryTicketCount = booking.ferryTicket ? booking.ferryTicket.numberOfTickets : 0;

  const duration = calculateDuration(booking.startDate, booking.endDate);

  return (
    <div 
      className={`mb-4 rounded-lg overflow-hidden transition-all duration-300`}
      style={{
        background: "var(--glass-background)",
        borderColor: "var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Accordion Header - Always visible */}
      <div 
        className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
            {booking.user.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {booking.user.name}
              <span className="text-sm text-gray-500">#{booking.id}</span>
              {booking.isPremium && (
                <span className="px-2 py-0.5 bg-yellow-500 bg-opacity-20 text-white-500 rounded-full text-xs">
                  Premium
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">{booking.user.email}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {roomCount > 0 && (
            <div className="text-sm px-2 py-1 bg-blue-500 bg-opacity-10 text-blue-100 rounded-lg">
              {roomCount} Room{roomCount !== 1 ? 's' : ''}
            </div>
          )}
          {activityCount > 0 && (
            <div className="text-sm px-2 py-1 bg-purple-500 bg-opacity-10 text-purple-100 rounded-lg">
              {activityCount} Activity{activityCount !== 1 ? 'ies' : 'y'}
            </div>
          )}
          {ferryTicketCount > 0 && (
            <div className="text-sm px-2 py-1 bg-green-500 bg-opacity-10 text-green-100 rounded-lg">
              {ferryTicketCount} Ferry Ticket{ferryTicketCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-gray-400">
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)} 
            <span className="ml-1 text-xs">({duration} {duration === 1 ? 'day' : 'days'})</span>
          </div>
          <div className="font-semibold">${booking.totalPrice.toFixed(2)}</div>
          <BookingStatusBadge status={booking.status} />
          <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Accordion Content - Only visible when expanded */}
      {isOpen && (
        <div className="p-4 border-t border-gray-700 border-opacity-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Details */}
            <div>
              <h3 className="text-sm uppercase text-gray-500 mb-2">Booking Details</h3>
              <div className="bg-gray-800 bg-opacity-30 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <div className="text-xs text-gray-500">Booking ID</div>
                    <div className="font-medium">#{booking.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Guests</div>
                    <div className="font-medium">{booking.numberOfGuests}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="font-medium">{formatDate(booking.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="font-medium">{formatDate(booking.updatedAt)}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-700 border-opacity-50">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="mt-1">
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Booked Services */}
            <div className="lg:col-span-2">
              <h3 className="text-sm uppercase text-gray-500 mb-2">Booked Services</h3>
              <div className="space-y-3">
                {/* Rooms */}
                {booking.rooms.length > 0 && (
                  <div className="bg-gray-800 bg-opacity-30 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BookingServiceBadge serviceType="Room" />
                      <span className="ml-2 text-sm">{booking.rooms.length} room(s)</span>
                    </div>
                    <div className="space-y-2">
                      {booking.rooms.map((bookingRoom) => (
                        <div key={bookingRoom.id} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{bookingRoom.room.name}</div>
                            <div className="text-xs text-gray-400">{bookingRoom.room.type}, {bookingRoom.room.capacity} guests, Floor {bookingRoom.room.floorNumber}</div>
                          </div>
                          <div className="font-medium">${bookingRoom.room.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities */}
                {booking.activities.length > 0 && (
                  <div className="bg-gray-800 bg-opacity-30 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BookingServiceBadge serviceType="Activity" />
                      <span className="ml-2 text-sm">{booking.activities.length} activity(s)</span>
                    </div>
                    <div className="space-y-2">
                      {booking.activities.map((bookingActivity) => (
                        <div key={bookingActivity.id} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{bookingActivity.activity.name}</div>
                            <div className="text-xs text-gray-400">{bookingActivity.activity.activityType}</div>
                          </div>
                          <div className="font-medium">${bookingActivity.activity.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ferry Tickets */}
                {booking.ferryTicket && (
                  <div className="bg-gray-800 bg-opacity-30 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BookingServiceBadge serviceType="Ferry" />
                      <span className="ml-2 text-sm">{booking.ferryTicket.numberOfTickets} ticket(s)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>Ferry Tickets ({booking.ferryTicket.numberOfTickets}x)</div>
                      <div className="font-medium">${booking.ferryTicket.price.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6">
            <BookingActions 
              bookingId={booking.id}
              currentStatus={booking.status}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

type BookingAccordionProps = {
  bookings: Booking[];
  onUpdateStatus: (id: number, status: BookingStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export const BookingAccordion = ({ 
  bookings, 
  onUpdateStatus, 
  onDelete 
}: BookingAccordionProps) => {
  const [openBookingId, setOpenBookingId] = useState<number | null>(null);

  const toggleBooking = (bookingId: number) => {
    setOpenBookingId(openBookingId === bookingId ? null : bookingId);
  };

  return (
    <div className="space-y-4">
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingAccordionItem
            key={booking.id}
            booking={booking}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            isOpen={openBookingId === booking.id}
            toggleOpen={() => toggleBooking(booking.id)}
          />
        ))
      ) : (
        <div
          className="rounded-xl p-8 text-center text-gray-400"
          style={{
            background: "var(--glass-background)",
            borderColor: "var(--glass-border)",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          No bookings found matching your criteria
        </div>
      )}
    </div>
  );
};

export default BookingAccordion;