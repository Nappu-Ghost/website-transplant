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
  try {
    const hotel = await api.getHotelById(params.id);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }
    return NextResponse.json(hotel, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /hotels/[id]] Error fetching hotel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hotel', detail: error.detail },
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
    const hotel = await api.updateHotel(params.id, data, token);
    return NextResponse.json(hotel, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /hotels/[id] PUT] Error updating hotel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update hotel', detail: error.detail },
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
    await api.deleteHotel(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /hotels/[id] DELETE] Error deleting hotel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete hotel', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
