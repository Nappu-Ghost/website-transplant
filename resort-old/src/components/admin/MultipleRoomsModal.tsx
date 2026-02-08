"use client";

import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
import Image from "next/image";

type Hotel = PrismaClient['hotel']['create']['data'];

interface MultipleRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any[]) => void;
}

export default function MultipleRoomsModal({ isOpen, onClose, onSubmit }: MultipleRoomsModalProps) {
  const [formData, setFormData] = useState({
    hotelId: 0,
    type: "",
    roomsPerFloor: 1,
    price: 0,
    capacity: 2,
    description: "",
    imageUrl: "",
    isPremium: false,
    available: true, // Add available field
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        console.log('Fetched hotels:', data); // Debug log
        setHotels(data);
        if (data.length > 0) {
          const firstHotel = data[0];
          console.log('Selected first hotel:', firstHotel); // Debug log
          setFormData(prev => ({ ...prev, hotelId: firstHotel.id }));
          setSelectedHotel(firstHotel);
        }
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchRoomImages = async () => {
      try {
        const response = await fetch('/api/images/rooms');
        const data = await response.json();
        setRoomImages(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, imageUrl: data[0] }));
        }
      } catch (error) {
        console.error('Failed to fetch room images:', error);
      }
    };
    fetchRoomImages();
  }, []);

  const handleHotelChange = (hotelId: number) => {
    console.log('Changing hotel to:', hotelId); // Debug log
    const hotel = hotels.find(h => h.id === parseInt(hotelId.toString()));
    console.log('Found hotel:', hotel); // Debug log
    if (hotel) {
      setSelectedHotel(hotel);
      setSelectedFloors([]); // Reset floor selection when hotel changes
      setFormData(prev => ({
        ...prev,
        hotelId: hotel.id,
        roomsPerFloor: 1
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedHotel) {
      setError('Please select a hotel');
      return;
    }

    if (selectedFloors.length === 0) {
      setError('Please select at least one floor');
      return;
    }

    if (formData.roomsPerFloor <= 0) {
      setError('Rooms per floor must be greater than 0');
      return;
    }

    if (formData.roomsPerFloor > 20) {
      setError('Maximum 20 rooms per floor allowed');
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (!formData.type.trim()) {
      setError('Room type is required');
      return;
    }

    setLoading(true);

    try {
      // Generate hotel initials
      const initials = selectedHotel.name
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase();

      // Generate rooms for all selected floors
      const rooms = [];
      for (const floor of selectedFloors) {
        for (let roomNum = 1; roomNum <= formData.roomsPerFloor; roomNum++) {
          const roomNumber = `${floor}${roomNum.toString().padStart(2, '0')}`;
          
          rooms.push({
            name: `${initials} Room ${roomNumber}`,
            hotelId: selectedHotel.id,
            floorNumber: floor,
            type: formData.type,
            price: formData.price,
            capacity: formData.capacity,
            description: formData.description,
            imageUrl: formData.imageUrl,
            available: formData.available,
            isPremium: formData.isPremium,
          });
        }
      }

      // Send rooms to the API
      const response = await fetch('/api/rooms/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rooms),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create rooms');
      }

      onClose();
    } catch (error) {
      console.error('Error creating rooms:', error);
      setError(error instanceof Error ? error.message : 'Failed to create rooms');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-gray-900/80 rounded-xl p-8 w-full max-w-2xl"
        style={{
          background: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-white">
            Add Multiple Rooms
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hotel
              </label>
              <select
                value={formData.hotelId || ''}
                onChange={(e) => handleHotelChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center whitespace-nowrap">
                  <span className="text-purple-400 font-medium">
                    Number of Floors
                  </span>
                </div>
                <input
                  type="text"
                  value={selectedHotel?.floors || 1}
                  readOnly
                  className="w-16 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-center"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Select Floors
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(selectedHotel?.floors || 0)].map((_, index) => {
                  const floorNumber = index + 1;
                  return (
                    <label 
                      key={floorNumber} 
                      className={`
                        relative flex items-center justify-center p-3 rounded-xl cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${selectedFloors.includes(floorNumber)
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' 
                          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 text-gray-300'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFloors.includes(floorNumber)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFloors(prev => [...prev, floorNumber]);
                          } else {
                            setSelectedFloors(prev => prev.filter(f => f !== floorNumber));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">Floor {floorNumber}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Total rooms to be created: {selectedFloors.length * formData.roomsPerFloor}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                placeholder="e.g., Standard, Deluxe, Suite"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rooms per Floor
              </label>
              <input
                type="number"
                value={formData.roomsPerFloor}
                onChange={(e) => setFormData({ ...formData, roomsPerFloor: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                min="1"
                max="20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capacity per Room (persons)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, capacity: Math.max(1, prev.capacity - 1) }))}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 min-w-[60px] text-center">
                  {formData.capacity}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price per Night
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                rows={3}
                placeholder="Enter room description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room Image
              </label>
              <select
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="">Select an image</option>
                {roomImages.map((image) => (
                  <option key={image} value={image}>
                    {image.split('/').pop()}
                  </option>
                ))}
              </select>
              {formData.imageUrl && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700/50">
                  <Image
                    src={formData.imageUrl}
                    alt="Room preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="available" className="text-sm text-gray-300">
                  Available
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.available}
                  onClick={() => setFormData({ ...formData, available: !formData.available })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.available ? 'bg-blue-600' : 'bg-gray-700/50'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.available ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="isPremium" className="text-sm text-gray-300">
                  Premium Room
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isPremium}
                  onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.isPremium ? 'bg-blue-600' : 'bg-gray-700/50'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isPremium ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Rooms...
                </>
              ) : (
                'Create Rooms'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}