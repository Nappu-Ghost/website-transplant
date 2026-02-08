import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { numberOfTickets, bookingId, isPremium } = body;

    const ferryTickets = await prisma.ferryTickets.create({
      data: {
        numberOfTickets,
        price: isPremium ? 0 : numberOfTickets * 5,
        bookingId,
      },
    });

    return NextResponse.json(ferryTickets);
  } catch (error) {
    console.error('Error creating ferry tickets:', error);
    return NextResponse.json(
      { error: 'Failed to create ferry tickets' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const ferryTickets = await prisma.ferryTickets.findUnique({
      where: {
        bookingId: parseInt(bookingId),
      },
    });

    return NextResponse.json(ferryTickets);
  } catch (error) {
    console.error('Error fetching ferry tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ferry tickets' },
      { status: 500 }
    );
  }
}