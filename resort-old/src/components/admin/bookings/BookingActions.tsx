import { useState } from "react";
import { BookingStatus } from "./types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type BookingActionsProps = {
  bookingId: number;
  currentStatus: BookingStatus;
  onUpdateStatus: (id: number, status: BookingStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export const BookingActions = ({
  bookingId,
  currentStatus,
  onUpdateStatus,
  onDelete,
}: BookingActionsProps) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { label: "Pending", value: BookingStatus.PENDING, color: "text-yellow-500" },
    { label: "Payment Completed", value: BookingStatus.PAYMENT_COMPLETED, color: "text-teal-500" },
    { label: "Confirmed", value: BookingStatus.CONFIRMED, color: "text-green-500" },
    { label: "Checked In", value: BookingStatus.CHECKED_IN, color: "text-purple-500" },
    { label: "Checked Out", value: BookingStatus.CHECKED_OUT, color: "text-blue-500" },
    { label: "Cancelled", value: BookingStatus.CANCELLED, color: "text-red-500" },
  ];

  const handleStatusUpdate = async () => {
    if (selectedStatus !== currentStatus) {
      setIsUpdating(true);
      try {
        await onUpdateStatus(bookingId, selectedStatus);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      await onDelete(bookingId);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">Status:</span>
          <RadioGroup 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
            className="flex flex-wrap gap-2"
            orientation="horizontal"
          >
            {statusOptions.map((option) => (
              <div 
                key={option.value} 
                className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                  selectedStatus === option.value 
                    ? `bg-gray-700 bg-opacity-50` 
                    : 'hover:bg-gray-800 hover:bg-opacity-50'
                }`}
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={`status-${option.value}`} 
                  className={option.color}
                />
                <label 
                  htmlFor={`status-${option.value}`} 
                  className="text-xs font-medium leading-none cursor-pointer whitespace-nowrap"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      <div className="flex gap-2">
        {selectedStatus !== currentStatus && (
          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating}
            className="px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        )}
        <button
          onClick={handleDelete}
          className="px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BookingActions;