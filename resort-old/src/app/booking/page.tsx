"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Import existing components
import HotelSelection from '@/components/HotelSelection';
import RoomSelection from '@/components/RoomSelection';
import FerryTickets from '@/components/FerryTickets';
import Payment from '@/components/Payment';

// Import our new components
import {
  BookingSteps,
  BookingInfo,
  DateSelector,
  PremiumPlanCard,
  ActivitiesSelection,
  BookingReview,
  BookingConfirmation
} from '@/components/booking';

interface BookingStep {
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  floors: number;
}

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

interface Activity {
  id: number;
  name: string;
  activityType: ActivityType;
  price: number;
  capacity: number | null;
  imageUrl: string;
  isPremium: boolean;
}

type ActivityType = "Beach" | "Theme park" | "Other";

interface BookingFormData {
  name: string;
  email: string;
  numberOfPeople: number;
  checkInDate: string;
  checkOutDate: string;
  selectedRoom: Room | null;
  selectedActivities: number[];
  isPremiumPlan: boolean;
  selectedHotel: Hotel | null;
  totalPrice: number;
  ferryTickets: number;
  selectedRooms: Room[]; // Adding support for multiple rooms
}

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    numberOfPeople: 1,
    checkInDate: '',
    checkOutDate: '',
    selectedRoom: null,
    selectedActivities: [],
    isPremiumPlan: false,
    selectedHotel: null,
    totalPrice: 0,
    ferryTickets: 0,
    selectedRooms: [] // Adding support for multiple rooms
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Autofill user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  useEffect(() => {
    // Fetch real hotel data from your data source
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels');
        if (!response.ok) {
          throw new Error('Failed to fetch hotels');
        }
        const data = await response.json();
        setHotels(data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) throw new Error('Failed to fetch activities');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const handlePremiumPlanToggle = () => {
    setFormData(prev => ({
      ...prev,
      isPremiumPlan: !prev.isPremiumPlan
    }));
  };

  const handleActivityToggle = (activityId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activityId)
        ? prev.selectedActivities.filter(id => id !== activityId)
        : [...prev.selectedActivities, activityId]
    }));
  };

  const handleTicketsChange = (increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      ferryTickets: increment 
        ? prev.ferryTickets + 1
        : Math.max(prev.ferryTickets - 1, 0)
    }));
  };

  const handlePaymentComplete = async () => {
    try {
      // Create booking in database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          numberOfGuests: formData.numberOfPeople,
          totalPrice: calculateTotalPrice(),
          startDate: formData.checkInDate,
          endDate: formData.checkOutDate,
          isPremium: formData.isPremiumPlan,
          rooms: formData.selectedRooms.map(room => room.id),
          activities: formData.selectedActivities,
          ferryTickets: formData.ferryTickets > 0 ? {
            numberOfTickets: formData.ferryTickets,
            price: formData.isPremiumPlan ? 0 : formData.ferryTickets * 5 // $5 per ticket if not premium
          } : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();
      console.log('Booking created:', booking);
      
      setIsPaymentComplete(true);
      handleNext(); // Move to confirmation step
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to save booking. Please try again.');
      throw error; // Re-throw error so Payment component can handle it
    }
  };

  const handleConfirmation = () => {
    router.push('/my-bookings'); // redirect to the My Bookings page after confirmation
  };

  const steps: BookingStep[] = [
    { title: 'Booking Info', isCompleted: currentStep > 1, isCurrent: currentStep === 1 },
    { title: 'Hotel Selection', isCompleted: currentStep > 2, isCurrent: currentStep === 2 },
    { title: 'Room Selection', isCompleted: currentStep > 3, isCurrent: currentStep === 3 },
    { title: 'Activities', isCompleted: currentStep > 4, isCurrent: currentStep === 4 },
    { title: 'Ferry Tickets', isCompleted: currentStep > 5, isCurrent: currentStep === 5 },
    { title: 'Review', isCompleted: currentStep > 6, isCurrent: currentStep === 6 },
    { title: 'Payment', isCompleted: currentStep > 7, isCurrent: currentStep === 7 },
    { title: 'Confirmation', isCompleted: currentStep > 8, isCurrent: currentStep === 8 }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberOfPeopleChange = (increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      numberOfPeople: increment 
        ? Math.min(prev.numberOfPeople + 1, 10)
        : Math.max(prev.numberOfPeople - 1, 1)
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name.trim() !== '' &&
          formData.email.trim() !== '' &&
          formData.numberOfPeople > 0 &&
          formData.checkInDate !== '' &&
          formData.checkOutDate !== ''
        );
      case 2:
        return formData.selectedHotel !== null;
      case 3:
        const totalCapacity = formData.selectedRooms.reduce((sum, room) => sum + room.capacity, 0);
        return totalCapacity >= formData.numberOfPeople;
      case 4:
        return true; // Activities are optional
      case 5:
        return true; // Ferry tickets are optional
      case 6:
        return true; // Review step
      case 7:
        return true; // Payment step will be handled by the Pay button
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 7) {
      // On payment page, check if payment is complete before allowing confirmation
      if (!isPaymentComplete) {
        toast.error("Please complete the payment before confirming your booking");
        return;
      }
    }
    
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotalPrice = () => {
    let price = 0;
    const checkIn = formData.checkInDate ? new Date(formData.checkInDate) : null;
    const checkOut = formData.checkOutDate ? new Date(formData.checkOutDate) : null;
    
    // Calculate number of nights
    const numberOfNights = checkIn && checkOut ? 
      Math.max(differenceInDays(checkOut, checkIn), 1) : // Ensure minimum 1 night
      1;

    // Calculate total room prices (price per night * number of nights)
    formData.selectedRooms.forEach(room => {
      price += room.price * numberOfNights;
    });

    // Activities price (one-time cost)
    formData.selectedActivities.forEach(activityId => {
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        price += activity.price;
      }
    });

    // Ferry tickets price (one-time cost)
    if (!formData.isPremiumPlan) {
      price += formData.ferryTickets * 1; // $1 per ticket
    }

    // Add premium plan price (one-time cost)
    if (formData.isPremiumPlan) {
      price += 100; // Premium plan cost
    }

    return price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Progress Bar */}
      <BookingSteps steps={steps} currentStep={currentStep} />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Booking Information - Left Column */}
            <BookingInfo 
              name={formData.name}
              email={formData.email}
              numberOfPeople={formData.numberOfPeople}
              onInputChange={handleInputChange}
              onNumberOfPeopleChange={handleNumberOfPeopleChange}
            />
            
            {/* Date Selection - Middle Column */}
            <div className="space-y-6 bg-white/10 p-6 rounded-xl">
              <DateSelector 
                checkInDate={formData.checkInDate}
                checkOutDate={formData.checkOutDate}
                onInputChange={handleInputChange}
              />
            </div>
            
            {/* Premium Plan - Right Column */}
            <PremiumPlanCard 
              isPremiumPlan={formData.isPremiumPlan}
              onToggle={handlePremiumPlanToggle}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center px-4 sm:px-0">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Hotel Selection</h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
                Browse through our selection of luxurious Hotels, each offering a unique and unforgettable experience.
              </p>
            </div>
            {/* Hotel Selection Component */}
            <div className="mt-8 sm:mt-12 -mx-4 sm:mx-0">
              <HotelSelection 
                hotels={hotels}
                onSelectHotel={(hotel) => {
                  setFormData(prev => ({
                    ...prev,
                    selectedHotel: hotel
                  }));
                }}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center px-4 sm:px-0">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Room Selection</h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
                Choose from our carefully curated selection of rooms, each designed for your comfort and relaxation.
              </p>
            </div>

            {formData.selectedHotel ? (
              <RoomSelection
                hotelId={formData.selectedHotel.id}
                selectedRooms={formData.selectedRooms}
                onSelectRoom={(rooms) => {
                  setFormData(prev => ({
                    ...prev,
                    selectedRooms: rooms,
                    totalPrice: calculateTotalPrice()
                  }));
                }}
                isPremiumPlan={formData.isPremiumPlan}
                guestCount={formData.numberOfPeople}
              />
            ) : (
              <div className="text-center text-gray-300 p-8 bg-white/5 rounded-xl backdrop-blur-sm">
                <p>Please select a hotel first.</p>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Go Back to Hotel Selection
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <ActivitiesSelection 
            activities={activities}
            selectedActivities={formData.selectedActivities}
            onActivityToggle={handleActivityToggle}
          />
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white mb-8">Ferry Tickets</h2>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              <FerryTickets 
                tickets={formData.ferryTickets}
                onTicketsChange={handleTicketsChange}
                isPremium={formData.isPremiumPlan}
                numberOfPeople={formData.numberOfPeople}
              />
              
              {formData.isPremiumPlan && (
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-300">Premium Plan Benefit: Unlimited Free Ferry Tickets</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <BookingReview 
            name={formData.name}
            email={formData.email}
            numberOfPeople={formData.numberOfPeople}
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
            selectedHotel={formData.selectedHotel}
            selectedRooms={formData.selectedRooms}
            selectedActivities={formData.selectedActivities}
            activities={activities}
            ferryTickets={formData.ferryTickets}
            isPremiumPlan={formData.isPremiumPlan}
            calculateTotalPrice={calculateTotalPrice}
          />
        )}

        {currentStep === 7 && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white mb-8">Payment</h2>
            <Payment 
              totalAmount={calculateTotalPrice()}
              onPaymentComplete={handlePaymentComplete}
              isPremiumPlan={formData.isPremiumPlan}
            />
          </div>
        )}

        {/* Confirmation Step after successful payment */}
        {currentStep === 8 && (
          <BookingConfirmation 
            totalAmount={calculateTotalPrice()}
            formData={formData}
            onConfirmation={handleConfirmation}
          />
        )}

        {/* Navigation and Total Price */}
        <div className="mt-12 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-gray-300 text-lg">Total Price:</span>
            <span className="text-3xl font-bold text-white">${calculateTotalPrice()}</span>
            {formData.isPremiumPlan && (
              <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-md border border-purple-500/30">
                Premium Plan
              </span>
            )}
          </div>

          <div className="flex space-x-4">
            {currentStep > 1 && currentStep !== 8 && !isPaymentComplete && (
              <button
                onClick={handlePrevious}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 8 && (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === 7 ? 'Confirm Payment' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}