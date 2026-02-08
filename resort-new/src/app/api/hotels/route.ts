import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function GET() {
  try {
    const hotels = await api.getHotels();
    const hotelsArray = Array.isArray(hotels) ? hotels : [];
    return NextResponse.json(hotelsArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /hotels] Error fetching hotels:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hotels', detail: error.detail, hotels: [] },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.name || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields: name and location are required.' },
        { status: 400 }
      );
    }

    const hotel = await api.createHotel(data, token);
    return NextResponse.json(hotel, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /hotels POST] Error creating hotel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create hotel', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
