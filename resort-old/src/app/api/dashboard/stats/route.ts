import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the current date and the date 30 days ago for comparison
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    // Fetch current period bookings (last 30 days)
    const currentPeriodBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
          lte: today
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
        }
      }
    });
    
    // Fetch previous period bookings (30-60 days ago) for comparison
    const previousPeriodBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        },
        status: {
          in: ['CONFIRMED', 'PAYMENT_COMPLETED', 'CHECKED_IN', 'CHECKED_OUT']
        }
      }
    });
    
    // Count total users
    const totalUsers = await prisma.user.count();
    
    // Count active users (users with bookings in the last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const activeUsers = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: ninetyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    // Calculate current total revenue
    const currentRevenue = currentPeriodBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Calculate previous period revenue for comparison
    const previousRevenue = previousPeriodBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Calculate revenue percentage change
    const revenueChange = previousRevenue === 0 
      ? 100 // If previous was 0, technically it's a 100% increase
      : Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
    
    // Calculate booking percentage change
    const bookingChange = previousPeriodBookings.length === 0
      ? 100 // If previous was 0, technically it's a 100% increase
      : Math.round(((currentPeriodBookings.length - previousPeriodBookings.length) / previousPeriodBookings.length) * 100);
    
    // Calculate active users percentage change
    const previousActiveUsers = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 90)),
          lt: ninetyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    
    const userChange = previousActiveUsers.length === 0
      ? 100
      : Math.round(((activeUsers.length - previousActiveUsers.length) / previousActiveUsers.length) * 100);
    
    // Calculate occupancy rate
    const totalRooms = await prisma.room.count();
    
    // Get all currently booked rooms (where current date falls between startDate and endDate)
    const bookedRoomsCount = await prisma.bookingRoom.count({
      where: {
        booking: {
          startDate: {
            lte: today
          },
          endDate: {
            gte: today
          },
          status: {
            in: ['CONFIRMED', 'PAYMENT_COMPLETED', 'CHECKED_IN']
          }
        }
      }
    });
    
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((bookedRoomsCount / totalRooms) * 100);
    
    // Calculate previous occupancy rate for comparison
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 30);
    
    const previousBookedRoomsCount = await prisma.bookingRoom.count({
      where: {
        booking: {
          startDate: {
            lte: previousDate
          },
          endDate: {
            gte: previousDate
          },
          status: {
            in: ['CONFIRMED', 'PAYMENT_COMPLETED', 'CHECKED_IN']
          }
        }
      }
    });
    
    const previousOccupancyRate = totalRooms === 0 ? 0 : Math.round((previousBookedRoomsCount / totalRooms) * 100);
    const occupancyChange = previousOccupancyRate === 0
      ? occupancyRate > 0 ? 100 : 0
      : Math.round(((occupancyRate - previousOccupancyRate) / previousOccupancyRate) * 100);
    
    return NextResponse.json({
      totalBookings: {
        value: currentPeriodBookings.length,
        change: bookingChange,
        isPositive: bookingChange >= 0
      },
      revenue: {
        value: currentRevenue,
        change: revenueChange,
        isPositive: revenueChange >= 0
      },
      occupancyRate: {
        value: occupancyRate,
        change: occupancyChange,
        isPositive: occupancyChange >= 0
      },
      activeUsers: {
        value: activeUsers.length,
        change: userChange,
        isPositive: userChange >= 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}