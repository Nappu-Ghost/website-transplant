import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    // Get query params
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 5; // Default to 5 bookings
    
    // Fetch recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
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
      }
    });
    
    // Format bookings for display
    const formattedBookings = recentBookings.map(booking => {
      // Determine primary service type
      let serviceType = 'Accommodation';
      if (booking.rooms.length === 0 && booking.activities.length > 0) {
        serviceType = 'Activity';
      } else if (booking.ferryTicket) {
        serviceType = 'Ferry';
      }
      
      // Format details based on service type
      let serviceDetails = '';
      if (serviceType === 'Accommodation' && booking.rooms.length > 0) {
        const roomTypes = [...new Set(booking.rooms.map(br => br.room.type))];
        serviceDetails = roomTypes.join(', ');
      } else if (serviceType === 'Activity' && booking.activities.length > 0) {
        const activityNames = [...new Set(booking.activities.map(ba => ba.activity.name))];
        serviceDetails = activityNames.join(', ');
      } else if (serviceType === 'Ferry' && booking.ferryTicket) {
        serviceDetails = `${booking.ferryTicket.numberOfTickets} Tickets`;
      }
      
      // Format date relative to now
      const formattedDate = formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true });
      
      return {
        id: booking.id,
        name: booking.user.name,
        email: booking.user.email,
        date: formattedDate,
        service: `${serviceType}: ${serviceDetails}`,
        status: booking.status,
        totalPrice: booking.totalPrice
      };
    });
    
    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch recent bookings' }, { status: 500 });
  }
}