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
    const schedule = await api.getFerryScheduleById(params.id);
    if (!schedule) {
      return NextResponse.json({ error: 'Ferry schedule not found' }, { status: 404 });
    }
    return NextResponse.json(schedule, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferry-schedules/[id]] Error fetching schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ferry schedule', detail: error.detail },
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
    const schedule = await api.updateFerrySchedule(params.id, data, token);
    return NextResponse.json(schedule, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferry-schedules/[id] PUT] Error updating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ferry schedule', detail: error.detail },
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
    await api.deleteFerrySchedule(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /ferry-schedules/[id] DELETE] Error deleting schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete ferry schedule', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
