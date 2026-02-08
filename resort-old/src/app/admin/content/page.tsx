"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/admin/ThemeProvider";
import HotelModal from '@/components/admin/HotelModal';
import RoomModal from '@/components/admin/RoomModal';
import MultipleRoomsModal from '@/components/admin/MultipleRoomsModal';
import ActivityModal from '@/components/admin/ActivityModal';
import Image from "next/image";

// Content types
type ContentType = "hotel" | "room" | "ferry" | "activities";

// Mock content data - in a real app, this would come from an API
interface ContentItem {
  id: number;
  name: string;
  type: ContentType;
  description: string;
  status: "active" | "inactive" | "draft";
  lastUpdated: Date;
  hotelId?: number; // Reference to parent hotel for rooms
  location?: string;
  imageUrl?: string;
  isPremium?: boolean;
  capacity?: number;
  price?: number;
  floors?: number;
}

const mockContent: ContentItem[] = [
  {
    id: 1,
    name: "Seaside Resort",
    type: "hotel",
    description: "Our main luxury hotel with ocean views",
    status: "active",
    lastUpdated: new Date("2025-03-15"),
  },
  {
    id: 2,
    name: "Deluxe Ocean Suite",
    type: "room",
    description: "Spacious suite with panoramic ocean views",
    status: "active",
    lastUpdated: new Date("2025-03-10"),
    hotelId: 1, // Reference to Seaside Resort
  },
  {
    id: 3,
    name: "Island Express",
    type: "ferry",
    description: "High-speed ferry service to the mainland",
    status: "active",
    lastUpdated: new Date("2025-03-05"),
  },
  {
    id: 4,
    name: "Adventure Island Activities",
    type: "activities",
    description: "Thrilling rides, attractions, and beach events for all ages",
    status: "active",
    lastUpdated: new Date("2025-03-12"),
  },
  {
    id: 5,
    name: "Sunset Beach Activities",
    type: "activities",
    description: "Weekly beach activities and entertainment programs",
    status: "active",
    lastUpdated: new Date("2025-03-18"),
  },
  {
    id: 6,
    name: "Mountain View Cabins",
    type: "hotel",
    description: "Cozy cabins with mountain views",
    status: "draft",
    lastUpdated: new Date("2025-03-20"),
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: ContentItem["status"] }) => {
  const getStatusColor = (status: ContentItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500 bg-opacity-10 text-white border border-green-500/30";
      case "inactive":
        return "bg-red-500 bg-opacity-10 text-white border border-red-500/30";
      case "draft":
        return "bg-yellow-500 bg-opacity-10 text-white border border-yellow-500/30";
      default:
        return "bg-gray-500 bg-opacity-10 text-white border border-gray-500/30";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Type badge component
const TypeBadge = ({ type }: { type: ContentType }) => {
  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case "hotel":
        return "bg-indigo-500 bg-opacity-10 text-white border border-indigo-500/30";
      case "room":
        return "bg-blue-500 bg-opacity-10 text-white border border-blue-500/30";
      case "ferry":
        return "bg-cyan-500 bg-opacity-10 text-white border border-cyan-500/30";
      case "activities":
        return "bg-purple-500 bg-opacity-10 text-white border border-purple-500/30";
      default:
        return "bg-gray-500 bg-opacity-10 text-white border border-gray-500/30";
    }
  };

  const getTypeDisplayName = (type: ContentType) => {
    switch (type) {
      case "hotel":
        return "Hotel";
      case "room":
        return "Room";
      case "ferry":
        return "Ferry";
      case "activities":
        return "Activities";
      default:
        return type;
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}
    >
      {getTypeDisplayName(type)}
    </span>
  );
};

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<ContentItem["status"] | "all">("all");
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isMultipleRoomsModalOpen, setIsMultipleRoomsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<ContentItem | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
    fetchActivities();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      const hotels = await response.json();
      
      // Convert the data to ContentItem format
      const hotelContent = hotels.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        type: 'hotel' as ContentType,
        description: hotel.description,
        status: 'active' as ContentItem["status"],
        lastUpdated: new Date(hotel.updatedAt),
        location: hotel.location,
        imageUrl: hotel.imageUrl,
        floors: hotel.floors,
      }));

      setContent(prevContent => [
        ...hotelContent,
        ...prevContent.filter(item => item.type !== 'hotel')
      ]);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = document.querySelectorAll('.dropdown-menu');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target as Node)) {
          dropdown.classList.add('hidden');
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter content based on search term, type, and status
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Add these functions to handle hotel operations
  const handleAddHotel = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create hotel');

      const newHotel = await response.json();
      setContent((prev) => [
        {
          ...newHotel,
          type: 'hotel',
          status: 'active',
          lastUpdated: new Date(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Error adding hotel:', error);
    }
  }, []);

  const handleEditHotel = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/hotels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: selectedHotel?.id }),
      });

      if (!response.ok) throw new Error('Failed to update hotel');

      const updatedHotel = await response.json();
      setContent((prev) =>
        prev.map((item) =>
          item.id === selectedHotel?.id
            ? {
                ...updatedHotel,
                type: 'hotel',
                status: item.status,
                lastUpdated: new Date(),
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating hotel:', error);
    }
  }, [selectedHotel]);

  const handleDeleteHotel = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/hotels?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete hotel');

      setContent((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  }, []);

  // Add these functions to handle room operations
  const handleAddRoom = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          hotelId: data.hotelId,
          type: data.type,
          price: data.price,
          capacity: data.capacity,
          description: data.description,
          imageUrl: data.imageUrl,
          available: data.available,
          isPremium: data.isPremium,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }

      const newRoom = await response.json();
      setRooms(prev => [...prev, newRoom]);
      setIsRoomModalOpen(false);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error instanceof Error ? error.message : 'Failed to create room');
    }
  }, []);

  const handleEditRoom = useCallback(async (data: any) => {
    try {
      const response = await fetch(`/api/rooms?id=${selectedRoom?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update room');
      }

      const updatedRoom = await response.json();
      setRooms(prev => prev.map(room => room.id === updatedRoom.id ? updatedRoom : room));
      setIsRoomModalOpen(false);
    } catch (error) {
      console.error('Error updating room:', error);
      alert(error instanceof Error ? error.message : 'Failed to update room');
    }
  }, [selectedRoom]);

  const handleDeleteRoom = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/rooms?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete room');
      }

      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete room');
    }
  }, []);

  // Add this new function to handle multiple room creation
  const handleAddMultipleRooms = useCallback(async (rooms: any[]) => {
    try {
      const response = await fetch('/api/rooms/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rooms),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create rooms');
      }

      const newRooms = await response.json();
      setRooms(prev => [...prev, ...newRooms]);
      setIsMultipleRoomsModalOpen(false);
    } catch (error) {
      console.error('Error creating rooms:', error);
      alert(error instanceof Error ? error.message : 'Failed to create rooms');
    }
  }, []);

  // Add these functions to handle activity operations
  const handleAddActivity = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create activity');

      const newActivity = await response.json();
      setActivities(prev => [newActivity, ...prev]);
      setIsActivityModalOpen(false);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }, []);

  const handleEditActivity = useCallback(async (data: any) => {
    try {
      const response = await fetch(`/api/activities?id=${selectedActivity?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update activity');

      const updatedActivity = await response.json();
      setActivities(prev =>
        prev.map(activity =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      setIsActivityModalOpen(false);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }, [selectedActivity]);

  const handleDeleteActivity = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete activity');

      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="space-x-2">
          <button
            onClick={() => {
              setSelectedHotel(null);
              setIsHotelModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Content
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-300 p-6 mb-8"
        style={{
          background: "var(--glass-background)",
          borderColor: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Search Content
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or description"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Filter by Type
            </label>
            <select
              id="type"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as ContentType | "all")
              }
            >
              <option value="all">All Types</option>
              <option value="hotel">Hotel</option>
              <option value="room">Room</option>
              <option value="ferry">Ferry</option>
              <option value="activities">Activities</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Filter by Status
            </label>
            <select
              id="status"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as ContentItem["status"] | "all",
                )
              }
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hotels Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Hotels</h2>
          <button
            onClick={() => {
              setSelectedHotel(null);
              setIsHotelModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Hotel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent
            .filter((item) => item.type === 'hotel')
            .map((hotel) => (
              <div
                key={hotel.id}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(31, 41, 55, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-48 overflow-hidden">
                  {hotel.imageUrl ? (
                    <Image
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">{hotel.name}</h3>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-indigo-400 font-medium">Hotel</span>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-1">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-purple-400 font-medium">{hotel.floors} {hotel.floors === 1 ? 'Floor' : 'Floors'}</span>
                        </div>
                        <StatusBadge status={hotel.status} />
                      </div>
                    </div>
                    {hotel.location && (
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/30 px-3 py-1 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{hotel.location}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">{hotel.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-400">
                        Updated {new Date(hotel.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setIsHotelModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          
          {/* Add New Hotel Card */}
          <button
            onClick={() => {
              setSelectedHotel(null);
              setIsHotelModalOpen(true);
            }}
            className="relative rounded-xl transition-all duration-300 border-2 border-dashed border-gray-600/50 hover:border-blue-500/50 flex items-center justify-center group h-full p-6"
            style={{
              background: "rgba(31, 41, 55, 0.3)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-300">Add New Hotel</p>
            </div>
          </button>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Rooms</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedRoom(null);
                setIsMultipleRoomsModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Multiple Rooms
            </button>
            <button
              onClick={() => {
                setSelectedRoom(null);
                setIsRoomModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Room
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(31, 41, 55, 0.4)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-48 overflow-hidden">
                {room.imageUrl ? (
                  <Image
                    src={room.imageUrl}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {room.isPremium && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    Premium
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">{room.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <span className="text-indigo-400 font-medium">{room.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/30 px-2 py-1 rounded-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">Capacity: {room.capacity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-400">${room.price}</span>
                      <span className="text-gray-400 text-sm">/night</span>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
                      room.available 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${room.available ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {room.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2 mt-3">{room.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-400">{room.hotel?.name || 'Unknown Hotel'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsRoomModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-sm">Delete</span>
                      </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Room Card */}
          <button
            onClick={() => {
              setSelectedRoom(null);
              setIsRoomModalOpen(true);
            }}
            className="relative rounded-xl transition-all duration-300 border-2 border-dashed border-gray-600/50 hover:border-blue-500/50 flex items-center justify-center group h-full p-6"
            style={{
              background: "rgba(31, 41, 55, 0.3)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-300">Add New Room</p>
            </div>
          </button>
        </div>
      </div>

      {/* Activities Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Activities</h2>
          <button
            onClick={() => {
              setSelectedActivity(null);
              setIsActivityModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Activity
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(31, 41, 55, 0.4)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-48 overflow-hidden">
                {activity.imageUrl ? (
                  <Image
                    src={activity.imageUrl}
                    alt={activity.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {activity.isPremium && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    Premium
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4 relative">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">{activity.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <span className="text-purple-400 font-medium">{activity.activityType}</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-blue-400">{activity.price === 0 ? 'Free' : `$${activity.price}`}</span>
                    </div>
                    {activity.capacity !== null && (
                      <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-indigo-400">Capacity: {activity.capacity === 0 ? 'Everyone' : activity.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{activity.description}</p>
                {activity.date && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => {
                      setSelectedActivity(activity);
                      setIsActivityModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Activity Card */}
          <button
            onClick={() => {
              setSelectedActivity(null);
              setIsActivityModalOpen(true);
            }}
            className="relative rounded-xl transition-all duration-300 border-2 border-dashed border-gray-600/50 hover:border-blue-500/50 flex items-center justify-center group h-full p-6"
            style={{
              background: "rgba(31, 41, 55, 0.3)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="text-center space-y-3 relative">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-300">Add New Activity</p>
            </div>
          </button>
        </div>
      </div>

      {/* Hotel Modal */}
      <HotelModal
        isOpen={isHotelModalOpen}
        onClose={() => {
          setIsHotelModalOpen(false);
          setSelectedHotel(null);
        }}
        onSubmit={selectedHotel ? handleEditHotel : handleAddHotel}
        initialData={selectedHotel ? {
          id: selectedHotel.id,
          name: selectedHotel.name,
          description: selectedHotel.description,
          location: selectedHotel.location || '',
          imageUrl: selectedHotel.imageUrl || '',
          floors: selectedHotel.floors || 1
        } : undefined}
      />

      {/* Room Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setSelectedRoom(null);
        }}
        onSubmit={selectedRoom ? handleEditRoom : handleAddRoom}
        initialData={selectedRoom}
      />

      {/* Add Multiple Rooms Modal */}
      <MultipleRoomsModal
        isOpen={isMultipleRoomsModalOpen}
        onClose={() => setIsMultipleRoomsModalOpen(false)}
        onSubmit={handleAddMultipleRooms}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedActivity(null);
        }}
        onSubmit={selectedActivity ? handleEditActivity : handleAddActivity}
        initialData={selectedActivity}
      />
    </div>
  );
}
