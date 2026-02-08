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
    const ferry = await api.getFerryById(params.id);
    if (!ferry) {
      return NextResponse.json({ error: 'Ferry not found' }, { status: 404 });
    }
    return NextResponse.json(ferry, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferries/[id]] Error fetching ferry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ferry', detail: error.detail },
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
    const ferry = await api.updateFerry(params.id, data, token);
    return NextResponse.json(ferry, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferries/[id] PUT] Error updating ferry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ferry', detail: error.detail },
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
    await api.deleteFerry(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /ferries/[id] DELETE] Error deleting ferry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete ferry', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
