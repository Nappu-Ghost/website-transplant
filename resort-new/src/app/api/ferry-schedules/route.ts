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
    const ferryId = searchParams.get('ferryId') || undefined;
    const schedules = await api.getFerrySchedules(ferryId || undefined);
    const schedulesArray = Array.isArray(schedules) ? schedules : [];
    return NextResponse.json(schedulesArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferry-schedules] Error fetching schedules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ferry schedules', detail: error.detail, schedules: [] },
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
    if (!data.ferryId || !data.departureTime) {
      return NextResponse.json(
        { error: 'Missing required fields: ferryId and departureTime are required.' },
        { status: 400 }
      );
    }

    const schedule = await api.createFerrySchedule(data, token);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /ferry-schedules POST] Error creating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ferry schedule', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
