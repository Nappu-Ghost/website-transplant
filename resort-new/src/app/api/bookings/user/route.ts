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
    const userId = searchParams.get('userId') || undefined;

    const bookings = await api.getUserBookings(userId || undefined, token);
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    return NextResponse.json(bookingsArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /bookings/user] Error fetching user bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user bookings', detail: error.detail, bookings: [] },
      { status: error.status || 500 }
    );
  }
}
