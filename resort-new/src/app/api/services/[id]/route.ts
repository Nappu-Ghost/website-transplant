import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

interface RouteParams {
  params: { id: string };
}

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const service = await api.getServiceById(params.id);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error('[API Route /services/[id]] Error fetching service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  console.log('[API Route /services/[id] PUT] Received headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  const token = getAuthToken(request);
  console.log('[API Route /services/[id] PUT] Token extracted by getAuthToken:', token);

  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const service = await api.updateService(params.id, data, token);
    return NextResponse.json(service);
  } catch (error: any) {
    console.error('[API Route /services/[id] PUT] Error updating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  console.log('[API Route /services/[id] DELETE] Received headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  const token = getAuthToken(request);
  console.log('[API Route /services/[id] DELETE] Token extracted by getAuthToken:', token);

  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    await api.deleteService(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /services/[id] DELETE] Error deleting service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}