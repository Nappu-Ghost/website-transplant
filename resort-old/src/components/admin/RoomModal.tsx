"use client";

import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
import Image from "next/image";

type Hotel = PrismaClient['hotel']['create']['data'];

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: {
    id: number;
    name: string;
    hotelId: number;
    type: string;
    price: number;
    capacity: number;
    description: string;
    imageUrl: string;
    available: boolean;
    isPremium: boolean;
    floorNumber: number;
  };
}

export default function RoomModal({ isOpen, onClose, onSubmit, initialData }: RoomModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    hotelId: 0,
    type: "",
    price: 0,
    capacity: 1,
    description: "",
    imageUrl: "",
    available: true,
    isPremium: false,
    floorNumber: 1,
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const handleHotelChange = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === parseInt(hotelId.toString()));
    if (hotel) {
      setSelectedHotel(hotel);
      setFormData(prev => ({
        ...prev,
        hotelId: hotel.id,
        floorNumber: 1 // Reset floor number when hotel changes
      }));
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        hotelId: initialData.hotelId || 0,
        price: initialData.price || 0,
        capacity: initialData.capacity || 1,
        floorNumber: initialData.floorNumber || 1,
      });
    } else {
      setFormData({
        name: "",
        hotelId: 0,
        type: "",
        price: 0,
        capacity: 1,
        description: "",
        imageUrl: "",
        available: true,
        isPremium: false,
        floorNumber: 1,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        setHotels(data);
        if (data.length > 0 && !initialData) {
          const firstHotel = data[0];
          setSelectedHotel(firstHotel);
          setFormData(prev => ({ ...prev, hotelId: firstHotel.id }));
        } else if (data.length > 0 && initialData) {
          const hotel = data.find((h: Hotel) => h.id === initialData.hotelId);
          setSelectedHotel(hotel || null);
        }
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
      }
    };
    fetchHotels();
  }, [initialData]);

  useEffect(() => {
    const fetchRoomImages = async () => {
      try {
        const response = await fetch('/api/images/rooms');
        const data = await response.json();
        setRoomImages(data);
        if (data.length > 0 && initialData && !initialData.imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl: data[0] }));
        }
      } catch (error) {
        console.error('Failed to fetch room images:', error);
      }
    };
    fetchRoomImages();
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            {initialData ? "Edit Room" : "Add New Room"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                placeholder="Enter room name"
                required
              />
            </div>

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
                Price per Night
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capacity
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, capacity: Math.max(1, formData.capacity - 1) })}
                  className="px-3 py-2 rounded-l-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  className="w-16 px-4 py-2 bg-gray-800/50 border-t border-b border-gray-700/50 text-center text-white focus:outline-none"
                  min="1"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, capacity: formData.capacity + 1 })}
                  className="px-3 py-2 rounded-r-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Floor Number
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
                        ${formData.floorNumber === floorNumber 
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' 
                          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 text-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="floorNumber"
                        value={floorNumber}
                        checked={formData.floorNumber === floorNumber}
                        onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">Floor {floorNumber}</span>
                    </label>
                  );
                })}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700/50 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
            >
              {initialData ? "Update Room" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}