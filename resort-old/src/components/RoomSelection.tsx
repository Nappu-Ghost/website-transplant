"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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

interface RoomSelectionProps {
  hotelId: number;
  selectedRooms: Room[];
  onSelectRoom: (rooms: Room[]) => void;
  isPremiumPlan: boolean;
  guestCount: number;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({
  hotelId,
  selectedRooms,
  onSelectRoom,
  isPremiumPlan,
  guestCount,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    floorNumber: 'all',
    type: 'all',
    priceRange: 'all',
    capacity: 'all',
    showPremium: false,
  });
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'floor-asc' | 'floor-desc'>('price-asc');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`/api/rooms?hotelId=${hotelId}`);
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchRooms();
    }
  }, [hotelId]);

  const handleRoomSelect = (room: Room) => {
    if (!room.available) return;

    if (room.isPremium && !isPremiumPlan) {
      setError("Premium rooms are only available with the Premium Plan");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const isSelected = selectedRooms.some(r => r.id === room.id);
    let newSelectedRooms: Room[];

    if (isSelected) {
      newSelectedRooms = selectedRooms.filter(r => r.id !== room.id);
    } else {
      const currentCapacity = selectedRooms.reduce((total, r) => total + r.capacity, 0);
      if (currentCapacity < guestCount) {
        newSelectedRooms = [...selectedRooms, room];
      } else {
        newSelectedRooms = selectedRooms;
      }
    }

    onSelectRoom(newSelectedRooms);
  };

  const filteredRooms = rooms
    .filter(room => {
      const floorMatches = filters.floorNumber === 'all' || room.floorNumber === Number(filters.floorNumber);
      const typeMatches = filters.type === 'all' || room.type === filters.type;
      const hasCapacity = room.capacity >= guestCount;
      const isAvailable = room.available;

      if (filters.showPremium) {
        return floorMatches && typeMatches && hasCapacity && isAvailable && room.isPremium;
      }

      return floorMatches && typeMatches && hasCapacity && isAvailable;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'floor-asc':
          return a.floorNumber - b.floorNumber;
        case 'floor-desc':
          return b.floorNumber - a.floorNumber;
        default:
          return 0;
      }
    });

  const uniqueFloors = [...new Set(rooms.map(room => room.floorNumber))].sort((a, b) => a - b);
  const uniqueTypes = [...new Set(rooms.map(room => room.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8 bg-red-900/20 rounded-xl backdrop-blur-sm">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-white/5 p-6 rounded-xl backdrop-blur-sm">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Floor</label>
          <select
            value={filters.floorNumber}
            onChange={(e) => setFilters(prev => ({ ...prev, floorNumber: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-white/10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Floors</option>
            {uniqueFloors.map(floor => (
              <option key={floor} value={floor}>Floor {floor}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Room Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-white/10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="floor-asc">Floor: Low to High</option>
            <option value="floor-desc">Floor: High to Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Show Premium Only</label>
          <button
            onClick={() => setFilters(prev => ({ ...prev, showPremium: !prev.showPremium }))}
            className={`w-full px-3 py-2 rounded-lg transition-colors ${
              filters.showPremium
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            {filters.showPremium ? 'Premium Only' : 'Show All'}
          </button>
        </div>
      </div>

      <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="text-blue-300">
            <span className="font-semibold">Required Capacity:</span> {guestCount} guests
          </div>
          <div className="text-blue-300">
            <span className="font-semibold">Selected Capacity:</span> {selectedRooms.reduce((total, r) => total + r.capacity, 0)} / {guestCount}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map(room => (
          <div
            key={room.id}
            className={`bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border transition-all ${
              selectedRooms.some(r => r.id === room.id)
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="relative h-48">
              <Image
                src={room.imageUrl}
                alt={room.name}
                fill
                className="object-cover"
              />
              {room.isPremium && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Premium
                </div>
              )}
              {!room.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">Not Available</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{room.name}</h3>
                  <p className="text-gray-400">{room.type}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${room.price}</div>
                  <div className="text-sm text-gray-400">per night</div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">{room.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Floor {room.floorNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Up to {room.capacity} guests</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRoomSelect(room)}
                  disabled={!room.available || (room.isPremium && !isPremiumPlan)}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    selectedRooms.some(r => r.id === room.id)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : room.available
                      ? room.isPremium
                        ? isPremiumPlan
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-gray-600 cursor-not-allowed text-gray-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 cursor-not-allowed text-gray-300'
                  }`}
                >
                  {selectedRooms.some(r => r.id === room.id) 
                    ? 'Selected - Click to Remove' 
                    : !room.available 
                    ? 'Not Available'
                    : room.isPremium && !isPremiumPlan
                    ? 'Premium Plan Required'
                    : 'Select Room'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center text-gray-300 p-8 bg-white/5 rounded-xl backdrop-blur-sm">
          <p>No rooms found matching your criteria. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default RoomSelection;