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
    const activity = await api.getActivityById(params.id);
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    return NextResponse.json(activity, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /activities/[id]] Error fetching activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity', detail: error.detail },
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
    const activity = await api.updateActivity(params.id, data, token);
    return NextResponse.json(activity, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /activities/[id] PUT] Error updating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update activity', detail: error.detail },
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
    await api.deleteActivity(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /activities/[id] DELETE] Error deleting activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete activity', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
