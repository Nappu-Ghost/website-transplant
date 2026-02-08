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
  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};
    const hotelId = searchParams.get('hotelId');
    if (hotelId) filters.hotelId = hotelId;

    const rooms = await api.getRooms(Object.keys(filters).length > 0 ? filters : undefined);
    const roomsArray = Array.isArray(rooms) ? rooms : [];
    return NextResponse.json(roomsArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /rooms] Error fetching rooms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rooms', detail: error.detail, rooms: [] },
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
    if (!data.hotelId || !data.name || !data.type || data.price === undefined || data.capacity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: hotelId, name, type, price, capacity are required.' },
        { status: 400 }
      );
    }

    const room = await api.createRoom(data, token);
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /rooms POST] Error creating room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create room', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
