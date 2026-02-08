import { PrismaClient, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const bookings = await prisma.booking.findMany({
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
        ferryTicket: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      userId,
      numberOfGuests,
      totalPrice,
      startDate,
      endDate,
      isPremium,
      rooms,
      activities,
      ferryTickets
    } = data;

    // Validate required fields
    if (!userId || !numberOfGuests || totalPrice === undefined || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rooms array
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json(
        { error: 'At least one room must be selected' },
        { status: 400 }
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      // 1. Create the main booking record
      const newBooking = await tx.booking.create({
        data: {
          userId,
          numberOfGuests,
          totalPrice,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isPremium,
          status: 'CONFIRMED'
        }
      });

      // 2. Create booking-room relationships
      await tx.bookingRoom.createMany({
        data: rooms.map((roomId: number) => ({
          bookingId: newBooking.id,
          roomId
        }))
      });

      // 3. Create booking-activity relationships if any
      if (activities && activities.length > 0) {
        await tx.bookingActivity.createMany({
          data: activities.map((activityId: number) => ({
            bookingId: newBooking.id,
            activityId
          }))
        });
      }

      // 4. Create ferry tickets if needed
      if (ferryTickets && ferryTickets.numberOfTickets > 0) {
        await tx.ferryTickets.create({
          data: {
            bookingId: newBooking.id,
            numberOfTickets: ferryTickets.numberOfTickets,
            price: ferryTickets.price
          }
        });
      }

      // 5. Return the complete booking with all relationships
      return tx.booking.findUnique({
        where: { id: newBooking.id },
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
          ferryTicket: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Error creating booking' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status } = data;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
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
        ferryTicket: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Error updating booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    // Delete related records first
    await prisma.$transaction([
      prisma.ferryTickets.deleteMany({
        where: { bookingId: id }
      }),
      prisma.bookingActivity.deleteMany({
        where: { bookingId: id }
      }),
      prisma.bookingRoom.deleteMany({
        where: { bookingId: id }
      }),
      prisma.booking.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Error deleting booking' }, { status: 500 });
  }
}
