"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Activity {
  id: number;
  name: string;
  activityType: string;
  price: number;
  capacity: number | null;
  imageUrl: string;
  isPremium: boolean;
}

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/activities");
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        const data = await response.json();
        setActivities(data);
        setFilteredActivities(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load activities. Please try again later.");
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedType === "all") {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(
        (activity) => activity.activityType === selectedType
      );
      setFilteredActivities(filtered);
    }
  }, [selectedType, activities]);

  // Get unique activity types for filter buttons
  const activityTypes = [
    "all",
    ...Array.from(new Set(activities.map((a) => a.activityType))),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8 pt-28">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full rounded-xl overflow-hidden mb-12 shadow-xl border border-white/20">
        <Image
          src="/activities.jpg"
          alt="Island Activities"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 bg-black/30 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Island Activities & Experiences
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-gray-200">
            Discover amazing adventures across our islands - from thrilling rides to serene beach activities
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Activity Type Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {activityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-full text-sm md:text-base transition-all duration-300 ${
                selectedType === type
                  ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg hover:scale-105"
                  : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
              }`}
            >
              {type === "all" ? "All Activities" : type.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-white p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && (
          <>
            {filteredActivities.length === 0 ? (
              <div className="text-center text-white py-12">
                <p className="text-xl">No activities found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/20 transition-transform hover:scale-105 duration-300 relative flex flex-col h-full"
                  >
                    {activity.isPremium && (
                      <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-1 px-3 rounded-full text-xs md:text-sm shadow-lg">
                        PREMIUM
                      </div>
                    )}
                    <div className="relative p-6 flex-1 flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
                      {activity.imageUrl.endsWith('.svg') ? (
                        <div className="w-32 h-32 md:w-40 md:h-40 relative">
                          <Image
                            src={activity.imageUrl.startsWith('/') ? activity.imageUrl : `/${activity.imageUrl}`}
                            alt={activity.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-48">
                          <Image
                            src={activity.imageUrl.startsWith('/') ? activity.imageUrl : `/${activity.imageUrl}`}
                            alt={activity.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                          {activity.name}
                        </h3>
                        <span className="text-lg font-semibold text-white">
                          ${activity.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                          {activity.activityType.replace(/_/g, " ")}
                        </span>
                        {activity.capacity && (
                          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full ml-2">
                            Capacity: {activity.capacity}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/booking?activityId=${activity.id}`}
                        className="block text-center w-full mt-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity font-medium hover:scale-105 duration-300 border border-white/10"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Information Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/20">
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Activity Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium text-white mb-3">Booking Details</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Book activities in advance to ensure availability</li>
                <li>• Premium activities offer exclusive experiences</li>
                <li>• All activities include necessary equipment</li>
                <li>• Group discounts available for parties of 5 or more</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-3">Important Notes</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Weather conditions may affect availability</li>
                <li>• Arrive 15 minutes before scheduled time</li>
                <li>• Children must be accompanied by an adult</li>
                <li>• Cancellations must be made 24 hours in advance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
