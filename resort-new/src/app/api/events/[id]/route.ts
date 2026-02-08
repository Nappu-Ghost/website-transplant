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
    const event = await api.getEventById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /events/[id]] Error fetching event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event', detail: error.detail },
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
    const event = await api.updateEvent(params.id, data, token);
    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /events/[id] PUT] Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event', detail: error.detail },
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
    await api.deleteEvent(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /events/[id] DELETE] Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
