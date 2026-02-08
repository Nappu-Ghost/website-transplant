import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hotels
export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(hotels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
  }
}

// POST /api/hotels
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, location, imageUrl, floors } = body;

    const hotel = await prisma.hotel.create({
      data: {
        name,
        description,
        location,
        imageUrl,
        floors: floors || 1
      }
    });

    return NextResponse.json(hotel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 });
  }
}

// PUT /api/hotels
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, location, imageUrl, floors } = body;

    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        name,
        description,
        location,
        imageUrl,
        floors: floors || 1
      }
    });

    return NextResponse.json(hotel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
  }
}

// DELETE /api/hotels
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    await prisma.hotel.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 });
  }
}
