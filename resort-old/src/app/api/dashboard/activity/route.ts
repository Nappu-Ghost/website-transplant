import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get query params
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get('days')) || 14; // Default to 14 days
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize daily data
    const dailyData = [];
    
    // Loop through each day in the range
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Set time to beginning of day for comparison
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      // Set time to end of day for comparison
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Count bookings for this day
      const bookingsCount = await prisma.booking.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });
      
      // Calculate daily revenue
      const dailyBookings = await prisma.booking.findMany({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        },
        select: {
          totalPrice: true
        }
      });
      
      const dailyRevenue = dailyBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      // Format date for display (YYYY-MM-DD)
      const formattedDate = date.toISOString().split('T')[0];
      
      dailyData.push({
        date: formattedDate,
        bookings: bookingsCount,
        revenue: dailyRevenue
      });
    }
    
    return NextResponse.json(dailyData);
  } catch (error) {
    console.error('Error fetching booking activity data:', error);
    return NextResponse.json({ error: 'Failed to fetch booking activity data' }, { status: 500 });
  }
}