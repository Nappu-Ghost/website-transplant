type ServiceBadgeProps = {
  serviceType: string;
};

export const BookingServiceBadge = ({ serviceType }: ServiceBadgeProps) => {
  const getServiceColor = (serviceType: string) => {
    switch (serviceType) {
      case "Room":
        return "bg-blue-100 text-blue-800";
      case "Ferry":
        return "bg-green-100 text-green-800";
      case "Activity":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceColor(serviceType)}`}>
      {serviceType}
    </span>
  );
};

export default BookingServiceBadge;