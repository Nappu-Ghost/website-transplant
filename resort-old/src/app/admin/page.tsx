"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/admin/ThemeProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Types for dashboard data
interface DashboardStats {
  totalBookings: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  revenue: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  occupancyRate: {
    value: number;
    change: number;
    isPositive: boolean;
  };
  activeUsers: {
    value: number;
    change: number;
    isPositive: boolean;
  };
}

interface RecentBooking {
  id: number;
  name: string;
  email: string;
  date: string;
  service: string;
  status: string;
  totalPrice: number;
}

interface ActivityData {
  date: string;
  bookings: number;
  revenue: number;
}

// Dashboard components
const StatCard = ({
  title,
  value,
  icon,
  trend,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  prefix?: string;
  suffix?: string;
}) => {
  const { theme } = useTheme();

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--glass-background)",
        borderColor: "var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="p-4 sm:p-6 flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1">
            {typeof value === "number" 
              ? `${prefix}${value.toLocaleString()}${suffix}` 
              : `${prefix}${value}${suffix}`
            }
          </h3>
          {trend && (
            <p
              className={`text-xs sm:text-sm mt-2 ${trend.isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="p-2 sm:p-3 rounded-full bg-blue-600 text-white"> {/* Changed styling to make icon visible */}
          {icon}
        </div>
      </div>
    </div>
  );
};

const RecentBookingItem = ({
  booking,
  onViewDetails
}: {
  booking: RecentBooking;
  onViewDetails: (id: number) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "payment_completed":
      case "checked_in":
      case "checked_out":
        return "bg-green-500 text-white"; // Changed to ensure text is visible
      case "pending":
        return "bg-yellow-500 text-black"; // Changed to ensure text is visible
      case "cancelled":
        return "bg-red-500 text-white"; // Changed to ensure text is visible
      default:
        return "bg-gray-500 text-white"; // Changed to ensure text is visible
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-700 border-opacity-50 gap-2 sm:gap-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
          {booking.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-sm sm:text-base">{booking.name}</p>
          <p className="text-xs sm:text-sm text-gray-400">{booking.date}</p>
        </div>
      </div>
      <div className="ml-11 sm:ml-0">
        <p className="text-xs sm:text-sm">{booking.service}</p>
      </div>
      <div className="ml-11 sm:ml-0 flex items-center gap-3">
        <div
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} inline-block sm:block`}
        >
          {booking.status.replace(/_/g, " ")}
        </div>
        <button 
          onClick={() => onViewDetails(booking.id)} 
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};

const ActivityChart = ({ data, activeChart }: { data: ActivityData[], activeChart: 'bookings' | 'revenue' }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {activeChart === 'bookings' ? (
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value, 'Bookings']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }}
          />
          <Legend />
          <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
        </BarChart>
      ) : (
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activeChart, setActiveChart] = useState<'bookings' | 'revenue'>('bookings');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch recent bookings
        const bookingsResponse = await fetch('/api/dashboard/recent-bookings?limit=5');
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch recent bookings');
        }
        const bookingsData = await bookingsResponse.json();
        setRecentBookings(bookingsData);
        
        // Fetch activity data
        const activityResponse = await fetch('/api/dashboard/activity?days=14');
        if (!activityResponse.ok) {
          throw new Error('Failed to fetch activity data');
        }
        const activityData = await activityResponse.json();
        setActivityData(activityData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please refresh the page to try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleViewBookingDetails = (id: number) => {
    // In the future, could navigate to booking details page
    window.location.href = `/admin/bookings/${id}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 border-opacity-30 rounded-xl p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats && (
              <>
                <StatCard
                  title="Total Bookings"
                  value={stats.totalBookings.value}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  trend={{
                    value: stats.totalBookings.change,
                    isPositive: stats.totalBookings.isPositive,
                  }}
                />
                <StatCard
                  title="Revenue"
                  value={stats.revenue.value}
                  prefix="$"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  trend={{
                    value: stats.revenue.change,
                    isPositive: stats.revenue.isPositive,
                  }}
                />
                <StatCard
                  title="Occupancy Rate"
                  value={stats.occupancyRate.value}
                  suffix="%"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  }
                  trend={{
                    value: stats.occupancyRate.change,
                    isPositive: stats.occupancyRate.isPositive,
                  }}
                />
                <StatCard
                  title="Active Users"
                  value={stats.activeUsers.value}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  }
                  trend={{
                    value: stats.activeUsers.change,
                    isPositive: stats.activeUsers.isPositive,
                  }}
                />
              </>
            )}
          </div>

          {/* Recent Bookings */}
          <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: "var(--glass-background)",
              borderColor: "var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">Recent Bookings</h2>
                <a href="/admin/bookings" className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors">
                  View All
                </a>
              </div>

              {recentBookings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400">No recent bookings found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentBookings.map((booking) => (
                    <RecentBookingItem
                      key={booking.id}
                      booking={booking}
                      onViewDetails={handleViewBookingDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Chart */}
          <div
            className="rounded-xl overflow-hidden transition-all duration-300 p-4 sm:p-6"
            style={{
              background: "var(--glass-background)",
              borderColor: "var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">Booking Activity</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveChart('bookings')}
                  className={`px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors ${
                    activeChart === 'bookings'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setActiveChart('revenue')}
                  className={`px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors ${
                    activeChart === 'revenue'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
            
            <div className="h-48 sm:h-64">
              {activityData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400 text-sm sm:text-base">No activity data available</p>
                </div>
              ) : (
                <ActivityChart data={activityData} activeChart={activeChart} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
