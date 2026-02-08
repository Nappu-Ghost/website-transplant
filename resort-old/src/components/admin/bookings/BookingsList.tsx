import { Booking, BookingStatus } from "./types";
import BookingAccordion from "./BookingAccordion";

type BookingsListProps = {
  bookings: Booking[];
  filteredBookings: Booking[];
  onUpdateStatus: (id: number, status: BookingStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export const BookingsList = ({
  bookings,
  filteredBookings,
  onUpdateStatus,
  onDelete,
  loading,
  error
}: BookingsListProps) => {
  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-4 text-gray-400">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      )}

      {/* Bookings Accordion */}
      {!loading && !error && (
        <BookingAccordion
          bookings={filteredBookings}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default BookingsList;