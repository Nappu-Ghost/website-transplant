import { BookingStatus } from "./types";

type BookingFiltersProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: BookingStatus | "ALL";
  setSelectedStatus: (status: BookingStatus | "ALL") => void;
  selectedService: "Room" | "Ferry" | "Activity" | "ALL";
  setSelectedService: (service: "Room" | "Ferry" | "Activity" | "ALL") => void;
};

export const BookingFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedService,
  setSelectedService,
}: BookingFiltersProps) => {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 p-6 mb-6"
      style={{
        background: "var(--glass-background)",
        borderColor: "var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Search Bookings
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, room, activity, or ID"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Filter by Status
          </label>
          <select
            id="status"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as BookingStatus | "ALL")
            }
          >
            <option value="ALL">All Statuses</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.PAYMENT_COMPLETED}>Payment Completed</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.CHECKED_IN}>Checked In</option>
            <option value={BookingStatus.CHECKED_OUT}>Checked Out</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="service"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Filter by Service
          </label>
          <select
            id="service"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedService}
            onChange={(e) =>
              setSelectedService(e.target.value as "Room" | "Ferry" | "Activity" | "ALL")
            }
          >
            <option value="ALL">All Services</option>
            <option value="Room">Room</option>
            <option value="Ferry">Ferry</option>
            <option value="Activity">Activity</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;