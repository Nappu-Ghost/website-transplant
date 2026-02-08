import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};
    ['status', 'userId'].forEach((param) => {
      const value = searchParams.get(param);
      if (value) filters[param] = value;
    });

    const bookings = await api.getBookings(Object.keys(filters).length > 0 ? filters : undefined, token);
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    return NextResponse.json(bookingsArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /bookings] Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings', detail: error.detail, bookings: [] },
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
    if (!data.userId || !Array.isArray(data.roomIds) || data.roomIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and roomIds are required.' },
        { status: 400 }
      );
    }

    const booking = await api.createBooking(data, token);
    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /bookings POST] Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
