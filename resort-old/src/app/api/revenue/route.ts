import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// Helper function to format date to YYYY-MM format
function formatMonthYear(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Helper to get month name from date
function getMonthName(date: Date): string {
  return date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
}

export async function GET(req: NextRequest) {
  try {
    // Get query params for date range filtering
    const { searchParams } = new URL(req.url);
    const months = Number(searchParams.get('months')) || 6; // Default to last 6 months
    
    // Calculate start date (X months ago from today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1); // Start of the month
    
    // Get all confirmed/completed bookings within the date range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['CONFIRMED', 'PAYMENT_COMPLETED', 'CHECKED_IN', 'CHECKED_OUT']
        }
      },
      include: {
        rooms: {
          include: {
            room: true
          }
        },
        activities: {
          include: {
            activity: true
          }
        },
        ferryTicket: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Create a map to store revenue by month
    const revenueByMonth = new Map<string, { 
      hotel: number,
      ferry: number, 
      activities: number, 
      total: number,
      bookingCount: number
    }>();
    
    // Initialize the map with all months in range
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(endDate);
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthKey = formatMonthYear(monthDate);
      
      revenueByMonth.set(monthKey, {
        hotel: 0,
        ferry: 0,
        activities: 0,
        total: 0,
        bookingCount: 0
      });
    }

    // Calculate revenue for each booking
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt);
      const monthKey = formatMonthYear(bookingDate);
      
      // Skip if the month is not in our range
      if (!revenueByMonth.has(monthKey)) return;
      
      const monthData = revenueByMonth.get(monthKey)!;
      
      // Calculate room revenue
      let hotelRevenue = 0;
      booking.rooms.forEach(bookingRoom => {
        hotelRevenue += bookingRoom.room.price;
      });
      
      // Calculate activity revenue
      let activityRevenue = 0;
      booking.activities.forEach(bookingActivity => {
        activityRevenue += bookingActivity.activity.price;
      });
      
      // Get ferry revenue
      const ferryRevenue = booking.ferryTicket?.price || 0;
      
      // Update monthly revenue
      monthData.hotel += hotelRevenue;
      monthData.activities += activityRevenue;
      monthData.ferry += ferryRevenue;
      monthData.total += booking.totalPrice;
      monthData.bookingCount += 1;
      
      revenueByMonth.set(monthKey, monthData);
    });
    
    // Convert map to array and sort by date
    const revenueData = Array.from(revenueByMonth.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          period: getMonthName(date),
          sortKey: key,
          ...value
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    // Calculate totals for summary
    const totalRevenue = {
      hotel: revenueData.reduce((sum, item) => sum + item.hotel, 0),
      ferry: revenueData.reduce((sum, item) => sum + item.ferry, 0),
      activities: revenueData.reduce((sum, item) => sum + item.activities, 0),
      total: revenueData.reduce((sum, item) => sum + item.total, 0),
      bookingCount: revenueData.reduce((sum, item) => sum + item.bookingCount, 0)
    };

    return NextResponse.json({
      monthly: revenueData,
      total: totalRevenue
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json({ error: 'Failed to generate revenue report' }, { status: 500 });
  }
}