"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/admin/ThemeProvider";
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interface for revenue data
interface RevenueData {
  period: string;
  hotel: number;
  ferry: number;
  activities: number;
  total: number;
  bookingCount: number;
}

interface RevenueTotal {
  hotel: number;
  ferry: number;
  activities: number;
  total: number;
  bookingCount: number;
}

interface RevenueResponse {
  monthly: RevenueData[];
  total: RevenueTotal;
}

// Revenue card component
const RevenueCard = ({ 
  title, 
  amount, 
  icon, 
  percentage, 
  isPositive = true,
  isHighlight = false
}: { 
  title: string, 
  amount: number, 
  icon: React.ReactNode, 
  percentage?: number, 
  isPositive?: boolean,
  isHighlight?: boolean
}) => {
  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
      isHighlight 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
        : "bg-white dark:bg-gray-800 dark:text-white"
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm ${isHighlight ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{title}</p>
          <h3 className="text-2xl font-bold mt-1">${amount.toLocaleString()}</h3>
          {percentage !== undefined && (
            <p className={`text-sm mt-2 flex items-center ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}>
              {isPositive ? '↑' : '↓'} {percentage}%
              <span className={`ml-1 ${isHighlight ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                vs prev. month
              </span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          isHighlight ? "bg-white/20" : "bg-blue-100 dark:bg-gray-700"
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Revenue chart component with real data
const RevenueChart = ({ data }: { data: RevenueData[] }) => {
  const [activeTab, setActiveTab] = useState<'line' | 'bar'>('line');

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 p-6 bg-white dark:bg-gray-800 shadow"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Revenue Trends</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('line')} 
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'line' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Line
          </button>
          <button 
            onClick={() => setActiveTab('bar')} 
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Bar
          </button>
        </div>
      </div>
      <div className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="hotel" stroke="#4F46E5" name="Hotel" />
                <Line type="monotone" dataKey="ferry" stroke="#EC4899" name="Ferry" />
                <Line type="monotone" dataKey="activities" stroke="#10B981" name="Activities" />
                <Line type="monotone" dataKey="total" stroke="#F59E0B" name="Total" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="hotel" fill="#4F46E5" name="Hotel" />
                <Bar dataKey="ferry" fill="#EC4899" name="Ferry" />
                <Bar dataKey="activities" fill="#10B981" name="Activities" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 dark:text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Revenue table component with improved design
const RevenueTable = ({ data }: { data: RevenueData[] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hotel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ferry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Activities</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bookings</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.period}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.hotel.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.ferry.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.activities.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.total.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.bookingCount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                ${data.reduce((sum, item) => sum + item.hotel, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                ${data.reduce((sum, item) => sum + item.ferry, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                ${data.reduce((sum, item) => sum + item.activities, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                ${data.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                {data.reduce((sum, item) => sum + item.bookingCount, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<RevenueTotal | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate percentage change for the most recent month compared to previous
  const calculatePercentageChange = (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) return 0;
    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  };

  const getPercentageChanges = () => {
    if (revenueData.length < 2) return { total: 0, hotel: 0, ferry: 0, activities: 0 };
    
    // Get the last two months
    const current = revenueData[revenueData.length - 1];
    const previous = revenueData[revenueData.length - 2];
    
    return {
      total: calculatePercentageChange(current.total, previous.total),
      hotel: calculatePercentageChange(current.hotel, previous.hotel),
      ferry: calculatePercentageChange(current.ferry, previous.ferry),
      activities: calculatePercentageChange(current.activities, previous.activities)
    };
  };

  // Fetch revenue data based on the selected period
  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/revenue?months=${selectedPeriod}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        
        const data: RevenueResponse = await response.json();
        setRevenueData(data.monthly);
        setTotalRevenue(data.total);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRevenueData();
  }, [selectedPeriod]);

  // Calculate percentage changes
  const percentageChanges = getPercentageChanges();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Revenue Management</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="period" className="text-sm text-gray-400 dark:text-gray-300">
            Time Period:
          </label>
          <select
            id="period"
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => {
              // Create a CSV of the revenue data for download
              const headers = "Period,Hotel Revenue,Ferry Revenue,Activities Revenue,Total Revenue,Booking Count\n";
              const csvContent = revenueData.reduce((csv, row) => {
                return csv + 
                  `${row.period},${row.hotel},${row.ferry},${row.activities},${row.total},${row.bookingCount}\n`;
              }, headers);
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RevenueCard 
              title="Total Revenue" 
              amount={totalRevenue?.total || 0} 
              icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              percentage={percentageChanges.total}
              isPositive={percentageChanges.total >= 0}
              isHighlight={true}
            />
            <RevenueCard 
              title="Hotel Revenue" 
              amount={totalRevenue?.hotel || 0} 
              icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>}
              percentage={percentageChanges.hotel}
              isPositive={percentageChanges.hotel >= 0}
            />
            <RevenueCard 
              title="Ferry Revenue" 
              amount={totalRevenue?.ferry || 0} 
              icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              percentage={percentageChanges.ferry}
              isPositive={percentageChanges.ferry >= 0}
            />
            <RevenueCard 
              title="Activities Revenue" 
              amount={totalRevenue?.activities || 0} 
              icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              percentage={percentageChanges.activities}
              isPositive={percentageChanges.activities >= 0}
            />
          </div>

          {/* Revenue Chart */}
          <RevenueChart data={revenueData} />

          {/* Revenue Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white">Revenue Breakdown</h2>
            <RevenueTable data={revenueData} />
          </div>
          
          {/* Revenue Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Revenue Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 dark:text-white">Revenue Distribution</h3>
                {totalRevenue && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Hotel</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {totalRevenue.total > 0 
                            ? Math.round((totalRevenue.hotel / totalRevenue.total) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${totalRevenue.total > 0 
                            ? (totalRevenue.hotel / totalRevenue.total) * 100 
                            : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Ferry</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {totalRevenue.total > 0 
                            ? Math.round((totalRevenue.ferry / totalRevenue.total) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${totalRevenue.total > 0 
                            ? (totalRevenue.ferry / totalRevenue.total) * 100 
                            : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Activities</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {totalRevenue.total > 0 
                            ? Math.round((totalRevenue.activities / totalRevenue.total) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${totalRevenue.total > 0 
                            ? (totalRevenue.activities / totalRevenue.total) * 100 
                            : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 dark:text-white">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Bookings:</span>
                    <span className="font-medium dark:text-white">{totalRevenue?.bookingCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Average Revenue per Booking:</span>
                    <span className="font-medium dark:text-white">
                      ${totalRevenue && totalRevenue.bookingCount > 0 
                        ? Math.round(totalRevenue.total / totalRevenue.bookingCount).toLocaleString() 
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Most Profitable Month:</span>
                    <span className="font-medium dark:text-white">
                      {revenueData.length > 0 
                        ? revenueData.reduce((prev, current) => (prev.total > current.total) ? prev : current).period 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
