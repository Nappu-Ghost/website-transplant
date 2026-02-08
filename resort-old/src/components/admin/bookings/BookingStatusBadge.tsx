import { BookingStatus } from "./types";

type StatusBadgeProps = {
  status: BookingStatus;
};

export const BookingStatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-green-500 bg-opacity-20 text-white-500";
      case BookingStatus.PENDING:
        return "bg-yellow-500 bg-opacity-20 text-white-500";
      case BookingStatus.CANCELLED:
        return "bg-red-500 bg-opacity-20 text-white-500";
      case BookingStatus.CHECKED_OUT:
        return "bg-blue-500 bg-opacity-20 text-white-500";
      case BookingStatus.CHECKED_IN:
        return "bg-purple-500 bg-opacity-20 text-white-500";
      case BookingStatus.PAYMENT_COMPLETED:
        return "bg-teal-500 bg-opacity-20 text-white-500";
      default:
        return "bg-gray-500 bg-opacity-20 text-white-500";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default BookingStatusBadge;