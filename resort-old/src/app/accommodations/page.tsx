"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Hotel {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
  description?: string;
  rating?: number;
  amenities?: string[];
  floors: number;
}

interface Room {
  id: number;
  hotelId: number;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  imageUrl?: string;
  amenities?: string[];
}

const AccommodationsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string>("");

  // Fetch hotels on page load
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch("/api/hotels");
        if (!response.ok) {
          throw new Error(`Failed to fetch hotels: ${response.status}`);
        }
        const data = await response.json();
        setHotels(data);
        // If hotels are loaded, select the first one by default
        if (data && data.length > 0) {
          setSelectedHotel(data[0]);
        }
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotels. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Fetch rooms when a hotel is selected
  useEffect(() => {
    if (selectedHotel) {
      const fetchRooms = async () => {
        try {
          const response = await fetch(`/api/rooms?hotelId=${selectedHotel.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch rooms: ${response.status}`);
          }
          const data = await response.json();
          setRooms(data);
        } catch (err) {
          console.error("Error fetching rooms:", err);
          setError("Failed to load rooms. Please try again later.");
        }
      };

      fetchRooms();
    } else {
      setRooms([]);
    }
  }, [selectedHotel]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-100 rounded-lg">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <video 
            className="w-full h-full object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/accommodations.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Luxury Accommodations
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-8 animate-fade-in-delay">
            Experience unparalleled comfort and elegance at our world-class hotels and resorts.
          </p>
          <Link href="/booking" className="inline-block">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
              Book Your Stay
            </button>
          </Link>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Our Luxury Hotels
          </h2>
          
          {hotels.length === 0 ? (
            <div className="text-center text-white">
              <p>No hotels available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-white/20 cursor-pointer ${selectedHotel?.id === hotel.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedHotel(hotel)}
                >
                  <div className="aspect-[16/9] relative">
                    {hotel.imageUrl ? (
                      <Image
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  </div>
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{hotel.name}</h3>
                    <p className="text-gray-300 mb-4">{hotel.location}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-1">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-purple-400 font-medium">{hotel.floors} {hotel.floors === 1 ? 'Floor' : 'Floors'}</span>
                      </div>
                    </div>
                    {hotel.description && (
                      <p className="text-gray-300 mb-4 line-clamp-3">{hotel.description}</p>
                    )}
                    {hotel.rating && (
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < hotel.rating! ? 'text-yellow-400' : 'text-gray-400'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-gray-300">{hotel.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all duration-300">
                      View Rooms
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rooms Section */}
      {selectedHotel && (
        <section className="py-20 bg-black/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Rooms at {selectedHotel.name}
            </h2>
            <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
              Choose from our selection of luxurious rooms and suites, each designed for ultimate comfort and relaxation.
            </p>
            
            {rooms.length === 0 ? (
              <div className="text-center text-white p-8 bg-white/5 backdrop-blur-sm rounded-xl">
                <p>No rooms available for this hotel at the moment. Please check back later or select another hotel.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-white/20"
                  >
                    <div className="aspect-[16/9] relative">
                      {room.imageUrl ? (
                        <Image
                          src={room.imageUrl}
                          alt={room.type}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400">Room image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 text-white">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{room.type}</h3>
                        <div className="text-xl font-bold text-blue-400">${room.price}<span className="text-sm text-gray-400">/night</span></div>
                      </div>
                      <div className="mb-4">
                        <span className="text-gray-300">Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                      </div>
                      {room.description && (
                        <p className="text-gray-300 mb-4">{room.description}</p>
                      )}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Amenities</h4>
                          <ul className="grid grid-cols-2 gap-1">
                            {room.amenities.map((amenity, index) => (
                              <li key={index} className="flex items-center text-gray-300 text-sm">
                                <span className="mr-2 text-blue-400">•</span>
                                {amenity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Link href={`/booking?roomId=${room.id}&hotelId=${selectedHotel.id}`}>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all duration-300">
                          Book Now
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience Luxury?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your stay today and enjoy exclusive benefits and special offers.
          </p>
          <Link href="/booking">
            <button className="bg-white text-blue-900 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-gray-100">
              Reserve Your Room
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AccommodationsPage;