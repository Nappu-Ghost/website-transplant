import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
  hotelId: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  imageUrl: string;
  available: boolean;
  isPremium: boolean;
}

interface HotelSelectionProps {
  hotels: Hotel[];
  onSelectHotel: (hotel: Hotel) => void;
}

const HotelSelection: React.FC<HotelSelectionProps> = ({ hotels, onSelectHotel }) => {
  const [viewingHotel, setViewingHotel] = useState<Hotel | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [priceLevel, setPriceLevel] = useState<'low' | 'average' | 'high'>('average');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Sort hotels by name
  const sortedHotels = [...hotels].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // Set initial viewing hotel when hotels are loaded
    if (sortedHotels.length > 0 && !viewingHotel) {
      setViewingHotel(sortedHotels[0]);
    }
  }, [sortedHotels]);

  useEffect(() => {
    // Fetch rooms when viewing hotel changes
    const fetchRooms = async () => {
      if (!viewingHotel) return;
      
      setIsLoadingRooms(true);
      try {
        const response = await fetch(`/api/rooms?hotelId=${viewingHotel.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [viewingHotel]);

  const handleHotelView = (hotel: Hotel) => {
    setViewingHotel(hotel);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    onSelectHotel(hotel);
  };

  const getPrice = () => {
    if (!viewingHotel || rooms.length === 0) return 0;

    const roomPrices = rooms.map(room => room.price);
    const minPrice = Math.min(...roomPrices);
    const maxPrice = Math.max(...roomPrices);
    const avgPrice = roomPrices.reduce((a, b) => a + b, 0) / roomPrices.length;

    switch (priceLevel) {
      case 'low':
        return minPrice;
      case 'high':
        return maxPrice;
      default:
        return Math.round(avgPrice);
    }
  };

  if (hotels.length === 0) {
    return (
      <div className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] min-h-[500px] flex items-center justify-center">
        <div className="text-white">No hotels available</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] min-h-[500px]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 space-y-4 border-r border-white/20 pr-6">
          {sortedHotels.map((hotel) => (
            <button 
              key={hotel.id}
              onClick={() => handleHotelView(hotel)}
              className={`w-full py-3 px-4 rounded-full text-white font-medium transition-all backdrop-blur-sm border border-white/20 shadow-[0_4px_12px_0_rgba(31,38,135,0.37)] ${
                selectedHotel?.id === hotel.id
                  ? 'bg-green-500/30 hover:bg-green-500/40'
                  : viewingHotel?.id === hotel.id
                  ? 'bg-gradient-to-r from-purple-500/30 to-violet-500/30 hover:from-purple-500/40 hover:to-violet-500/40'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{hotel.name}</span>
                <span>
                  {selectedHotel?.id === hotel.id
                    ? 'Selected'
                    : viewingHotel?.id === hotel.id
                    ? 'Viewing'
                    : 'View'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Area */}
        <div className="w-3/4 pl-8">
          {viewingHotel ? (
            <>
              <div className="text-white">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-3/5">
                    <h2 className="text-5xl font-bold mb-4">{viewingHotel.name}</h2>
                    <p className="text-white/80 mb-6">
                      {viewingHotel.description}
                    </p>
                    <button 
                      onClick={() => handleHotelSelect(viewingHotel)}
                      className={`px-6 py-2 ${
                        selectedHotel?.id === viewingHotel.id 
                          ? 'bg-green-500/30 hover:bg-green-500/40' 
                          : 'bg-white/10 hover:bg-white/20'
                      } text-white rounded-full transition-all backdrop-blur-sm border border-white/20 shadow-[0_4px_12px_0_rgba(31,38,135,0.37)] flex items-center justify-center gap-2`}
                    >
                      {selectedHotel?.id === viewingHotel.id ? (
                        <>
                          <span>Selected</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </>
                      ) : (
                        'Select Hotel'
                      )}
                    </button>
                  </div>
                  
                  <div className="w-full md:w-2/5 flex flex-col gap-4">
                    <div className="h-[300px] relative rounded-lg overflow-hidden shadow-[0_4px_12px_0_rgba(31,38,135,0.37)] mb-6">
                      <Image
                        src={viewingHotel.imageUrl}
                        alt={viewingHotel.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="bg-red-400/30 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-[0_4px_12px_0_rgba(31,38,135,0.37)]">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-bold mb-2">Price Range</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setPriceLevel('low')} 
                              className={`w-12 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all ${
                                priceLevel === 'low' ? 'bg-yellow-500/30 shadow-[0_4px_12px_0_rgba(31,38,135,0.37)]' : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              <span className="text-sm">$</span>
                            </button>
                            <button 
                              onClick={() => setPriceLevel('average')} 
                              className={`w-12 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all ${
                                priceLevel === 'average' ? 'bg-yellow-500/30 shadow-[0_4px_12px_0_rgba(31,38,135,0.37)]' : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              <span className="text-sm">$$</span>
                            </button>
                            <button 
                              onClick={() => setPriceLevel('high')} 
                              className={`w-14 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all ${
                                priceLevel === 'high' ? 'bg-yellow-500/30 shadow-[0_4px_12px_0_rgba(31,38,135,0.37)]' : 'bg-white/10 hover:bg-white/20'
                              }`}
                            >
                              <span className="text-sm">$$$</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-white text-5xl font-bold">
                          {isLoadingRooms ? (
                            <div className="animate-pulse">...</div>
                          ) : (
                            `$${getPrice()}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white text-xl">Please select a hotel from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSelection;