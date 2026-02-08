import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const booking = await api.getBookingById(params.id, token);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /bookings/[id]] Error fetching booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const booking = await api.updateBooking(params.id, data, token);
    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /bookings/[id] PUT] Error updating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    await api.deleteBooking(params.id, token);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('[API Route /bookings/[id] DELETE] Error deleting booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete booking', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
