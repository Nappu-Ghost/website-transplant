import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const rooms = await request.json();

    // Validate the request body
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of rooms.' },
        { status: 400 }
      );
    }

    // Validate each room object
    for (const room of rooms) {
      if (!room.name || !room.hotelId || !room.type || !room.price || !room.capacity) {
        return NextResponse.json(
          { error: 'Each room must have name, hotelId, type, price, and capacity.' },
          { status: 400 }
        );
      }
    }

    // Create all rooms in a single transaction
    const createdRooms = await prisma.$transaction(
      rooms.map((room) =>
        prisma.room.create({
          data: room
        })
      )
    );

    return NextResponse.json(createdRooms);
  } catch (error) {
    console.error('Failed to create rooms:', error);
    return NextResponse.json(
      { error: 'Failed to create rooms' },
      { status: 500 }
    );
  }
} 