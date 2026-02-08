import React from 'react';
import { format } from 'date-fns';
import Image from 'next/image';

interface BookingConfirmationProps {
  totalAmount: number;
  formData?: {
    name: string;
    email: string;
    numberOfPeople: number;
    checkInDate: string;
    checkOutDate: string;
    selectedHotel: {
      name: string;
      location: string;
    } | null;
    selectedRooms: Array<{
      name: string;
      type: string;
      price: number;
    }>;
    selectedActivities: number[];
    isPremiumPlan: boolean;
    ferryTickets: number;
  };
  onConfirmation: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ totalAmount, formData, onConfirmation }) => {
  const bookingReference = `BKG-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
  const bookingDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-white mb-8">Booking Confirmed!</h2>
        
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Thank you for booking with us! Your reservation has been confirmed and all details have been sent to your email address.
        </p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">Booking Receipt</h3>
            <p className="text-gray-400">Generated on {bookingDate}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Booking Reference</p>
            <p className="text-white font-medium text-lg">{bookingReference}</p>
          </div>
        </div>

        {formData && (
          <div className="space-y-8">
            {/* Guest Information */}
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Guest Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Guest Name</p>
                  <p className="text-white">{formData.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Number of Guests</p>
                  <p className="text-white">{formData.numberOfPeople}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Membership</p>
                  <p className="text-white flex items-center gap-2">
                    {formData.isPremiumPlan ? (
                      <>
                        Premium Plan
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-md border border-purple-500/30">
                          Premium
                        </span>
                      </>
                    ) : (
                      'Standard Plan'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Stay Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.selectedHotel && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm">Hotel</p>
                      <p className="text-white">{formData.selectedHotel.name}</p>
                      <p className="text-gray-400 text-sm">{formData.selectedHotel.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white">
                        {format(new Date(formData.checkInDate), 'MMM d, yyyy')} - {format(new Date(formData.checkOutDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Room Details */}
              {formData.selectedRooms.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2">Rooms Selected</p>
                  <div className="space-y-2">
                    {formData.selectedRooms.map((room, index) => (
                      <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                        <div>
                          <p className="text-white">{room.name}</p>
                          <p className="text-gray-400 text-sm">{room.type}</p>
                        </div>
                        <p className="text-white">${room.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Services */}
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Additional Services</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.ferryTickets > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm">Ferry Tickets</p>
                    <p className="text-white">{formData.ferryTickets} ticket(s)</p>
                  </div>
                )}
                {formData.selectedActivities.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm">Activities Booked</p>
                    <p className="text-white">{formData.selectedActivities.length} activities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white">Total Amount</h4>
                <p className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={onConfirmation}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;