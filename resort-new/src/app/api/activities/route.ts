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
    const activities = await api.getActivities();
    const activitiesArray = Array.isArray(activities) ? activities : [];
    return NextResponse.json(activitiesArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /activities] Error fetching activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities', detail: error.detail, activities: [] },
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
    if (!data.name || !data.activityType || data.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, activityType, price are required.' },
        { status: 400 }
      );
    }

    const activity = await api.createActivity(data, token);
    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /activities POST] Error creating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create activity', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
