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
    const room = await api.getRoomById(params.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json(room, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /rooms/[id]] Error fetching room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch room', detail: error.detail },
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
    const room = await api.updateRoom(params.id, data, token);
    return NextResponse.json(room, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /rooms/[id] PUT] Error updating room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update room', detail: error.detail },
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
    await api.deleteRoom(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /rooms/[id] DELETE] Error deleting room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete room', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
