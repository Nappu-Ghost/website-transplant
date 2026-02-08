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
    const events = await api.getEvents();
    const eventsArray = Array.isArray(events) ? events : [];
    return NextResponse.json(eventsArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /events] Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events', detail: error.detail, events: [] },
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
    if (!data.name || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startDate, endDate are required.' },
        { status: 400 }
      );
    }

    const event = await api.createEvent(data, token);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /events POST] Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
