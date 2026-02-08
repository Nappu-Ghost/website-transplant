import React from 'react';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  imageUrl: string;
  floorNumber: number;
  available: boolean;
  isPremium: boolean;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  floors: number;
}

interface Activity {
  id: number;
  name: string;
  activityType: string;
  price: number;
  capacity: number | null;
  imageUrl: string;
  isPremium: boolean;
}

interface BookingReviewProps {
  name: string;
  email: string;
  numberOfPeople: number;
  checkInDate: string;
  checkOutDate: string;
  selectedHotel: Hotel | null;
  selectedRooms: Room[];
  selectedActivities: number[];
  activities: Activity[];
  ferryTickets: number;
  isPremiumPlan: boolean;
  calculateTotalPrice: () => number;
}

const BookingReview: React.FC<BookingReviewProps> = ({
  name,
  email,
  numberOfPeople,
  checkInDate,
  checkOutDate,
  selectedHotel,
  selectedRooms,
  selectedActivities,
  activities,
  ferryTickets,
  isPremiumPlan,
  calculateTotalPrice
}) => {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-white mb-8">Review Your Booking</h2>

      {/* Personal Information */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400">Name</label>
            <p className="text-lg text-white">{name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400">Email</label>
            <p className="text-lg text-white">{email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400">Number of Guests</label>
            <p className="text-lg text-white">{numberOfPeople} people</p>
          </div>
          {isPremiumPlan && (
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Premium Plan Selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stay Details */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Stay Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-400">Check-in Date</label>
            <p className="text-lg text-white">
              {format(new Date(checkInDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400">Check-out Date</label>
            <p className="text-lg text-white">
              {format(new Date(checkOutDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400">Duration</label>
            <p className="text-lg text-white">
              {Math.max(differenceInDays(new Date(checkOutDate), new Date(checkInDate)), 1)} nights
            </p>
          </div>
        </div>
      </div>

      {/* Accordions for main sections */}
      <details className="group bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <div>
              <h3 className="text-xl font-semibold text-white">Accommodation</h3>
              <p className="text-sm text-gray-400">Hotel and Room Details</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-white transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="p-6 pt-0">
          {selectedHotel && (
            <div className="mb-6">
              <label className="block text-sm text-gray-400">Selected Hotel</label>
              <div className="flex items-start gap-4 mt-2">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedHotel.imageUrl}
                    alt={selectedHotel.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{selectedHotel.name}</p>
                  <p className="text-gray-400">{selectedHotel.location}</p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Selected Rooms</label>
            <div className="space-y-4">
              {selectedRooms.map(room => (
                <div key={room.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={room.imageUrl}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold text-white">{room.name}</p>
                        <p className="text-gray-400">{room.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          ${room.price}/night
                        </p>
                        <p className="text-sm text-gray-400">
                          Capacity: {room.capacity} guests
                        </p>
                      </div>
                    </div>
                    {room.isPremium && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Premium Room
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>

      {/* Activities Accordion */}
      {selectedActivities.length > 0 && (
        <details className="group bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white">Selected Activities</h3>
                <p className="text-sm text-gray-400">{selectedActivities.length} activities selected</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-white transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedActivities.map(activityId => {
                const activity = activities.find(a => a.id === activityId);
                if (!activity) return null;
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-white">{activity.name}</p>
                          <p className="text-gray-400">{activity.activityType}</p>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          ${activity.price}
                        </p>
                      </div>
                      {activity.isPremium && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Premium Activity
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      )}

      {/* Ferry Tickets Accordion */}
      {(ferryTickets > 0 || isPremiumPlan) && (
        <details className="group bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white">Ferry Tickets</h3>
                <p className="text-sm text-gray-400">
                  {isPremiumPlan ? 'Free with Premium Plan' : `${ferryTickets} tickets`}
                </p>
              </div>
            </div>
            <svg className="w-6 h-6 text-white transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg text-white">
                  {ferryTickets} round-trip ticket{ferryTickets !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-400">Transfer to Theme Park Island</p>
              </div>
              <div className="text-right">
                {isPremiumPlan ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Free with Premium Plan
                  </span>
                ) : (
                  <p className="text-lg font-semibold text-white">
                    ${ferryTickets * 1}
                  </p>
                )}
              </div>
            </div>
          </div>
        </details>
      )}

      {/* Cost Breakdown */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h3>
        <div className="space-y-4">
          {/* Room Costs */}
          <div>
            <h4 className="text-lg text-white mb-2">Room Charges</h4>
            {selectedRooms.map(room => (
              <div key={room.id} className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">
                  {room.name} ({Math.max(differenceInDays(new Date(checkOutDate), new Date(checkInDate)), 1)} nights × ${room.price})
                </span>
                <span className="text-white">
                  ${room.price * Math.max(differenceInDays(new Date(checkOutDate), new Date(checkInDate)), 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Activities Cost */}
          {selectedActivities.length > 0 && (
            <div>
              <h4 className="text-lg text-white mb-2">Activities</h4>
              {selectedActivities.map(activityId => {
                const activity = activities.find(a => a.id === activityId);
                if (!activity) return null;
                return (
                  <div key={activity.id} className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">{activity.name}</span>
                    <span className="text-white">${activity.price}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ferry Tickets Cost */}
          {ferryTickets > 0 && (
            <div>
              <h4 className="text-lg text-white mb-2">Ferry Tickets</h4>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">
                  {ferryTickets} Ferry Ticket{ferryTickets !== 1 ? 's' : ''}
                </span>
                <span className="text-white">
                  {isPremiumPlan ? 'Free' : `$${ferryTickets * 1}`}
                </span>
              </div>
            </div>
          )}

          {/* Premium Plan Cost */}
          {isPremiumPlan && (
            <div>
              <h4 className="text-lg text-white mb-2">Premium Plan</h4>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Premium Plan Benefits</span>
                <span className="text-white">$100</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">Total</span>
              <span className="text-3xl font-bold text-white">${calculateTotalPrice()}</span>
            </div>
            {isPremiumPlan && (
              <div className="mt-2 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-300 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-purple-300">Premium Plan Benefits:</p>
                    <ul className="mt-1 space-y-1 text-sm text-purple-300/80">
                      <li>• Unlimited Free Ferry Tickets</li>
                      <li>• Access to Premium Rooms</li>
                      <li>• Premium Activities</li>
                      <li>• Priority First Services</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;