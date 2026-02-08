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
    const ticket = await api.getFerryTicketById(params.id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ferry ticket not found' }, { status: 404 });
    }
    return NextResponse.json(ticket, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferry-tickets/[id]] Error fetching ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ferry ticket', detail: error.detail },
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
    const ticket = await api.updateFerryTicket(params.id, data, token);
    return NextResponse.json(ticket, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferry-tickets/[id] PUT] Error updating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ferry ticket', detail: error.detail },
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
    await api.deleteFerryTicket(params.id, token);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Route /ferry-tickets/[id] DELETE] Error deleting ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete ferry ticket', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
