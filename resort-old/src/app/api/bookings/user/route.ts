import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const bookings = await prisma.booking.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                hotel: true
              }
            }
          }
        },
        activities: {
          include: {
            activity: true
          }
        },
        ferryTicket: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ error: 'Error fetching user bookings' }, { status: 500 });
  }
}